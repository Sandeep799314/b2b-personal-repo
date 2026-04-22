"use client"

import { Ship, Clock, MapPin, MoreVertical, Edit, Trash2 } from "lucide-react"
import { IItineraryEvent } from "@/models/Itinerary"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EventSourceBadge } from "./source-badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { calculateComponentPrice } from "@/lib/pricing-calculator"

interface CruiseEventProps {
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

export function CruiseEvent({
    event,
    isDetailedView = true,
    onEdit,
    onDelete,
    pricingEnabled = false,
    pricingAdults = 2,
    pricingChildren = 0,
    pricingCurrency = "INR",
    pricingMode = 'individual',
}: CruiseEventProps) {

    // Always calculate price conversion when price exists
    const priceResult = event.price
        ? calculateComponentPrice(event, {
            adults: pricingAdults,
            children: pricingChildren,
            targetCurrency: pricingCurrency
        })
        : null

    if (!isDetailedView) {
        return (
            <div className="bg-white p-2 rounded-lg border border-gray-200 relative">
                <EventSourceBadge event={event} />
                <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm font-semibold text-gray-800">{event.title || "Cruise"}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative group">
            <EventSourceBadge event={event} />

            {(onEdit || onDelete) && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onEdit && (
                                <DropdownMenuItem onClick={onEdit}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-50 rounded-lg shrink-0">
                    <Ship className="h-5 w-5 text-cyan-600" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-gray-900">{event.title || "Cruise"}</h4>
                            {event.time && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{event.time}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {event.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{event.location}</span>
                        </div>
                    )}

                    {event.description && (
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{event.description}</p>
                    )}

                    {event.highlights && event.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {event.highlights.map((highlight, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                                    {highlight}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Price - Always show if price exists */}
            {event.price && pricingEnabled && pricingMode === 'individual' && (
                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Price</span>
                    <div className="text-right">
                        {priceResult ? (
                            <>
                                <span className="text-sm font-bold text-cyan-700">
                                    {priceResult.displayPrice}
                                </span>
                                <span className="text-xs text-slate-400 ml-1">
                                    ({priceResult.originalDisplayPrice})
                                </span>
                            </>
                        ) : (
                            <span className="text-sm font-bold text-cyan-700">
                                {event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}{event.price}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
