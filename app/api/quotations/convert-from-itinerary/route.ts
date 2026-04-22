import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Itinerary from "@/models/Itinerary"
import Quotation from "@/models/Quotation"
import { verifyAuth } from "@/lib/server-auth"

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

    // Calculate the original total price from all events with prices
    let originalTotalPrice = 0
    itinerary.days.forEach((day: { events: Array<{ price?: number }> }) => {
      day.events.forEach((event: { price?: number }) => {
        if (event.price) {
          originalTotalPrice += event.price
        }
      })
    })

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
      highlights: itineraryData.highlights,
      images: itineraryData.images,
      gallery: itineraryData.gallery,
      branding: itineraryData.branding,
      status: "draft",
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
    })

    // Save the quotation
    await quotation.save()

    return NextResponse.json({
      message: "Quotation created successfully",
      quotationId: quotation._id
    }, { status: 201 })
  } catch (error) {
    console.error("Error converting itinerary to quotation:", error)
    return NextResponse.json({ error: "Failed to convert itinerary to quotation" }, { status: 500 })
  }
}