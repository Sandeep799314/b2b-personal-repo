import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"

// Helper to capture a full snapshot of the quotation state
const snapshotQuotationState = (q: any) => {
  return {
    days: q.days || [],
    pricingOptions: q.pricingOptions || {},
    subtotal: q.subtotal || 0,
    markup: q.markup || 0,
    total: q.total || 0,
    currencySettings: q.currencySettings || {},
    title: q.title || "",
    description: q.description || "",
    countries: q.countries || [],
    destination: q.destination || "",
    duration: q.duration || "",
    totalPrice: q.totalPrice || 0,
    currency: q.currency || "USD",
    type: q.type || "customized-package",
    cartItems: q.cartItems || [],
    htmlContent: q.htmlContent || "",
    htmlBlocks: q.htmlBlocks || [],
    serviceSlots: q.serviceSlots || [],
    branding: q.branding || {},
    gallery: q.gallery || [],
    highlights: q.highlights || [],
    images: q.images || [],
    overviewEvents: q.overviewEvents || [],
    notes: q.notes || "",
    productId: q.productId || "",
    productReferenceCode: q.productReferenceCode || ""
  }
}

// POST /api/quotations/[id]/versions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await connectDB()

    // Await params before accessing properties
    const { id } = await params

    // Validate if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid quotation ID format" }, { status: 400 })
    }

    // Get the version description from the request body
    const { description } = await request.json()

    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "Version description is required" }, { status: 400 })
    }

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Check if current version is locked (prevent creating new version from a locked one)
    // Actually, usually you WANT to create a new version from a locked one.
    // But the current logic says if isLocked is true, it's finalized.

    // 1. Snapshot the CURRENT state
    const currentState = snapshotQuotationState(quotation)

    // 2. Finalize the PREVIOUS version if it was a draft
    const currentVersionNumber = quotation.currentVersion || 1
    const currentIndex = quotation.versionHistory?.findIndex((v: any) => v.versionNumber === currentVersionNumber)
    
    if (currentIndex !== -1 && quotation.versionHistory) {
        quotation.versionHistory[currentIndex].state = currentState
        quotation.versionHistory[currentIndex].isDraft = false
        quotation.versionHistory[currentIndex].isLocked = true
    }

    // 3. Determine the next version number
    const nextVersion = (quotation.versionHistory?.length || 0) + 1

    // 4. Create a new version entry with current data
    if (!quotation.versionHistory) quotation.versionHistory = []
    
    quotation.versionHistory.push({
      versionNumber: nextVersion,
      createdAt: new Date(),
      description,
      isLocked: false,
      state: currentState,
      isDraft: true
    })

    // 5. Update current version and mark as draft
    quotation.currentVersion = nextVersion
    quotation.isDraft = true

    // Mark modified for Mongoose
    quotation.markModified("versionHistory")

    // Save changes
    await quotation.save()

    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error creating new quotation version:", error)
    return NextResponse.json({ error: "Failed to create new version" }, { status: 500 })
  }
}
