import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"
import { verifyAuth } from "@/lib/server-auth"

// PUT /api/quotations/[id]/currency
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB()

    // Await params before accessing properties
    const { id } = await params

    // Validate if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid quotation ID format" }, { status: 400 })
    }

    // Get the currency settings from the request body
    const { currencySettings } = await request.json()

    if (!currencySettings) {
      return NextResponse.json({ error: "Currency settings are required" }, { status: 400 })
    }

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Check ownership
    if (quotation.userId !== user.uid) {
      return NextResponse.json({ error: "Unauthorized - You do not own this quotation" }, { status: 403 });
    }

    // Update currency settings
    quotation.currencySettings = currencySettings

    // Save changes
    await quotation.save()

    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error updating currency settings:", error)
    return NextResponse.json({ error: "Failed to update currency settings" }, { status: 500 })
  }
}