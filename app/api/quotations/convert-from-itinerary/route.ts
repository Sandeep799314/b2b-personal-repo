import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Itinerary from "@/models/Itinerary"
import Quotation from "@/models/Quotation"
import User from "@/models/User"
import { verifyAuth } from "@/lib/server-auth"

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

// POST /api/quotations/convert-from-itinerary
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    // Connect to database
    await connectDB()

    // --- CREDIT SYSTEM START ---
    let userDoc = await User.findOne({ userId: user.uid });
    if (!userDoc) {
      userDoc = await User.create({
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        credits: 20
      });
    } else if (userDoc.credits === undefined || userDoc.credits === null) {
      userDoc.credits = 20;
      await userDoc.save();
    }

    const CONVERT_CREDIT_COST = 1;
    if (userDoc.credits < CONVERT_CREDIT_COST) {
      return NextResponse.json({ 
        error: "Insufficient Credits", 
        message: `Converting an itinerary to a quotation costs ${CONVERT_CREDIT_COST} credit. You currently have ${userDoc.credits} credits.` 
      }, { status: 403 });
    }
    // --- CREDIT SYSTEM END ---

    // Parse request body
    const body = await request.json()
    const { itineraryId, clientInfo, pricingOptions } = body

    if (!itineraryId) {
      return NextResponse.json({ error: "Itinerary ID is required" }, { status: 400 })
    }

    // Fetch the itinerary
    const itinerary = await Itinerary.findById(itineraryId)

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 })
    }

    // Calculate the original total price
    let originalTotalPrice = 0

    // Priority 1: Use itinerary.totalPrice if it's explicitly set and > 0
    if (itinerary.totalPrice && itinerary.totalPrice > 0) {
      originalTotalPrice = itinerary.totalPrice
    } 
    // Priority 2: If it's a cart-combo, sum up cart items
    else if (itinerary.type === "cart-combo" && itinerary.cartItems && itinerary.cartItems.length > 0) {
      itinerary.cartItems.forEach((item: any) => {
        if (item.price) {
          originalTotalPrice += (item.price * (item.quantity || 1))
        }
      })
    }
    // Priority 3: Fallback to summing up events in days
    else {
      itinerary.days.forEach((day: { events: Array<{ price?: number }> }) => {
        day.events.forEach((event: { price?: number }) => {
          if (event.price) {
            originalTotalPrice += event.price
          }
        })
      })
    }

    // Calculate final price based on markup
    let finalTotalPrice = originalTotalPrice
    if (pricingOptions?.markupType === "percentage" && pricingOptions?.markupValue) {
      finalTotalPrice = originalTotalPrice * (1 + pricingOptions.markupValue / 100)
    } else if (pricingOptions?.markupType === "fixed" && pricingOptions?.markupValue) {
      finalTotalPrice = originalTotalPrice + pricingOptions.markupValue
    }

    // CRITICAL: Deep clone itinerary data to prevent mutation of original itinerary
    // When quotation is edited, it should NOT affect the source itinerary
    const itineraryData = JSON.parse(JSON.stringify(itinerary.toObject()));

    // Create quotation with user fields
    const quotation = new Quotation({
      // User authentication fields
      userId: user.uid,
      userEmail: user.email,
      createdByUser: user.displayName || user.email,
      // Itinerary data (DEEP CLONED - not by reference)
      itineraryId: itinerary._id,
      productId: itineraryData.productId,
      productReferenceCode: itineraryData.productReferenceCode,
      title: itineraryData.title,
      description: itineraryData.description,
      destination: itineraryData.destination,
      countries: itineraryData.countries,
      duration: itineraryData.duration,
      totalPrice: finalTotalPrice,
      currency: itineraryData.currency,
      type: itineraryData.type,
      createdBy: itineraryData.createdBy,
      lastUpdatedBy: itineraryData.lastUpdatedBy,
      days: itineraryData.days, // Deep cloned array of days and events
      cartItems: itineraryData.cartItems, // Copy cart items if any
      htmlBlocks: itineraryData.htmlBlocks, // Copy html blocks if any
      htmlContent: itineraryData.htmlContent, // Copy html content if any
      overviewEvents: itineraryData.overviewEvents, // Copy overview events if any
      serviceSlots: itineraryData.serviceSlots, // Copy service slots if any
      highlights: itineraryData.highlights,
      images: itineraryData.images,
      gallery: itineraryData.gallery,
      branding: itineraryData.branding,
      status: "draft",
      subtotal: originalTotalPrice,
      markup: finalTotalPrice - originalTotalPrice,
      total: finalTotalPrice,
      pricingOptions: {
        showIndividualPrices: pricingOptions?.showIndividualPrices ?? true,
        showSubtotals: pricingOptions?.showSubtotals ?? true,
        showTotal: pricingOptions?.showTotal ?? true,
        markupType: pricingOptions?.markupType ?? "percentage",
        markupValue: pricingOptions?.markupValue ?? 0,
        originalTotalPrice,
        finalTotalPrice,
      },
      client: {
        name: clientInfo?.name || "Client",
        email: clientInfo?.email || "",
        phone: clientInfo?.phone || "",
        referenceNo: clientInfo?.referenceNo || "",
      },
      generatedDate: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: clientInfo?.notes || "",
      currentVersion: 1,
      isDraft: true,
    })

    // Initialize version history with a snapshot of the initial state
    quotation.versionHistory = [{
      versionNumber: 1,
      createdAt: new Date(),
      description: "Initial version from itinerary",
      isLocked: false,
      isDraft: true,
      state: snapshotQuotationState(quotation)
    }];

    // Save the quotation
    await quotation.save()

    // --- DEDUCT CREDITS ---
    userDoc.credits -= CONVERT_CREDIT_COST;
    await userDoc.save();
    // ----------------------

    return NextResponse.json({
      message: "Quotation created successfully",
      quotationId: quotation._id
    }, { status: 201 })
  } catch (error) {
    console.error("Error converting itinerary to quotation:", error)
    return NextResponse.json({ error: "Failed to convert itinerary to quotation" }, { status: 500 })
  }
}
