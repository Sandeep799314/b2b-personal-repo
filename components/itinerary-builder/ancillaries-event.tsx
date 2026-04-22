"use client"

import { FileText, Shield, Coins, Globe, Calendar, Users, MapPin, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"
import { calculateComponentPrice } from "@/lib/pricing-calculator"

interface AncillariesEventProps {
    event: IItineraryEvent
    pricingEnabled?: boolean
    pricingAdults?: number
    pricingChildren?: number
    pricingCurrency?: string
    pricingMode?: 'individual' | 'total-only'
}

export function AncillariesEvent({
    event,
    pricingEnabled = false,
    pricingCurrency = "INR",
    pricingMode = 'individual',
    pricingAdults = 2,
    pricingChildren = 0,
}: AncillariesEventProps) {
    const subCategory = event.subCategory || "visa"

    const getIcon = () => {
        switch (subCategory) {
            case "visa":
                return <FileText className="h-4 w-4 text-orange-600" />
            case "forex":
                return <Coins className="h-4 w-4 text-green-600" />
            case "travel-insurance":
                return <Shield className="h-4 w-4 text-blue-600" />
            default:
                return <FileText className="h-4 w-4 text-gray-600" />
        }
    }

    const getTitle = () => {
        switch (subCategory) {
            case "visa":
                return "VISA"
            case "forex":
                return "FOREX"
            case "travel-insurance":
                return "INSURANCE"
            default:
                return "ANCILLARY"
        }
    }

    const getColorClass = () => {
        switch (subCategory) {
            case "visa":
                return "bg-orange-50 border-orange-200"
            case "forex":
                return "bg-green-50 border-green-200"
            case "travel-insurance":
                return "bg-blue-50 border-blue-200"
            default:
                return "bg-gray-50 border-gray-200"
        }
    }

    const renderVisaDetails = () => (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-700">
            {event.country && (
                <div className="flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-slate-400" />
                    <span>Country: <span className="font-medium">{event.country}</span></span>
                </div>
            )}
            {event.visaType && (
                <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-slate-400" />
                    <span>Type: <span className="font-medium">{event.visaType}</span></span>
                </div>
            )}
            {event.visaDuration && (
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>Duration: <span className="font-medium">{event.visaDuration}</span></span>
                </div>
            )}
            {event.entryMethod && (
                <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>Entry: <span className="font-medium">{event.entryMethod}</span></span>
                </div>
            )}
            {((event as any).departureDate || (event as any).returnDate) && (
                <div className="col-span-2 flex items-center gap-1.5 mt-1 border-t border-orange-100 pt-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>
                        Travel: {(event as any).departureDate}
                        {(event as any).returnDate && ` to ${(event as any).returnDate}`}
                    </span>
                </div>
            )}
        </div>
    )

    const renderForexDetails = () => (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-700">
            {event.forexCurrency && (
                <div className="flex items-center gap-1.5">
                    <Coins className="h-3 w-3 text-slate-400" />
                    <span>Currency: <span className="font-medium">{event.forexCurrency}</span></span>
                </div>
            )}
            {event.amount && (
                <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3 w-3 text-slate-400" />
                    <span>Amount: <span className="font-medium">{event.amount}</span></span>
                </div>
            )}
            <div className="col-span-2 text-slate-500 italic mt-1">
                Base Currency: {event.baseCurrency || "INR"}
            </div>
        </div>
    )

    const renderInsuranceDetails = () => (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-700">
            {event.insuranceType && (
                <div className="col-span-2 flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-slate-400" />
                    <span className="font-medium text-slate-900">{event.insuranceType}</span>
                </div>
            )}
            {event.destinations && event.destinations.length > 0 && (
                <div className="col-span-2 flex items-start gap-1.5">
                    <MapPin className="h-3 w-3 text-slate-400 mt-0.5" />
                    <span>Destinations: <span className="font-medium">{event.destinations.join(", ")}</span></span>
                </div>
            )}
            {(event.startDate || event.endDate) && (
                <div className="col-span-2 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>
                        Valid: {event.startDate}
                        {event.endDate && ` — ${event.endDate}`}
                    </span>
                </div>
            )}
            {event.noOfTravellers && (
                <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span>Travellers: <span className="font-medium">{event.noOfTravellers}</span></span>
                </div>
            )}
            {event.sumInsured && (
                <div className="flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-slate-400" />
                    <span>Sum Insured: <span className="font-medium">{event.sumInsured}</span></span>
                </div>
            )}
        </div>
    )

    // Always calculate price conversion when price exists
    const priceResult = event.price
        ? calculateComponentPrice(event, {
            adults: pricingAdults,
            children: pricingChildren,
            targetCurrency: pricingCurrency
        })
        : null

    return (
        <div className={`p-2 rounded-lg border relative ${getColorClass()}`}>
            <EventSourceBadge event={event} />

            {/* Header */}
            <div className="flex items-center gap-1.5 mb-2">
                {getIcon()}
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">{getTitle()}</h3>
            </div>

            {/* Main Content */}
            <div className="mb-2">
                <h4 className="text-sm font-bold text-gray-900 mb-1">{event.title}</h4>
                {event.description && <p className="text-xs text-slate-600 leading-snug">{event.description}</p>}
            </div>

            {/* Specific Details */}
            <div className="bg-white/60 rounded p-2 mb-2 border border-white/40">
                {subCategory === "visa" && renderVisaDetails()}
                {subCategory === "forex" && renderForexDetails()}
                {subCategory === "travel-insurance" && renderInsuranceDetails()}
            </div>

            {/* Pricing - Always show if price exists */}
            {event.price && pricingEnabled && pricingMode === 'individual' && (
                <div className="pt-2 border-t border-slate-200 mt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            {event.serviceCharge ? "Total Fee (inc. service)" : "Price"}
                        </span>
                        <div className="text-right">
                            {(subCategory === "visa" || subCategory === "travel-insurance") ? (
                                <>
                                    {priceResult && (
                                        <div className="text-xs text-slate-500 mb-0.5">
                                            {priceResult.breakdown}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-sm font-bold text-slate-900">
                                            {priceResult ? priceResult.displayPrice : `${event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}${event.price}`}
                                        </span>
                                        {priceResult && priceResult.originalCurrency !== pricingCurrency && (
                                            <span className="text-xs text-slate-400">
                                                ({priceResult.originalDisplayPrice}/pax)
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <span className="text-sm font-bold text-slate-900">
                                    {priceResult ? priceResult.displayPrice : `${event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : event.currency === "AED" ? "AED " : "$"}${event.price}`}
                                </span>
                            )}
                        </div>
                    </div>
                    {event.serviceCharge && (
                        <div className="text-right text-[10px] text-slate-400">
                            Base: {event.price} + Service: {event.serviceCharge}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
