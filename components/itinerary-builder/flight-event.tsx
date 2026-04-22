"use client"

import { Plane, Clock, Luggage, Shield, FileText, Image as ImageIcon } from "lucide-react"
import { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { Badge } from "@/components/ui/badge"
import { calculateFlightPrice } from "@/lib/pricing-calculator"

interface FlightEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingCurrency?: string
  pricingMode?: 'individual' | 'total-only'
}

export function FlightEvent({
  event,
  isDetailedView = true,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR",
  pricingMode = 'individual',
}: FlightEventProps) {
  // Always calculate price conversion when price exists
  const priceResult = event.price
    ? calculateFlightPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency
    })
    : null

  if (!isDetailedView) {
    // Summary view: show only fromCity -> toCity
    return (
      <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-1.5">
          <Plane className="h-3.5 w-3.5 text-gray-700" />
          <h4 className="text-sm font-semibold text-gray-800">{event.fromCity} ⟶ {event.toCity}</h4>
        </div>
      </div>
    )
  }

  // Format luggage display
  const luggageDisplay = (() => {
    if (event.checkinBags || event.cabinBags) {
      const parts = []
      if (event.checkinBags) {
        parts.push(`${event.checkinBags}×${event.checkinBagWeight || ""}`)
      }
      if (event.cabinBags) {
        parts.push(`Cabin: ${event.cabinBags}×${event.cabinBagWeight || ""}`)
      }
      return parts.join(" + ")
    }
    return event.baggage
  })()

  // Format stops display
  const stopsDisplay = (() => {
    if (event.numberOfStops !== undefined && event.stopLocations && event.stopLocations.length > 0) {
      const locations = event.stopLocations.filter(l => l && l.trim()).join(", ")
      return event.numberOfStops === 0 ? "Non-stop" : `${event.numberOfStops} stop${event.numberOfStops > 1 ? 's' : ''} via ${locations}`
    }
    return event.stops || "Non-stop"
  })()

  return (
    <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
      <EventSourceBadge event={event} />

      {/* Flight Header */}
      <div className="mb-1.5 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <Plane className="h-3.5 w-3.5 text-blue-600" />
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Flight</h3>
        </div>
        {event.title && (
          <div className="text-sm font-semibold text-gray-800 mt-1">{event.title}</div>
        )}
      </div>

      {/* Compact Route Header */}
      <div className="flex items-start mb-1.5">
        {/* From City */}
        <div className="w-24">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">From</div>
          <div className="text-2xl font-bold text-gray-900">{event.fromCity || "Origin"}</div>
        </div>

        {/* Arrow Section with Stops Above and Duration Below */}
        <div className="flex flex-col items-center justify-center min-w-[100px] mx-6">
          {/* Stops Above Arrow */}
          <div className="text-xs text-gray-600 mb-0.5 whitespace-nowrap">
            {stopsDisplay}
          </div>

          {/* Arrow */}
          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-blue-400"></div>
            <svg className="w-5 h-5 text-blue-600 mx-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 h-px bg-blue-400"></div>
          </div>

          {/* Duration Below Arrow */}
          <div className="text-sm font-semibold text-blue-600 mt-0.5">
            {event.duration || "--"}
          </div>
        </div>

        {/* To City */}
        <div className="w-24">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">To</div>
          <div className="text-2xl font-bold text-gray-900">{event.toCity || "Destination"}</div>
        </div>
      </div>

      {/* Flight Times - Compact */}
      <div className="flex items-start mb-1.5">
        <div className="w-24">
          <div className="text-3xl font-bold text-gray-900">{event.startTime || event.time || "--:--"}</div>
          <div className="text-[10px] text-gray-500 uppercase">Departure</div>
        </div>
        <div className="min-w-[100px] mx-6"></div>
        <div className="w-24">
          <div className="text-3xl font-bold text-gray-900">{event.endTime || "--:--"}</div>
          <div className="text-[10px] text-gray-500 uppercase">Arrival</div>
        </div>
      </div>

      {/* Airline Info - Compact */}
      {(event.airlines || event.flightNumber) && (
        <div className="mb-1.5 pb-1.5 border-b border-gray-100">
          {event.airlines && (
            <div className="text-base font-bold text-gray-800">{event.airlines}</div>
          )}
          {event.flightNumber && (
            <div className="text-xs text-gray-600">{event.flightNumber}</div>
          )}
        </div>
      )}

      {/* Footer Info: Class, Luggage, Booking Details */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
        {event.flightClass && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-100 shadow-sm">
            <span className="font-medium text-blue-700">{event.flightClass}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-100 shadow-sm">
          <Luggage className="h-3.5 w-3.5 text-gray-500" />
          <span>{luggageDisplay || "20kg check-in + 7kg cabin"}</span>
        </div>
        {event.refundable && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-100 shadow-sm">
            <Shield className="h-3.5 w-3.5 text-green-600" />
            <span className="text-green-700 font-medium">{event.refundable}</span>
          </div>
        )}
        {event.pnr && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-100 shadow-sm">
            <span className="text-gray-500">PNR:</span>
            <span className="font-mono font-medium text-gray-900">{event.pnr}</span>
          </div>
        )}
        {event.bookingId && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-100 shadow-sm">
            <FileText className="h-3.5 w-3.5 text-purple-500" />
            <span className="font-medium">Booking ID: {event.bookingId}</span>
          </div>
        )}
        {event.seatNumber && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-100 shadow-sm">
            <span className="text-gray-500">Seat:</span>
            <span className="font-medium">{event.seatNumber}</span>
          </div>
        )}
        {event.inFlightMeals && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-gray-100 shadow-sm">
            <span className="text-gray-500">Meal:</span>
            <span className="font-medium">{event.inFlightMeals}</span>
          </div>
        )}
      </div>

      {/* Amenities */}
      {event.highlights && event.highlights.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Amenities</div>
          <div className="flex flex-wrap gap-1">
            {event.highlights.map((highlight, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-700"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Flight Notes */}
      {event.flightNotes && (
        <div className="mb-2 p-2 bg-amber-50 rounded border-l-2 border-amber-400">
          <p className="text-xs text-amber-900 leading-snug">{event.flightNotes}</p>
        </div>
      )}

      {/* Description - No Heading */}
      {event.description && event.description.trim() && event.description !== event.mainPoint && (
        <div className="mb-2">
          <p className="text-xs text-gray-700 leading-relaxed">{event.description}</p>
        </div>
      )}

      {/* Images */}
      {event.images && event.images.length > 0 && (
        <div className="mb-2">
          <div className="grid grid-cols-4 gap-2">
            {event.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Flight ${idx + 1}`}
                className="w-full h-14 object-cover rounded border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional Info Sections */}
      {event.additionalInfoSections && event.additionalInfoSections.length > 0 && (
        <div className="space-y-1.5">
          {event.additionalInfoSections.map((section, idx) => (
            <div key={idx} className="p-2 bg-blue-50 rounded border-l-2 border-blue-400">
              <h5 className="text-xs font-semibold text-blue-900">{section.heading}</h5>
              <p className="text-xs text-blue-800 leading-snug mt-0.5">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Price - Always show if price exists */}
      {event.price && pricingEnabled && pricingMode === 'individual' && (
        <div className="pt-2 mt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {priceResult ? priceResult.breakdown : "Price"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-base font-bold text-gray-900">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({priceResult.originalDisplayPrice}/pax)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base font-bold text-gray-900">
                    {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                    {event.price}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">/pax</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
