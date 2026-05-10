import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"
import { verifyAuth } from "@/lib/server-auth"

// Helper to capture a full snapshot of the quotation state
const snapshotQuotationState = (q: any) => {
  // Convert to plain object if it's a Mongoose document
  const doc = q.toObject ? q.toObject() : q;
  
  return {
    days: doc.days || [],
    pricingOptions: doc.pricingOptions || {},
    subtotal: doc.subtotal || 0,
    markup: doc.markup || 0,
    total: doc.total || 0,
    currencySettings: doc.currencySettings || {},
    title: doc.title || "",
    description: doc.description || "",
    countries: doc.countries || [],
    destination: doc.destination || "",
    duration: doc.duration || "",
    totalPrice: doc.totalPrice || 0,
    currency: doc.currency || "USD",
    type: doc.type || "customized-package",
    cartItems: doc.cartItems || [],
    htmlContent: doc.htmlContent || "",
    htmlBlocks: doc.htmlBlocks || [],
    serviceSlots: doc.serviceSlots || [],
    branding: doc.branding || {},
    gallery: doc.gallery || [],
    highlights: doc.highlights || [],
    images: doc.images || [],
    overviewEvents: doc.overviewEvents || [],
    fixedScheduleEvents: doc.fixedScheduleEvents || [],
    guestDetails: doc.guestDetails || {},
    agencyDetails: doc.agencyDetails || {},
    headerFooter: doc.headerFooter || {},
    notes: doc.notes || "",
    productId: doc.productId || "",
    productReferenceCode: doc.productReferenceCode || "",
    queryStatus: doc.queryStatus || "pending"
  }
}


// POST /api/quotations/[id]/save
export async function POST(
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

    // Check ownership
    if (quotation.userId !== user.uid) {
      return NextResponse.json({ error: "Unauthorized - You do not own this quotation" }, { status: 403 });
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
    // Actually, we usually want the state AFTER update for the current version's state
    // but we can keep it as is if that's the intended logic.

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

    // 3. Update Quotation Fields from Payload
    if (Object.keys(payload).length > 0) {
      const allowedUpdates = [
        "days", "pricingOptions", "client", "currencySettings",
        "subtotal", "markup", "total", "notes", "title", "description",
        "validUntil", "totalPrice", "destination", "countries", "duration",
        "currency", "type", "cartItems", "htmlContent", "htmlBlocks",
        "serviceSlots", "branding", "gallery", "highlights", "images",
        "overviewEvents", "fixedScheduleEvents", "guestDetails", "agencyDetails", 
        "headerFooter", "productId", "productReferenceCode", "queryStatus"
      ];

      allowedUpdates.forEach(key => {
        if (key in payload) {
          quotation[key] = (payload as any)[key];
        }
      });
    }

    // 4. Update the state of the CURRENT version with the NEW state
    const stateAfterUpdate = snapshotQuotationState(quotation)
    quotation.versionHistory[versionIndex].state = stateAfterUpdate
    quotation.versionHistory[versionIndex].createdAt = new Date()
    
    // 5. Ensure it's still marked as draft at the top level
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
    quotation.markModified("fixedScheduleEvents")
    quotation.markModified("guestDetails")
    quotation.markModified("agencyDetails")
    quotation.markModified("headerFooter")
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
