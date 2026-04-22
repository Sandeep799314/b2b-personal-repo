import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"
import { recalculateQuotationTotals } from "@/lib/pricing-utils"

// GET /api/quotations/[id]
export async function GET(
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

    const quotation = await Quotation.findById(id)

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    return NextResponse.json(quotation)
  } catch (error) {
    console.error("Error fetching quotation:", error)
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 })
  }
}

// PUT /api/quotations/[id]
export async function PUT(
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

    const payload = await request.json()
    const { versionDescription, ...updateData } = payload

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Update pricing options if provided
    if (updateData.pricingOptions) {
      // Use the recalculation function to get updated pricing
      const recalculatedQuotation = recalculateQuotationTotals({
        ...quotation.toObject(),
        pricingOptions: {
          ...quotation.pricingOptions,
          ...updateData.pricingOptions
        }
      });

      // Update all the pricing fields
      updateData.pricingOptions = recalculatedQuotation.pricingOptions;
      updateData.subtotal = recalculatedQuotation.subtotal;
      updateData.markup = recalculatedQuotation.markup;
      updateData.total = recalculatedQuotation.total;
      updateData.totalPrice = recalculatedQuotation.total; // For backward compatibility
    }

    // Get the current version
    // Ensure version history array exists
    if (!Array.isArray(quotation.versionHistory)) {
      quotation.versionHistory = []
    }

    const getSnapshotState = () => {
      const quotationSnapshot = quotation.toObject()
      return {
        days: quotationSnapshot.days,
        pricingOptions: quotationSnapshot.pricingOptions,
        subtotal: quotationSnapshot.subtotal,
        markup: quotationSnapshot.markup,
        total: quotationSnapshot.total,
        currencySettings: quotationSnapshot.currencySettings
      }
    }

    const currentVersion = quotation.currentVersion || 1
    let versionIndex = quotation.versionHistory.findIndex(
      (v: any) => v.versionNumber === currentVersion
    )

    const nextVersionNumber = () => {
      return (
        quotation.versionHistory.reduce(
          (max: number, version: any) => Math.max(max, version.versionNumber || 0),
          0
        ) + 1
      )
    }

    // If there is no entry for the current version, seed one
    if (versionIndex === -1) {
      const fallbackVersion = currentVersion || nextVersionNumber()
      quotation.versionHistory.push({
        versionNumber: fallbackVersion,
        createdAt: new Date(),
        description: versionDescription || "Auto-created draft version",
        isLocked: false,
        isDraft: true,
        state: getSnapshotState()
      })
      quotation.currentVersion = fallbackVersion
      versionIndex = quotation.versionHistory.length - 1
    }

    // If the current version is locked, create a new draft version that can be edited
    if (quotation.versionHistory[versionIndex]?.isLocked) {
      const newVersionNumber = nextVersionNumber()
      quotation.versionHistory.push({
        versionNumber: newVersionNumber,
        createdAt: new Date(),
        description: versionDescription || "Draft created from locked version",
        isLocked: false,
        isDraft: true,
        state: getSnapshotState()
      })
      quotation.currentVersion = newVersionNumber
      quotation.isLocked = false
      quotation.isDraft = true
      versionIndex = quotation.versionHistory.length - 1
    }

    // Update version metadata
    if (versionDescription && quotation.versionHistory[versionIndex]) {
      quotation.versionHistory[versionIndex].description = versionDescription
    }
    if (quotation.versionHistory[versionIndex]) {
      quotation.versionHistory[versionIndex].isDraft = true
    }

    // Guard against client attempts to override version meta
    if ("versionHistory" in updateData) {
      delete (updateData as any).versionHistory
    }
    if ("currentVersion" in updateData) {
      delete (updateData as any).currentVersion
    }

    // Check if we are updating status to a "locked" state
    if (updateData.status && ["sent", "accepted", "rejected", "expired"].includes(updateData.status)) {
      if (quotation.versionHistory[versionIndex]) {
        quotation.versionHistory[versionIndex].isLocked = true
        quotation.versionHistory[versionIndex].lockedAt = new Date()
        quotation.versionHistory[versionIndex].isDraft = false
      }
      quotation.isLocked = true
      quotation.isDraft = false
    }

    // Update quotation fields
    // Only set back to draft if we are NOT intentionally locking it
    if (!quotation.isLocked) {
      quotation.isDraft = true
    }

    quotation.set(updateData)

    quotation.markModified("versionHistory")

    const updatedQuotation = await quotation.save()

    return NextResponse.json(updatedQuotation)
  } catch (error) {
    console.error("Error updating quotation:", error)
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 })
  }
}

// DELETE /api/quotations/[id]
export async function DELETE(
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

    const quotation = await Quotation.findByIdAndDelete(id)

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Quotation deleted successfully" })
  } catch (error) {
    console.error("Error deleting quotation:", error)
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 })
  }
}
