import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"

// POST /api/quotations/[id]/save
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

    // Parse the request body
    let payload = {};
    try {
      payload = await request.json();
    } catch (e) {
      // Body might be empty, which is fine, we'll just use existing DB state (fallback to old behavior)
      console.log("No payload provided to save endpoint, using existing DB state");
    }

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Initialize version history if it doesn't exist (first-time save)
    if (!quotation.versionHistory || quotation.versionHistory.length === 0) {
      console.log(`[QUOTATION SAVE] Initializing version history for quotation ${id}`);
      quotation.currentVersion = 1;
      quotation.versionHistory = [{
        versionNumber: 1,
        timestamp: new Date(),
        isDraft: true,
        isLocked: false,
        state: {
          days: quotation.days || [],
          pricingOptions: quotation.pricingOptions || {
            showIndividualPrices: true,
            showSubtotals: true,
            showTotal: true,
            markupType: "percentage",
            markupValue: 0,
            originalTotalPrice: 0,
            finalTotalPrice: 0
          },
          subtotal: quotation.subtotal || 0,
          markup: quotation.markup || 0,
          total: quotation.total || 0,
          currencySettings: quotation.currencySettings
        }
      }];
    }

    // Get the current version
    const currentVersion = quotation.currentVersion || 1
    const versionIndex = quotation.versionHistory?.findIndex(
      (v: any) => v.versionNumber === currentVersion
    )

    if (versionIndex === -1) {
      return NextResponse.json({
        error: "Current version not found in history",
        details: `Version ${currentVersion} not found. Available versions: ${quotation.versionHistory?.map((v: any) => v.versionNumber).join(', ')}`
      }, { status: 404 })
    }

    // If this version is locked, prevent updates
    if (quotation.versionHistory[versionIndex].isLocked) {
      return NextResponse.json({ error: "Cannot update a locked version" }, { status: 400 })
    }

    // Update Quotation Fields from Payload (if provided)
    // This ensures the "Draft" document is always up to date with the frontend
    if (Object.keys(payload).length > 0) {
      const allowedUpdates = [
        "days", "pricingOptions", "client", "currencySettings",
        "subtotal", "markup", "total", "notes", "title", "description",
        "validUntil", "totalPrice"
      ];

      allowedUpdates.forEach(key => {
        if (key in payload) {
          quotation[key] = (payload as any)[key];
        }
      });

      // Explicitly recalculate totals if pricingOptions changed but totals weren't provided or mismatch
      // But usually frontend sends everything. We'll trust the payload for now or add server-side recalc if needed.
    }

    // Update the version state with current values (either from payload update or existing)
    // capture the object AFTER updates
    const quotationSnapshot = quotation.toObject()

    quotation.versionHistory[versionIndex].state = {
      days: quotationSnapshot.days,
      pricingOptions: quotationSnapshot.pricingOptions,
      subtotal: quotationSnapshot.subtotal,
      markup: quotationSnapshot.markup,
      total: quotationSnapshot.total,
      currencySettings: quotationSnapshot.currencySettings
    }
    quotation.versionHistory[versionIndex].isDraft = false // "Saved" means it's a checkpoint, but maybe we keep it as draft?
    // Actually, "Save" usually means "I'm working on this". 
    // If we mark it not draft, it might look like a "Final" version. 
    // Checking previous logic: `quotation.isDraft = false`. 
    // Let's keep it consistent.

    quotation.isDraft = false
    quotation.markModified("versionHistory")
    quotation.markModified("days")
    quotation.markModified("pricingOptions")

    // Save changes
    await quotation.save()

    return NextResponse.json(quotation)
  } catch (error: any) {
    console.error("Error saving quotation version:", error)
    return NextResponse.json(
      { error: "Failed to save version", details: error.message || String(error) },
      { status: 500 }
    )
  }
}
