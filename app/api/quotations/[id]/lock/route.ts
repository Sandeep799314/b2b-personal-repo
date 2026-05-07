import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import User from "@/models/User"
import { verifyAuth } from "@/lib/server-auth"
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
    fixedScheduleEvents: q.fixedScheduleEvents || [],
    guestDetails: q.guestDetails || {},
    agencyDetails: q.agencyDetails || {},
    headerFooter: q.headerFooter || {},
    notes: q.notes || "",
    productId: q.productId || "",
    productReferenceCode: q.productReferenceCode || ""
  }
}

// POST /api/quotations/[id]/lock
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request);
    if (!authUser) {
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

    // --- CREDIT SYSTEM START ---
    const FINALIZE_CREDIT_COST = 3;
    let userDoc = await User.findOne({ userId: authUser.uid });
    
    // Create user if they don't exist yet in our DB
    if (!userDoc) {
      userDoc = await User.create({
        userId: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        credits: 20 // Default starting credits
      });
    }

    if (userDoc.credits < FINALIZE_CREDIT_COST) {
      return NextResponse.json({ 
        error: "Insufficient Credits", 
        message: `Finalizing a quotation costs ${FINALIZE_CREDIT_COST} credits. You have ${userDoc.credits} credits left.` 
      }, { status: 403 });
    }
    // --- CREDIT SYSTEM END ---

    // Check if quotation exists
    const quotation = await Quotation.findById(id)
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    // Body can only be read once; parse and destructure in a single call
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    
    const { userName, versionNumber } = payload;
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
      return NextResponse.json({ error: `Version ${parsedVersionNumber} not found in history` }, { status: 404 })
    }

    if (quotation.versionHistory[versionIndex].isLocked) {
      return NextResponse.json({ error: "This version is already locked" }, { status: 400 })
    }

    // 1. Lock current version
    quotation.versionHistory[versionIndex].isLocked = true
    quotation.versionHistory[versionIndex].isDraft = false
    quotation.versionHistory[versionIndex].lockedBy = userName || authUser.displayName || "Unknown user"
    quotation.versionHistory[versionIndex].lockedAt = new Date()

    // 2. Capture the current state for the next version
    const currentState = snapshotQuotationState(quotation)

    // 3. Create the NEXT version automatically
    const nextVersionNumber = quotation.versionHistory.length + 1
    quotation.versionHistory.push({
      versionNumber: nextVersionNumber,
      createdAt: new Date(),
      description: `Draft for version ${nextVersionNumber}`,
      isLocked: false,
      isDraft: true,
      state: currentState
    })

    // 4. Update top-level info
    quotation.currentVersion = nextVersionNumber
    quotation.isLocked = false // Global lock is false because we created a new draft
    quotation.isDraft = true
    quotation.status = "locked" // Update top-level status to locked
    
    quotation.markModified("versionHistory")
    quotation.markModified("status")
    quotation.markModified("isDraft")
    quotation.markModified("currentVersion")

    // 5. DEDUCT CREDITS
    userDoc.credits -= FINALIZE_CREDIT_COST;
    await userDoc.save();

    // Save changes
    await quotation.save()

    return NextResponse.json(quotation)
  } catch (error: any) {
    console.error("Error finalizing quotation version:", error)
    return NextResponse.json({ 
      error: "Failed to finalize version", 
      details: error.message || String(error) 
    }, { status: 500 })
  }
}
