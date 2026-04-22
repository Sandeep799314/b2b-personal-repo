import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"

// POST /api/quotations/[id]/lock
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

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Body can only be read once; parse and destructure in a single call
    const { userName, versionNumber } = await request.json()
    const parsedVersionNumber =
      typeof versionNumber === "number" ? versionNumber : Number(versionNumber)

    if (!parsedVersionNumber || Number.isNaN(parsedVersionNumber)) {
      return NextResponse.json({ error: "Version number is required" }, { status: 400 })
    }

    // Initialize version history if it doesn't exist
    if (!quotation.versionHistory) {
      quotation.versionHistory = []
    }

    // Find the specified version in history
    const versionIndex = quotation.versionHistory.findIndex(
      (v: any) => v.versionNumber === parsedVersionNumber
    )

    // Check if version exists and is not already locked
    if (versionIndex === -1) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    if (quotation.versionHistory[versionIndex].isLocked) {
      return NextResponse.json({ error: "This version is already locked" }, { status: 400 })
    }

    // Check if version has unsaved changes (is a draft)
    if (quotation.versionHistory[versionIndex].isDraft) {
      return NextResponse.json({ error: "Cannot lock a draft version. Please save changes first." }, { status: 400 })
    }

    if (versionIndex >= 0) {
      // Update existing version entry
      quotation.versionHistory[versionIndex].isLocked = true
      quotation.versionHistory[versionIndex].lockedBy = userName || "Unknown user"
      quotation.versionHistory[versionIndex].lockedAt = new Date()
    } else {
      // Add current version to history if not found
      const quotationSnapshot = quotation.toObject()
      quotation.versionHistory.push({
        versionNumber: parsedVersionNumber,
        createdAt: new Date(),
        description: "Version locked",
        isLocked: true,
        lockedBy: userName || "Unknown user",
        lockedAt: new Date(),
        state: {
          days: quotationSnapshot.days,
          pricingOptions: quotationSnapshot.pricingOptions,
          subtotal: quotationSnapshot.subtotal,
          markup: quotationSnapshot.markup,
          total: quotationSnapshot.total,
          currencySettings: quotationSnapshot.currencySettings
        },
        isDraft: false
      })
    }

    quotation.isLocked = true
    quotation.isDraft = false
    quotation.markModified("versionHistory")

    // Save changes
    await quotation.save()

    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error locking quotation version:", error)
    return NextResponse.json({ error: "Failed to lock version" }, { status: 500 })
  }
}
