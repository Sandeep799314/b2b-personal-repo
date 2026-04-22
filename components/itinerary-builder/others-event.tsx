
import { IItineraryEvent } from "@/models/Itinerary"
import { Badge } from "@/components/ui/badge"
import { EventSourceBadge } from "./source-badge"
import { Speaker, Tag } from "lucide-react"
import { calculateOthersPrice } from "@/lib/pricing-calculator"

interface OthersEventProps {
    event: IItineraryEvent
    pricingEnabled?: boolean
    pricingCurrency?: string
    pricingAdults?: number
    pricingChildren?: number
    pricingMode?: 'individual' | 'total-only'
}

// Helper to format price for display (used for individual items)
const formatPrice = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function OthersEvent({
    event,
    pricingEnabled = true,
    pricingCurrency = "INR",
    pricingAdults = 1,
    pricingChildren = 0,
    pricingMode = 'individual'
}: OthersEventProps) {
    const isGiftCard = event.subCategory === "gift-cards"
    const isTravelGear = event.subCategory === "travel-gears"

    // Always calculate price conversion when price exists
    const priceResult = (event.price || (event.travelGears && event.travelGears.length > 0))
        ? calculateOthersPrice(event, {
            adults: pricingAdults,
            children: pricingChildren,
            targetCurrency: pricingCurrency
        })
        : null

    const displayAmount = priceResult
        ? priceResult.displayPrice
        : formatPrice((event.price || 0) + (isGiftCard ? (event.serviceCharge || 0) : 0), event.currency)

    // For original currency display (Small)
    const originalAmount = priceResult?.originalDisplayPrice

    return (
        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
            <EventSourceBadge event={event} />

            {/* Generic Header matching Flight/Transfer/Hotel style */}
            <div className="mb-1.5 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                    {/* Using valid Lucide icon for Others */}
                    <div className="h-3.5 w-3.5 text-slate-600">
                        {isGiftCard ? <Tag className="h-3.5 w-3.5" /> : <Speaker className="h-3.5 w-3.5" />}
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Others</h3>
                </div>
            </div>

            {/* Sub-Header: Badge + Title */}
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 py-0 px-1.5 flex items-center gap-1 h-5 whitespace-nowrap">
                    {isGiftCard ? "GIFT CARD" : "TRAVEL GEAR"}
                </Badge>
                {event.title && (
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{event.title}</h4>
                )}
            </div>

            {/* Content Section */}
            {isGiftCard && (
                null
            )}

            {isTravelGear && (
                <div className="mb-2">
                    {event.travelGears && event.travelGears.length > 0 ? (
                        <div className="space-y-1.5">
                            {event.travelGears.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 rounded p-2 flex justify-between items-start">
                                    <div className="min-w-0 flex-1 mr-2">
                                        <div className="text-xs font-semibold text-gray-800 truncate">{item.name}</div>
                                        {item.description && (
                                            <div className="text-[10px] text-gray-500 truncate">{item.description}</div>
                                        )}
                                    </div>
                                    <div className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                                        {Number(item.price) > 0 ? formatPrice(Number(item.price), item.currency || event.currency) : "Included"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-slate-400 italic p-1">No items added</div>
                    )}
                </div>
            )}

            {/* Footer Pricing Section - Always show if price exists */}
            {(event.price || (event.travelGears && event.travelGears.length > 0)) && pricingEnabled && pricingMode === 'individual' && (
                <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Price
                        </span>
                        <div className="text-right">
                            <span className="text-base font-bold text-gray-900">
                                {displayAmount}
                            </span>
                            {/* Show original currency in brackets if different or always as per request? User said "actual currency as saved in component" */}
                            {priceResult && (
                                <span className="text-xs text-gray-500 ml-1">
                                    ({originalAmount})
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
