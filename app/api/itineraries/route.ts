import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Itinerary from "@/models/Itinerary"
import { verifyAuth } from "@/lib/server-auth"

interface ApiErrorResponse {
  error: string
  message: string
  code: string
  details?: any
  timestamp: string
  requestId: string
}

function createErrorResponse(
  error: string,
  message: string,
  code: string,
  status: number,
  details?: any,
  requestId?: string,
): NextResponse<ApiErrorResponse> {
  const errorResponse: ApiErrorResponse = {
    error,
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
    requestId: requestId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }

  // Log error with structured format
  console.error("[API Error]", {
    ...errorResponse,
    status,
    stack: details?.stack,
  })

  return NextResponse.json(errorResponse, { status })
}

function validateRequiredFields(data: any, requiredFields: string[]): string[] {
  return requiredFields.filter((field) => {
    const value = data[field]
    return value === undefined || value === null || (typeof value === "string" && value.trim() === "")
  })
}

async function connectWithRetry(maxRetries = 3): Promise<void> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await connectToDatabase()
      return
    } catch (error) {
      lastError = error as Error
      console.warn(`[API] Database connection attempt ${attempt}/${maxRetries} failed:`, error)

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || `req-${Date.now()}`

  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    await connectWithRetry()
    const url = new URL(request.url)
    const title = url.searchParams.get("title")
    const createdBy = url.searchParams.get("createdBy")

    // Build a flexible query: FILTER BY USER and optionally title
    const query: any = {
      userId: user.uid, // Only show this user's itineraries
      $or: [
        { isQuotationOnly: { $ne: true } },
        { isQuotationOnly: { $exists: false } },
      ],
    }

    if (title && title.trim()) {
      // Case-insensitive exact match for title
      query.title = { $regex: `^${title.trim().replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&")}$`, $options: "i" }
    }

    if (createdBy && createdBy.trim()) {
      query.createdBy = createdBy.trim()
    }

    const itineraries = await Itinerary.find(query).sort({ createdAt: -1 })

    return NextResponse.json({
      data: itineraries,
      count: itineraries.length,
      timestamp: new Date().toISOString(),
      requestId,
    })
  } catch (error) {
    const err = error as Error

    if (err.message.includes("connection") || err.message.includes("ECONNREFUSED")) {
      return createErrorResponse(
        "Database Connection Failed",
        "Unable to connect to the database. Please try again later.",
        "DATABASE_CONNECTION_ERROR",
        503,
        { originalError: err.message },
        requestId,
      )
    }

    if (err.message.includes("timeout")) {
      return createErrorResponse(
        "Request Timeout",
        "The request took too long to process. Please try again.",
        "TIMEOUT_ERROR",
        408,
        { originalError: err.message },
        requestId,
      )
    }

    return createErrorResponse(
      "Internal Server Error",
      "An unexpected error occurred while fetching itineraries.",
      "INTERNAL_SERVER_ERROR",
      500,
      { originalError: err.message },
      requestId,
    )
  }
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || `req-${Date.now()}`

  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    await connectWithRetry()

    let data: any
    try {
      data = await request.json()
    } catch (parseError) {
      return createErrorResponse(
        "Invalid JSON",
        "The request body contains invalid JSON.",
        "JSON_PARSE_ERROR",
        400,
        { parseError: (parseError as Error).message },
        requestId,
      )
    }

    console.log("[v0] API received itinerary data:", JSON.stringify(data, null, 2))

    // Validation: destination and description are MANDATORY for all itineraries
    const validationErrors: string[] = []

    // Check description is not empty
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      validationErrors.push("description is required and cannot be empty")
    }

    // Check destination is not empty
    if (!data.destination || typeof data.destination !== 'string' || data.destination.trim().length === 0 || data.destination === "Multiple Destinations") {
      validationErrors.push("destination is required and cannot be empty")
    }

    if (data.totalPrice && (isNaN(Number(data.totalPrice)) || Number(data.totalPrice) < 0)) {
      validationErrors.push("totalPrice must be a non-negative number")
    }

    if (data.days && !Array.isArray(data.days)) {
      validationErrors.push("days must be an array")
    }

    if (
      data.clientDetails?.groupSize &&
      (isNaN(Number(data.clientDetails.groupSize)) || Number(data.clientDetails.groupSize) <= 0)
    ) {
      validationErrors.push("groupSize must be a positive number")
    }

    if (validationErrors.length > 0) {
      return createErrorResponse(
        "Data Validation Failed",
        "Invalid data types or values provided.",
        "DATA_VALIDATION_ERROR",
        400,
        { validationErrors },
        requestId,
      )
    }

    const processedData = {
      ...data,
      // Inject user fields
      userId: user.uid,
      userEmail: user.email,
      createdByUser: user.displayName || user.email,
      totalPrice: Number(data.totalPrice) || 0,
      currency: data.currency || "USD",

      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      images: Array.isArray(data.images) ? data.images : [],
      days: Array.isArray(data.days) ? data.days : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // The frontend now intercepts duplicate titles and converts the request to a PUT.
    // If a POST reaches here with a duplicate title, we just let it create a duplicate
    // (e.g., if the user intentionally bypassed the check or rapid-fired).
    // The strict uniqueness on title per user is enforced structurally at the UX level.

    const itinerary = new Itinerary(processedData)

    console.log("[v0] Creating itinerary with processed data:", itinerary)

    await itinerary.save()
    console.log("[v0] Successfully saved itinerary:", itinerary._id)

    return NextResponse.json(
      {
        data: itinerary,
        message: "Itinerary created successfully",
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    const err = error as any

    console.error("[v0] API Error creating itinerary:", err)

    if (err.name === "ValidationError") {
      const validationErrors = Object.keys(err.errors).map((key) => ({
        field: key,
        message: err.errors[key].message,
        value: err.errors[key].value,
      }))

      console.error("[v0] MONGOOSE VALIDATION ERRORS:", JSON.stringify(validationErrors, null, 2))

      return createErrorResponse(
        "Mongoose Validation Failed",
        "The provided data failed database validation.",
        "MONGOOSE_VALIDATION_ERROR",
        400,
        { validationErrors, modelErrors: err.errors },
        requestId,
      )
    }

    if (err.code === 11000) {
      // Duplicate key error
      const duplicateField = Object.keys(err.keyPattern || {})[0] || "unknown"
      return createErrorResponse(
        "Duplicate Entry",
        `A record with this ${duplicateField} already exists.`,
        "DUPLICATE_KEY_ERROR",
        409,
        {
          duplicateField,
          duplicateValue: err.keyValue?.[duplicateField],
          keyPattern: err.keyPattern,
        },
        requestId,
      )
    }

    if (err.message?.includes("connection") || err.message?.includes("ECONNREFUSED")) {
      return createErrorResponse(
        "Database Connection Failed",
        "Unable to connect to the database. Please try again later.",
        "DATABASE_CONNECTION_ERROR",
        503,
        { originalError: err.message },
        requestId,
      )
    }

    if (err.message?.includes("timeout")) {
      return createErrorResponse(
        "Database Timeout",
        "The database operation took too long. Please try again.",
        "DATABASE_TIMEOUT_ERROR",
        408,
        { originalError: err.message },
        requestId,
      )
    }

    // Generic server error
    return createErrorResponse(
      "Internal Server Error",
      "An unexpected error occurred while creating the itinerary.",
      "INTERNAL_SERVER_ERROR",
      500,
      {
        originalError: err.message,
        errorName: err.name,
        errorCode: err.code,
      },
      requestId,
    )
  }
}
