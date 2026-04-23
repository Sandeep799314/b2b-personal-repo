import React from "react"
import {
    MapPin,
    Calendar,
    Users,
    Clock,
    Mail,
    Phone,
    Instagram,
    Facebook,
    Twitter,
    Globe,
} from "lucide-react"
import { calculateTotalPrice, PricingConfig, getExchangeRates as getGlobalRates } from "@/lib/pricing-calculator"
import { convertCurrency } from "@/lib/currency-utils"
import { EventCard } from "../event-card"
import { IItineraryEvent } from "@/models/Itinerary"

interface ClassicTemplateProps {
    itinerary: any
    showPrices: boolean
    showItemizedPrices?: boolean
    isDetailed?: boolean
    currency: string
    exchangeRates: Record<string, number>
}

export function ClassicTemplate({
    itinerary,
    showPrices,
    showItemizedPrices = true,
    isDetailed = true,
    currency,
    exchangeRates,
}: ClassicTemplateProps) {
    const previewConfig = itinerary.previewConfig || {}
    const days = itinerary.days || []

    // Calculate total price based on pax if available, else use total
    const adults = previewConfig.adults || 1
    const children = previewConfig.children || 0
    const totalPax = adults + children

    // Build pricing configuration
    const pricingConfig: PricingConfig = {
        adults,
        children,
        targetCurrency: currency,
        exchangeRates,
        baseCurrency: 'INR'
    }

    // Calculate total price using pricing calculator
    const allEvents = days.flatMap((day: any) => day.events || [])
    const { total: basePrice } = calculateTotalPrice(allEvents, pricingConfig)

    // Calculate markup
    let markupAmount = 0
    if (itinerary.markupType === "percentage") {
        markupAmount = basePrice * (itinerary.markupValue || 0) / 100
    } else if (itinerary.markupType === "amount" && itinerary.markupValue) {
        // Convert markup value from original itinerary currency to target currency
        const { rates, baseCurrency: globalBase } = (exchangeRates && Object.keys(exchangeRates).length > 0)
            ? { rates: exchangeRates, baseCurrency: 'INR' } // Assume INR is base if not specified
            : getGlobalRates()
            
        markupAmount = convertCurrency(
            itinerary.markupValue,
            itinerary.currency || "INR",
            currency,
            rates,
            globalBase
        )
    }

    const finalTotal = basePrice + markupAmount
    const displayTotal = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(finalTotal)

    // Date helpers
    const getStartDate = () => {
        if (previewConfig.withDates && previewConfig.startDate) {
            return new Date(previewConfig.startDate)
        }
        return null
    }
    const startDate = getStartDate()
    const endDate = startDate ? new Date(new Date(startDate).getTime() + (days.length - 1) * 24 * 60 * 60 * 1000) : null

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const getDayDate = (dayIndex: number) => {
        if (!startDate) return null
        const d = new Date(startDate)
        d.setDate(d.getDate() + dayIndex)
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    }

    return (
        <div className="w-full bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 min-h-screen">
            {/* ------------------- HEADER ------------------- */}
            <header className="bg-white border-b border-slate-200 px-8 py-8 md:py-12 mb-8 shadow-sm">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="text-left space-y-4 max-w-lg">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                            {itinerary.title}
                        </h1>
                        {itinerary.description && (
                            <p className="text-base text-slate-600 leading-relaxed">
                                {itinerary.description}
                            </p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium pt-2">
                            <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200">
                                {itinerary.productId}
                            </span>
                            {/* Add more meta info tags here if needed */}
                        </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-6">
                        {itinerary.branding?.logo && (
                            <img
                                src={itinerary.branding.logo}
                                alt="Company Logo"
                                className="h-20 w-auto object-contain"
                            />
                        )}
                        <div className="text-left md:text-right">
                            <h2 className="text-xl font-bold text-slate-900">
                                {itinerary.branding?.companyName || "Travel Agency"}
                            </h2>
                            <div className="text-sm text-slate-500 mt-1 flex flex-col md:items-end gap-1">
                                {itinerary.branding?.contactEmail && (
                                    <a href={`mailto:${itinerary.branding.contactEmail}`} className="hover:text-blue-600 transition-colors">
                                        {itinerary.branding.contactEmail}
                                    </a>
                                )}
                                {itinerary.branding?.contactPhone && (
                                    <a href={`tel:${itinerary.branding.contactPhone}`} className="hover:text-blue-600 transition-colors">
                                        {itinerary.branding.contactPhone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-8 pb-12 space-y-12">
                {/* ------------------- TRIP OVERVIEW CARD ------------------- */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Users className="h-4 w-4" />
                            <span>Prepared For</span>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">{previewConfig.customerName || "Valued Guest"}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <MapPin className="h-4 w-4" />
                            <span>Destination</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                            {itinerary.country || "Multiple Destinations"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Calendar className="h-4 w-4" />
                            <span>Duration</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                            {days.length} Days
                            <span className="text-slate-400 text-base font-normal ml-1">/ {Math.max(0, days.length - 1)} Nights</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Clock className="h-4 w-4" />
                            <span>Dates</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                            {startDate && endDate ? (
                                <>
                                    <span className="block whitespace-nowrap">{formatDate(startDate)} -</span>
                                    <span className="block whitespace-nowrap">{formatDate(endDate)}</span>
                                </>
                            ) : "Dates Flexible"}
                        </div>
                    </div>
                </section>

                {/* ------------------- DAILY ITINERARY ------------------- */}
                <div className="space-y-8">
                    {days.map((day: any, index: number) => (
                        <div key={index} className="space-y-4">
                            {/* Day Header */}
                            <div className="flex items-center gap-4 py-2 border-b-2 border-slate-200">
                                <div className="bg-blue-600 text-white font-bold rounded-lg px-4 py-2 text-xl shadow-sm">
                                    Day {day.day}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between flex-wrap gap-2">
                                        <h3 className="text-xl font-bold text-slate-800">
                                            {day.title && day.title !== `Day ${day.day}` ? day.title : (startDate ? getDayDate(index) : `Day ${day.day} Itinerary`)}
                                        </h3>
                                        {startDate && day.title && day.title !== `Day ${day.day}` && (
                                            <span className="text-sm font-medium text-slate-500">
                                                {getDayDate(index)}
                                            </span>
                                        )}
                                    </div>
                                    {day.description && (
                                        <p className="text-slate-600 mt-1 text-sm leading-relaxed max-w-3xl">
                                            {day.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Day Events List */}
                            <div className="grid gap-4 pl-0 md:pl-4">
                                {day.events && day.events.length > 0 ? (
                                    day.events.map((event: IItineraryEvent, evtIdx: number) => (
                                        <div key={evtIdx}>
                                            <EventCard
                                                event={event}
                                                isDetailedView={isDetailed} // Respect the detailed toggle
                                                pricingEnabled={showPrices}
                                                pricingAdults={pricingConfig.adults}
                                                pricingChildren={pricingConfig.children}
                                                pricingCurrency={pricingConfig.targetCurrency}
                                                pricingMode={showItemizedPrices ? 'individual' : 'total-only'}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 italic">
                                        No activities scheduled for this day
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ------------------- TOTAL PRICING ------------------- */}
                {showPrices && (
                    <section className="bg-slate-900 text-white rounded-xl p-8 md:p-10 shadow-lg break-inside-avoid">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="space-y-2 text-center md:text-left">
                                <h3 className="text-2xl font-bold uppercase tracking-wider">TRIP COST</h3>
                                <p className="text-slate-400 text-sm max-w-md">
                                    Includes all accommodation, transfers, activities, and meals as specified in the itinerary.
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-5xl font-bold tracking-tight text-white mb-2">
                                    {displayTotal}
                                </div>
                                <p className="text-blue-200 text-sm font-medium bg-blue-900/50 px-3 py-1 rounded-full inline-block border border-blue-800">
                                    Price for {totalPax} Traveler{totalPax !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* ------------------- FOOTER ------------------- */}
            <footer className="bg-white border-t border-slate-200 pt-12 pb-8 px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                        <div className="space-y-4 max-w-xs">
                            <h4 className="font-bold text-lg text-slate-900">
                                {itinerary.branding?.companyName || "Travel Agency"}
                            </h4>
                            <div className="text-sm text-slate-600 space-y-2">
                                {itinerary.branding?.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <span>{itinerary.branding.address}</span>
                                    </div>
                                )}
                                {itinerary.branding?.contactEmail && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                        <a href={`mailto:${itinerary.branding.contactEmail}`} className="hover:text-blue-600 transition-colors">
                                            {itinerary.branding.contactEmail}
                                        </a>
                                    </div>
                                )}
                                {itinerary.branding?.contactPhone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                        <a href={`tel:${itinerary.branding.contactPhone}`} className="hover:text-blue-600 transition-colors">
                                            {itinerary.branding.contactPhone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Links */}
                        {(itinerary.branding?.socialLinks?.instagram ||
                            itinerary.branding?.socialLinks?.facebook ||
                            itinerary.branding?.socialLinks?.twitter ||
                            itinerary.branding?.socialLinks?.website) && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Connect With Us</h4>
                                    <div className="flex gap-4">
                                        {itinerary.branding?.socialLinks?.instagram && (
                                            <a href={itinerary.branding.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-all">
                                                <Instagram className="h-5 w-5" />
                                            </a>
                                        )}
                                        {itinerary.branding?.socialLinks?.facebook && (
                                            <a href={itinerary.branding.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                        )}
                                        {itinerary.branding?.socialLinks?.twitter && (
                                            <a href={itinerary.branding.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-all">
                                                <Twitter className="h-5 w-5" />
                                            </a>
                                        )}
                                        {itinerary.branding?.socialLinks?.website && (
                                            <a href={itinerary.branding.socialLinks.website} target="_blank" rel="noopener noreferrer" className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all">
                                                <Globe className="h-5 w-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    <div className="border-t border-slate-100 pt-6 text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                            &copy; {new Date().getFullYear()} {itinerary.branding?.companyName || "All Rights Reserved"} • Generated by Trav Platforms
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
