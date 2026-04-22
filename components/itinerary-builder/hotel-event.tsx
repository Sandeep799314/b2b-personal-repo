"use client"

import { Hotel, Moon, Wifi, Car, UtensilsCrossed, Dumbbell, Clock, Star, Users, MapPin, ExternalLink, FileText, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { calculateHotelPrice } from "@/lib/pricing-calculator"
import { formatCurrencyWithSymbol } from "@/lib/currency-utils"

interface HotelEventProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  nightIndex?: number
  totalNights?: number
  dayNumber?: number
  onEdit?: () => void
  onDelete?: () => void
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingRooms?: number
  pricingCurrency?: string
  pricingMode?: 'individual' | 'total-only'
}

export function HotelEvent({
  event,
  isDetailedView = true,
  nightIndex,
  totalNights,
  dayNumber,
  onEdit,
  onDelete,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingRooms = 1,
  pricingCurrency = "INR",
  pricingMode = 'individual',
}: HotelEventProps) {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-2.5 w-2.5" />
      case "parking":
        return <Car className="h-2.5 w-2.5" />
      case "restaurant":
        return <UtensilsCrossed className="h-2.5 w-2.5" />
      case "gym":
        return <Dumbbell className="h-2.5 w-2.5" />
      default:
        return null
    }
  }

  const checkInTime = event.checkIn || "11:00"
  const checkOutTime = event.checkOut || "10:00"
  const nightDisplay = nightIndex && totalNights ? `${nightIndex}/${totalNights}N` : (event.nights ? `${event.nights}N` : null)
  const isCheckInDay = nightIndex === 1
  const isCheckOutDay = nightIndex !== undefined && totalNights !== undefined && nightIndex === totalNights + 1

  // Always calculate price conversion when price exists
  const priceResult = event.price
    ? calculateHotelPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency,
      rooms: pricingRooms
    }, isCheckOutDay)
    : null

  if (!isDetailedView) {
    return (
      <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-1">
            <Hotel className="h-3.5 w-3.5 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-800 truncate">{event.title || "Hotel Name"}</h4>
          </div>
          {nightDisplay && !isCheckOutDay && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300 text-xs py-0 px-1">
              {nightDisplay}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
      <EventSourceBadge event={event} />

      {/* Compact Header */}
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <Hotel className="h-3.5 w-3.5 text-blue-600" />
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Hotel</h3>
        {nightDisplay && !isCheckOutDay && (
          <Badge className="text-xs bg-blue-600 text-white py-0 px-1">{nightDisplay}</Badge>
        )}
        {isCheckInDay && (
          <Badge className="text-xs bg-green-600 text-white py-0 px-1">CHECK-IN</Badge>
        )}
        {isCheckOutDay && (
          <Badge className="text-xs bg-red-600 text-white py-0 px-1">CHECK-OUT</Badge>
        )}

      </div>

      {/* Title & Location */}
      <div className="mb-1.5">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-gray-900">{event.title || "Hotel Name"}</h4>
          {event.hotelRating && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-50 rounded border border-yellow-200">
              <span className="text-xs font-bold text-yellow-700">{event.hotelRating}</span>
              <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
            </div>
          )}
        </div>
        {event.location && (
          <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
            <MapPin className="h-3 w-3" />
            <span>{event.location}</span>
          </div>
        )}
        {event.address && (
          <p className="text-xs text-slate-500 mt-0.5 ml-4 leading-snug">{event.address}</p>
        )}
      </div>



      {/* Room & Occupancy Details */}
      <div className="flex flex-wrap items-center gap-3 mb-1.5 text-xs">
        {event.roomCategory && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Room:</span>
            <span className="text-slate-700 font-medium truncate">{event.roomCategory}</span>
          </div>
        )}
        {event.propertyType && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Type:</span>
            <span className="text-slate-700 font-medium truncate">{event.propertyType}</span>
          </div>
        )}
        {(event.adults || event.children) && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">
              {event.adults && `${event.adults}A`}
              {event.adults && event.children && ' • '}
              {event.children && `${event.children}C`}
            </span>
          </div>
        )}
        {event.confirmationNumber && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Confirmation No.:</span>
            <span className="text-slate-600 font-mono text-xs truncate">{event.confirmationNumber}</span>
          </div>
        )}
      </div>

      {/* Amenities */}
      {event.amenities && event.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {event.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 rounded text-xs text-blue-700">
              {getAmenityIcon(amenity)}
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {event.description && event.description.trim() && (
        <p className="text-xs text-slate-600 mb-1.5 leading-snug">{event.description}</p>
      )}

      {/* Meal Plan */}
      {event.mealPlan && (
        <div className="mb-1.5">
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300 py-0.5 px-2">
            <UtensilsCrossed className="h-2.5 w-2.5 mr-1 inline" />
            {event.mealPlan}
          </Badge>
        </div>
      )}

      {/* Address & Link */}

      {event.hotelLink && (
        <a href={event.hotelLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mb-1.5 block truncate">
          Visit Website →
        </a>
      )}

      {/* Notes */}
      {event.hotelNotes && (
        <div className="mb-1.5 p-1.5 bg-amber-50 rounded border-l-2 border-amber-400">
          <p className="text-xs text-amber-900 leading-snug">{event.hotelNotes}</p>
        </div>
      )}

      {/* Images */}
      {event.images && event.images.length > 0 && (
        <div className="mb-1.5">
          <div className="grid grid-cols-4 gap-1">
            {event.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Hotel ${idx + 1}`} className="w-full h-12 object-cover rounded border border-slate-200" />
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      {event.additionalInfoSections && event.additionalInfoSections.length > 0 && (
        <div className="mb-1.5 space-y-1">
          {event.additionalInfoSections.map((section, idx) => (
            <div key={idx} className="p-1.5 bg-blue-50 rounded border-l-2 border-blue-400">
              <h5 className="text-xs font-semibold text-blue-900">{section.heading}</h5>
              <p className="text-xs text-blue-800 leading-snug mt-0.5">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Check-in/Check-out Times */}
      <div className="mb-1.5 p-1.5 bg-blue-50 rounded flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-blue-600" />
          <span className="font-medium text-blue-900">{checkInTime}</span>
          <span className="text-blue-600">→</span>
          <span className="font-medium text-blue-900">{checkOutTime}</span>
        </div>

      </div>

      {/* Price - Always show if price exists (only on check-in day) */}
      {event.price && isCheckInDay && pricingEnabled && pricingMode === 'individual' && (
        <div className="pt-1.5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {
                priceResult
                  ? `${totalNights || 1} nights × ${priceResult.breakdown?.split('×')[0].trim()} × ${formatCurrencyWithSymbol(priceResult.originalPrice, priceResult.originalCurrency)}`
                  : "Total Stay Price"
              }
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-sm font-bold text-blue-600">
                    {formatCurrencyWithSymbol(priceResult.calculatedPrice * (totalNights || 1), pricingCurrency)}
                  </span>
                  {priceResult.originalCurrency !== pricingCurrency && (
                    <span className="text-xs text-slate-400 ml-1">
                      ({formatCurrencyWithSymbol(priceResult.originalPrice * (totalNights || 1), priceResult.originalCurrency)})
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-blue-600">
                    {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                    {(event.price || 0) * (totalNights || 1)}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">total</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
