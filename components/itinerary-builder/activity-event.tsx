"use client"

import { Camera, Clock, Users, Star, MapPin, Calendar, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { calculateAncillaryPrice } from "@/lib/pricing-calculator"

interface ActivityEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  onEdit?: () => void
  onDelete?: () => void
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingCurrency?: string
  pricingMode?: 'individual' | 'total-only'
}

export function ActivityEvent({
  event,
  isDetailedView = true,
  onEdit,
  onDelete,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR",
  pricingMode = 'individual',
}: ActivityEventProps) {
  // Always calculate price conversion when price exists
  const priceResult = event.price
    ? calculateAncillaryPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency
    })
    : null

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (!isDetailedView) {
    return (
      <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5 text-green-600" />
          <h4 className="text-sm font-semibold text-gray-800 truncate">{event.title || "Activity"}</h4>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
      <EventSourceBadge event={event} />

      {/* Compact Header */}
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <Camera className="h-3.5 w-3.5 text-green-600" />
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Activity</h3>
        {event.difficulty && (
          <Badge variant="outline" className={`text-xs ${getDifficultyColor(event.difficulty)} py-0 px-1`}>
            {event.difficulty}
          </Badge>
        )}
      </div>

      {/* Title */}
      <div className="mb-1.5">
        <h4 className="text-sm font-bold text-gray-900">{event.title || "Activity"}</h4>
        {event.subtitle && (
          <p className="text-xs italic text-slate-600 mt-0.5">{event.subtitle}</p>
        )}
        {event.location && (
          <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
            <MapPin className="h-3 w-3" />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && event.description.trim() && (
        <p className="text-xs text-slate-600 mb-1.5 leading-snug">{event.description}</p>
      )}

      {/* Activity Details */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-1.5 text-xs">
        {event.duration && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">{event.duration}</span>
          </div>
        )}
        {event.capacity && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">Max {event.capacity}</span>
          </div>
        )}
      </div>

      {/* Highlights */}
      {event.highlights && event.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {event.highlights.map((highlight, index) => (
            <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-50 text-xs text-green-700 border border-green-200">
              <Star className="h-2.5 w-2.5 mr-0.5" />
              {highlight}
            </span>
          ))}
        </div>
      )}

      {/* Images */}
      {event.images && event.images.length > 0 && (
        <div className="mb-1.5">
          <div className="grid grid-cols-4 gap-1">
            {event.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Activity ${idx + 1}`} className="w-full h-12 object-cover rounded border border-slate-200" />
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      {event.additionalInfoSections && event.additionalInfoSections.length > 0 && (
        <div className="mb-1.5 space-y-1">
          {event.additionalInfoSections.map((section, idx) => (
            <div key={idx} className="p-1.5 bg-green-50 rounded border-l-2 border-green-400">
              <h5 className="text-xs font-semibold text-green-900">{section.heading}</h5>
              <p className="text-xs text-green-800 leading-snug mt-0.5">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Price - Always show if price exists */}
      {event.price && pricingEnabled && pricingMode === 'individual' && (
        <div className="pt-1.5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {priceResult ? priceResult.breakdown : "Price"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-sm font-bold text-green-600">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    ({priceResult.originalDisplayPrice}/pax)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-green-600">
                    {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                    {event.price}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">/pax</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
