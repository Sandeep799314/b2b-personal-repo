import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import Itinerary from "@/models/Itinerary"
import { isValidObjectId } from "mongoose"

const calculateOriginalTotal = (itinerary: any) => {
  let totalFromDays = 0

  if (Array.isArray(itinerary?.days)) {
    totalFromDays = itinerary.days.reduce((daySum: number, day: any) => {
      const events = Array.isArray(day?.events) ? day.events : []
      const eventTotal = events.reduce((sum: number, event: any) => {
        const value =
          typeof event?.price === "number" ? event.price : Number(event?.price ?? 0)
        return sum + (isNaN(value) ? 0 : value)
      }, 0)
      return daySum + eventTotal
    }, 0)
  }

  let totalFromCartItems = 0
  if (Array.isArray(itinerary?.cartItems)) {
    totalFromCartItems = itinerary.cartItems.reduce((sum: number, item: any) => {
      const basePrice =
        typeof item?.price === "number" ? item.price : Number(item?.price ?? 0)
      const quantity =
        typeof item?.quantity === "number" ? item.quantity : Number(item?.quantity ?? 1)
      if (isNaN(basePrice) || isNaN(quantity)) {
        return sum
      }
      return sum + basePrice * (quantity || 1)
    }, 0)
  }

  return totalFromDays + totalFromCartItems
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid quotation ID format" }, { status: 400 })
    }

    const quotation = await Quotation.findById(id)

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    if (!quotation.itineraryId || !isValidObjectId(quotation.itineraryId)) {
      return NextResponse.json(
        { error: "Quotation is not linked to a valid itinerary" },
        { status: 400 },
      )
    }

    const itinerary = await Itinerary.findById(quotation.itineraryId)
    if (!itinerary) {
      return NextResponse.json({ error: "Linked itinerary was not found" }, { status: 404 })
    }

    const originalTotalPrice = calculateOriginalTotal(itinerary)

    const markupType = quotation.pricingOptions?.markupType || "percentage"
    const markupValue = quotation.pricingOptions?.markupValue || 0

    let markup = 0
    if (markupType === "percentage" && markupValue) {
      markup = originalTotalPrice * (markupValue / 100)
    } else if (markupType === "fixed" && markupValue) {
      markup = markupValue
    }

    const finalTotalPrice = originalTotalPrice + markup

    quotation.title = itinerary.title
    quotation.description = itinerary.description
    quotation.destination = itinerary.destination
    quotation.duration = itinerary.duration
    quotation.currency = itinerary.currency
    quotation.countries = itinerary.countries
    quotation.days = itinerary.days
    quotation.highlights = itinerary.highlights
    quotation.images = itinerary.images
    quotation.gallery = itinerary.gallery
    quotation.branding = itinerary.branding
    quotation.totalPrice = finalTotalPrice
    quotation.subtotal = originalTotalPrice
    quotation.markup = markup
    quotation.total = finalTotalPrice
    quotation.isDraft = true

    quotation.pricingOptions = {
      ...quotation.pricingOptions,
      originalTotalPrice,
      finalTotalPrice,
    }

    quotation.updatedAt = new Date()

    const updatedQuotation = await quotation.save()

    return NextResponse.json({
      message: "Quotation synchronised with itinerary",
      quotation: updatedQuotation,
    })
  } catch (error) {
    console.error("Error syncing quotation with itinerary:", error)
    return NextResponse.json(
      { error: "Failed to sync quotation with itinerary" },
      { status: 500 },
    )
  }
}
