"use client"

import { Plane, Luggage, Shield, FileText, Clock } from "lucide-react"
import { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
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
  const priceResult = event.price
    ? calculateFlightPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency
    })
    : null

  // Format stops display
  const stopsDisplay = (() => {
    if (event.numberOfStops !== undefined && event.stopLocations && event.stopLocations.length > 0) {
      const locations = event.stopLocations.filter(l => l && l.trim()).join(", ")
      return event.numberOfStops === 0 ? "Non-stop" : `${event.numberOfStops} stop${event.numberOfStops > 1 ? 's' : ''} via ${locations}`
    }
    return event.stops || "Non-stop"
  })()

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-300 mb-3">
      <EventSourceBadge event={event} />
      
      <div className="flex items-start gap-4">
        {/* Icon Container - Matching NewTemplate style */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FFF8E1] flex items-center justify-center border border-[rgba(240,193,5,0.3)] text-[#9A7B00]">
          <Plane className="h-5 w-5" />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold tracking-[0.15em] text-[#64748b] uppercase">Flight</span>
            {priceResult && pricingEnabled && pricingMode === 'individual' && (
               <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 font-serif">{priceResult.displayPrice}</span>
                  <div className="text-[8px] text-slate-400 uppercase tracking-tighter">
                    {priceResult.breakdown || "PER COMPONENT"}
                  </div>
               </div>
            )}
          </div>
          
          <h4 className="text-base font-medium text-slate-800 font-serif leading-snug">
            {event.fromCity} ⟶ {event.toCity}
          </h4>
          
          <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4">
             <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
               <Clock className="h-3 w-3" />
               <span>{event.startTime || event.time || "--:--"} - {event.endTime || "--:--"}</span>
             </div>
             <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
               <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[#9A7B00]">{stopsDisplay}</span>
             </div>
             {event.airlines && (
               <div className="text-[11px] font-bold text-slate-700">
                 {event.airlines} {event.flightNumber && <span className="font-normal text-slate-400 ml-1">{event.flightNumber}</span>}
               </div>
             )}
          </div>

          {/* Boarding Pass Style Details */}
          {isDetailedView && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Class</span>
                <span className="text-xs font-semibold text-slate-700">{event.flightClass || "Economy"}</span>
              </div>
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Baggage</span>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <Luggage className="h-3 w-3" />
                  <span>{event.baggage || "20kg + 7kg"}</span>
                </div>
              </div>
              {event.pnr && (
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">PNR</span>
                  <span className="text-xs font-mono font-bold text-blue-600">{event.pnr}</span>
                </div>
              )}
              {event.refundable && (
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Policy</span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <Shield className="h-3 w-3" />
                    <span>{event.refundable}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {event.description && (
            <p className="mt-3 text-xs text-slate-500 leading-relaxed italic">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
