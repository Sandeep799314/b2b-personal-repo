"use client"

import { Car, Clock, Users, Image as ImageIcon, MapPin, Calendar, Info, Fuel, Settings, Train, Bus, Plane, Shield, Link as LinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { calculateTransferPrice } from "@/lib/pricing-calculator"

interface TransferEventProps {
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

export function TransferEvent({
  event,
  isDetailedView = true,
  onEdit,
  onDelete,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR",
  pricingMode = 'individual',
}: TransferEventProps) {
  // Always calculate price conversion when price exists
  const priceResult = event.price
    ? calculateTransferPrice(event, {
      adults: pricingAdults,
      children: pricingChildren,
      targetCurrency: pricingCurrency
    }, (event as any).transferCategory || "transfer")
    : null

  const getCategoryLabel = (category?: string) => {
    const labels: { [key: string]: string } = {
      'airport-transfer': 'Airport Transfer',
      'car-hire-hourly': 'Car Hire - Hourly',
      'car-hire-outstation': 'Car Hire - Outstation (One Way)',
      'car-hire-roundtrip': 'Car Hire - Round Trip',
      'car-hire-selfdrive': 'Car Hire - Self Drive',
      'train': 'Train',
      'bus': 'Bus',
    }
    return category ? labels[category] || 'Transfer' : 'Transfer'
  }

  const getCategoryIcon = (category?: string) => {
    if (category === 'train') return <Train className="h-3.5 w-3.5 text-purple-600" />
    if (category === 'bus') return <Bus className="h-3.5 w-3.5 text-purple-600" />
    if (category === 'airport-transfer') return <Plane className="h-3.5 w-3.5 text-purple-600" />
    return <Car className="h-3.5 w-3.5 text-purple-600" />
  }

  // Helper to get departure and arrival times (bus/train use different field names)
  const getDepartureTime = () => {
    return (event as any).departureTime || event.pickupTime || event.time
  }

  const getArrivalTime = () => {
    return (event as any).arrivalTime || event.dropTime
  }

  if (!isDetailedView) {
    return (
      <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
        <EventSourceBadge event={event} />
        <div className="flex items-center gap-1.5">
          {getCategoryIcon(event.transferCategory)}
          <span className="text-sm font-semibold text-gray-800">
            {event.fromLocation || event.fromCity || "Pick-up"} → {event.toLocation || event.toCity || "Drop-off"}
          </span>
        </div>
      </div>
    )
  }

  const isCarHire = event.transferCategory?.includes('car-hire')
  const isBusOrTrain = event.transferCategory === 'bus' || event.transferCategory === 'train'
  const isAirportTransfer = event.transferCategory === 'airport-transfer'
  const isSelfDrive = event.transferCategory === 'car-hire-selfdrive'

  // Debug log
  console.log('🚗 Transfer Event Display:', {
    eventId: event.id,
    transferCategory: event.transferCategory,
    title: event.title,
    hasTransferCategory: !!event.transferCategory
  })

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 relative shadow-sm">
      <EventSourceBadge event={event} />

      {/* Header - TRANSFER with icon */}
      <div className="flex items-center gap-2 mb-2">
        {getCategoryIcon(event.transferCategory)}
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">TRANSFER</h3>
      </div>

      {/* Transfer Type/Category - ALWAYS DISPLAYED */}
      <div className="mb-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            {getCategoryIcon(event.transferCategory)}
          </div>
          <div className="flex-1">
            <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Type</p>
            <p className="text-sm font-bold text-purple-900">{getCategoryLabel(event.transferCategory)}</p>
          </div>
        </div>
      </div>


      {/* Airport Transfer: Pickup/Drop Indicator */}
      {isAirportTransfer && (event as any).pickupDrop && (
        <div className="mb-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${(event as any).pickupDrop === 'pickup'
            ? 'bg-blue-100 text-blue-800 border border-blue-300'
            : 'bg-green-100 text-green-800 border border-green-300'
            }`}>
            <Plane className="h-3.5 w-3.5" />
            {(event as any).pickupDrop === 'pickup' ? 'Airport Pickup' : 'Airport Drop'}
          </div>
        </div>
      )}

      {/* Title */}
      {event.title && (
        <h4 className="text-sm font-bold text-gray-900 mb-3">{event.title}</h4>
      )}

      {/* Airport Name (for airport transfers) */}
      {isAirportTransfer && (event as any).airportName && (
        <div className="mb-3 p-2.5 bg-sky-50 rounded-lg border border-sky-200">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-sky-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-sky-600 font-medium">Airport</p>
              <p className="text-sm text-sky-900 font-semibold">{(event as any).airportName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Route Information - From → To */}
      <div className="mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium mb-1">Route</p>
            {/* Handle Self Drive - may only have fromLocation */}
            {isSelfDrive && !event.toLocation && !event.toCity ? (
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Pickup from:</span> {event.fromLocation || event.fromCity || "Pick-up location"}
              </p>
            ) : (
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{event.fromLocation || event.fromCity || "Pick-up location"}</span>
                <span className="mx-2 text-purple-600 font-bold">→</span>
                <span className="font-semibold">{event.toLocation || event.toCity || "Drop-off location"}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Type of Vehicle */}
      {event.vehicleType && (
        <div className="mb-2.5">
          <div className="flex items-center gap-1.5 text-sm">
            <Car className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Vehicle:</span>
            <span className="font-semibold text-gray-900">{event.vehicleType}</span>
          </div>
        </div>
      )}

      {/* Vehicle Capacity */}
      {event.capacity && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Capacity:</span>
            <span className="font-semibold text-gray-900">{event.capacity} pax</span>
          </div>
        </div>
      )}

      {/* Time Details */}
      <div className="space-y-2 mb-3">
        {/* Pickup/Departure Time */}
        {getDepartureTime() && (
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 p-2 rounded">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700">
              <span className="font-medium">{isBusOrTrain ? 'Departure' : 'Pickup'}:</span> {getDepartureTime()}
            </span>
          </div>
        )}

        {/* Drop/Arrival Time */}
        {getArrivalTime() && (
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 p-2 rounded">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700">
              <span className="font-medium">{isBusOrTrain ? 'Arrival' : 'Drop'}:</span> {getArrivalTime()}
            </span>
          </div>
        )}

        {/* Duration for Bus/Train */}
        {event.duration && isBusOrTrain && (
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 p-2 rounded">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700"><span className="font-medium">Duration:</span> {event.duration}</span>
          </div>
        )}
      </div>

      {/* Transfer Type Badge (Private/Shared) */}
      {event.transferType && (
        <div className="mb-3">
          <Badge
            className={`text-xs py-1 px-3 font-semibold ${event.transferType === 'private'
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200'
              }`}
          >
            {event.transferType.toUpperCase()} TRANSFER
          </Badge>
        </div>
      )}

      {/* Car Hire Specific Details */}
      {(isCarHire || event.noOfHours || event.noOfDays || event.carModel || event.fuelType || event.transmission) && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            Rental Details
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {event.noOfHours && (
              <div className="text-gray-700">
                <span className="font-medium">Duration:</span> {event.noOfHours} hours
              </div>
            )}
            {event.noOfDays && (
              <div className="text-gray-700">
                <span className="font-medium">Days:</span> {event.noOfDays} days
              </div>
            )}
            {event.carModel && (
              <div className="text-gray-700 col-span-2">
                <span className="font-medium">Model:</span> {event.carModel}
              </div>
            )}
            {event.fuelType && (
              <div className="text-gray-700">
                <span className="font-medium">Fuel:</span> {event.fuelType}
              </div>
            )}
            {event.transmission && (
              <div className="text-gray-700">
                <span className="font-medium">Transmission:</span> {event.transmission}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bus/Train Specific Details */}
      {isBusOrTrain && (event.busNumber || event.trainNumber || event.transferClass || event.pnr) && (
        <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <h5 className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            Journey Details
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {event.busNumber && (
              <div className="text-gray-700">
                <span className="font-medium">Bus No:</span> {event.busNumber}
              </div>
            )}
            {event.trainNumber && (
              <div className="text-gray-700">
                <span className="font-medium">Train No:</span> {event.trainNumber}
              </div>
            )}
            {event.transferClass && (
              <div className="text-gray-700">
                <span className="font-medium">Class:</span> {event.transferClass}
              </div>
            )}
            {event.pnr && (
              <div className="text-gray-700 col-span-2">
                <span className="font-medium">PNR:</span> {event.pnr}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {event.description && event.description.trim() && (
        <div className="mb-3 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-gray-700 leading-relaxed">{event.description}</p>
        </div>
      )}

      {/* Stops List */}
      {event.stopsList && event.stopsList.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold text-gray-700 mb-1.5">Stops</h5>
          <div className="flex flex-wrap gap-1.5">
            {event.stopsList.map((stop, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-50 text-xs text-yellow-800 border border-yellow-200 font-medium">
                {stop}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Amenities (for bus/train) */}
      {event.amenities && event.amenities.length > 0 && isBusOrTrain && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold text-gray-700 mb-1.5">Amenities</h5>
          <div className="flex flex-wrap gap-1.5">
            {event.amenities.map((amenity, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-teal-50 text-xs text-teal-700 border border-teal-200 font-medium">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Highlights (for other transfers) */}
      {event.highlights && event.highlights.length > 0 && !isBusOrTrain && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold text-gray-700 mb-1.5">Highlights</h5>
          <div className="flex flex-wrap gap-1.5">
            {event.highlights.map((highlight, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-purple-50 text-xs text-purple-700 border border-purple-200 font-medium">
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Vehicles */}
      {event.additionalVehicles && event.additionalVehicles.length > 0 && (
        <div className="mb-3 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
          <h5 className="text-xs font-semibold text-amber-900 mb-2">Additional Vehicles</h5>
          <div className="space-y-1.5">
            {event.additionalVehicles.map((vehicle, index) => (
              <div key={index} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-amber-100">
                <span className="text-gray-700 font-medium">
                  {vehicle.vehicleType} <span className="text-gray-500">({vehicle.capacity} pax)</span>
                </span>
                <span className="text-amber-700 font-semibold">
                  {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : "$"}
                  {vehicle.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Reference & Links (for non-bus/train) */}
      {(event.pnr || event.refundable || event.transferLink) && !isBusOrTrain && (
        <div className="mb-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
          <h5 className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" />
            Booking Info
          </h5>
          <div className="space-y-1 text-xs">
            {event.pnr && (
              <div className="text-gray-700">
                <span className="font-medium">PNR:</span> {event.pnr}
              </div>
            )}
            {event.refundable && (
              <div className="text-gray-700">
                <span className="font-medium">Policy:</span> {event.refundable}
              </div>
            )}
            {event.transferLink && (
              <div className="text-gray-700 flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                <a href={event.transferLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium">
                  View Booking
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Link for Bus/Train */}
      {isBusOrTrain && event.transferLink && (
        <div className="mb-3">
          <a
            href={event.transferLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-600 hover:underline flex items-center gap-1 font-medium"
          >
            <LinkIcon className="h-3 w-3" />
            View Booking Link
          </a>
        </div>
      )}

      {/* Refund Policy for Bus/Train */}
      {isBusOrTrain && event.refundable && (
        <div className="mb-3 text-xs">
          <span className="font-medium text-gray-700">Policy:</span>
          <span className="text-gray-600 ml-1">{event.refundable}</span>
        </div>
      )}

      {/* Images */}
      {event.images && event.images.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-semibold text-gray-700 mb-1.5">Photos</h5>
          <div className="grid grid-cols-4 gap-1.5">
            {event.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Transfer ${idx + 1}`} className="w-full h-14 object-cover rounded border border-gray-200" />
            ))}
          </div>
        </div>
      )}

      {/* Price - Always show if price exists */}
      {event.price && pricingEnabled && pricingMode === 'individual' && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              {priceResult ? priceResult.breakdown : "Total Price"}
            </span>
            <div className="text-right">
              {priceResult ? (
                <>
                  <span className="text-base font-bold text-purple-600">
                    {priceResult.displayPrice}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({priceResult.originalDisplayPrice}/pax)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base font-bold text-purple-600">
                    {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}
                    {event.price}
                  </span>
                  {event.capacity && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : "$"}
                      {(event.price / event.capacity).toFixed(2)}/pax)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
