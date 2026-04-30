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
      console.log("No payload provided to save endpoint, using existing DB state");
    }

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // 1. Initialize version history if it doesn't exist
    if (!quotation.versionHistory || quotation.versionHistory.length === 0) {
      console.log(`[QUOTATION SAVE] Initializing version history for quotation ${id}`);
      quotation.currentVersion = 1;
      quotation.versionHistory = [{
        versionNumber: 1,
        createdAt: new Date(),
        isDraft: true,
        isLocked: false,
        description: "Initial version",
        state: snapshotQuotationState(quotation)
      }];
    }

    // 2. Capture the state BEFORE applying updates (this belongs to the current version)
    const stateBeforeUpdate = snapshotQuotationState(quotation)

    // Get the current version index
    let currentVersion = quotation.currentVersion || 1
    let versionIndex = quotation.versionHistory?.findIndex(
      (v: any) => v.versionNumber === currentVersion
    )

    if (versionIndex === -1) {
      // Fallback to latest version if currentVersion not found
      versionIndex = quotation.versionHistory.length - 1;
      currentVersion = quotation.versionHistory[versionIndex].versionNumber;
    }

    // 3. Finalize and LOCK the current version with its current (old) state
    quotation.versionHistory[versionIndex].state = stateBeforeUpdate
    quotation.versionHistory[versionIndex].isDraft = false
    quotation.versionHistory[versionIndex].isLocked = true
    quotation.versionHistory[versionIndex].createdAt = new Date()

    // 4. Update Quotation Fields from Payload
    if (Object.keys(payload).length > 0) {
      const allowedUpdates = [
        "days", "pricingOptions", "client", "currencySettings",
        "subtotal", "markup", "total", "notes", "title", "description",
        "validUntil", "totalPrice", "destination", "countries", "duration",
        "currency", "type", "cartItems", "htmlContent", "htmlBlocks",
        "serviceSlots", "branding", "gallery", "highlights", "images",
        "overviewEvents", "productId", "productReferenceCode"
      ];

      allowedUpdates.forEach(key => {
        if (key in payload) {
          quotation[key] = (payload as any)[key];
        }
      });
    }

    // 5. Capture the state AFTER applying updates (this belongs to the new version)
    const stateAfterUpdate = snapshotQuotationState(quotation)

    // 6. Create the NEXT version with the new state
    const nextVersionNumber = quotation.versionHistory.length + 1
    quotation.versionHistory.push({
      versionNumber: nextVersionNumber,
      createdAt: new Date(),
      description: `Draft for version ${nextVersionNumber}`,
      isLocked: false,
      isDraft: true,
      state: stateAfterUpdate
    })

    // 7. Update top-level current version info
    quotation.currentVersion = nextVersionNumber
    quotation.isDraft = true
    
    // Mark fields as modified for Mongoose
    quotation.markModified("versionHistory")
    quotation.markModified("days")
    quotation.markModified("pricingOptions")
    quotation.markModified("cartItems")
    quotation.markModified("htmlBlocks")
    quotation.markModified("branding")
    quotation.markModified("serviceSlots")
    quotation.markModified("overviewEvents")
    quotation.markModified("currencySettings")

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
