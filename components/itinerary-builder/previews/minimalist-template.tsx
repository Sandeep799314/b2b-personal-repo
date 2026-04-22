import React from "react"
import {
    MapPin,
    Calendar,
    Users,
    Clock,
    Plane,
    Building2,
    UtensilsCrossed,
    Car,
    Tent,
    CreditCard,
    Briefcase,
    StickyNote,
    Info,
    CheckCircle2,
    Mail,
    Phone,
    Globe,
    Instagram,
    Facebook,
    Twitter,
    Luggage,
    Shield,
    FileText,
    BadgePercent,
    Train,
    Bus
} from "lucide-react"
import { calculateComponentPrice, PricingConfig, calculateTotalPrice } from "@/lib/pricing-calculator"

interface MinimalistTemplateProps {
    itinerary: any
    showPrices: boolean
    showItemizedPrices?: boolean
    isDetailed?: boolean
    currency: string
    exchangeRates: Record<string, number>
}

// ----------------------------------------------------------------------
// 1. HELPER FUNCTIONS & COMPONENTS
// ----------------------------------------------------------------------

// Helper to get icon for category
const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'flight': return <Plane className="h-4 w-4" />
        case 'hotel': return <Building2 className="h-4 w-4" />
        case 'meal': return <UtensilsCrossed className="h-4 w-4" />
        case 'transfer': return <Car className="h-4 w-4" />
        case 'activity': return <Tent className="h-4 w-4" />
        case 'ancillaries': return <CreditCard className="h-4 w-4" />
        case 'others': return <Briefcase className="h-4 w-4" />
        case 'note': return <StickyNote className="h-4 w-4" />
        case 'additionalInformation': return <Info className="h-4 w-4" />
        default: return <CheckCircle2 className="h-4 w-4" />
    }
}

// Helper: Field Row
const FieldRow = ({ label, value, icon: Icon }: { label: string, value: React.ReactNode, icon?: any }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-2 text-xs text-slate-700">
            {Icon && <Icon className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />}
            <span className="font-semibold text-slate-500 whitespace-nowrap">{label}:</span>
            <span className="font-medium text-slate-800 break-words">{value}</span>
        </div>
    )
}

// Helper: Badge List
const BadgeList = ({ items, className = "" }: { items: string[], className?: string }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {items.map((item, idx) => (
                <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {item}
                </span>
            ))}
        </div>
    )
}

// ----------------------------------------------------------------------
// 2. DETAILED RENDERERS
// ----------------------------------------------------------------------

const FlightDetails = ({ event }: { event: any }) => {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {/* Main Info */}
                {(event.airlines || event.flightNumber) && (
                    <FieldRow label="Airline" value={`${event.airlines || ''} ${event.flightNumber || ''}`.trim()} icon={Plane} />
                )}
                {(event.fromCity || event.toCity || event.fromLocation || event.toLocation) && (
                    <FieldRow
                        label="Route"
                        value={`${event.fromCity || event.fromLocation || 'Origin'} ➝ ${event.toCity || event.toLocation || 'Destination'}`}
                        icon={MapPin}
                    />
                )}

                {/* Times & Duration */}
                {(event.startTime || event.departureTime || event.endTime || event.arrivalTime) && (
                    <FieldRow
                        label="Schedule"
                        value={`${event.startTime || event.departureTime || '--'} - ${event.endTime || event.arrivalTime || '--'}`}
                        icon={Clock}
                    />
                )}
                {event.duration && <FieldRow label="Duration" value={event.duration} icon={Clock} />}

                {/* Specifics */}
                {event.flightClass && <FieldRow label="Class" value={event.flightClass} icon={BadgePercent} />}
                {event.seatNumber && <FieldRow label="Seat" value={event.seatNumber} />}
                {event.inFlightMeals && <FieldRow label="Meal" value={event.inFlightMeals} icon={UtensilsCrossed} />}
                {event.pnr && <FieldRow label="PNR" value={event.pnr} icon={FileText} />}
                {event.bookingId && <FieldRow label="Booking ID" value={event.bookingId} icon={FileText} />}
            </div>

            {/* Detailed Baggage */}
            {(event.checkinBags || event.cabinBags || event.baggage) && (
                <div className="bg-slate-50 p-2 rounded border border-slate-100 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <Luggage className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-500">Baggage Details:</span>
                    </div>
                    {event.checkinBags ? (
                        <div className="grid grid-cols-2 gap-2 pl-5">
                            <span>• Check-in: {event.checkinBags}pc {event.checkinBagWeight ? `(${event.checkinBagWeight})` : ''}</span>
                            {event.cabinBags && <span>• Cabin: {event.cabinBags}pc {event.cabinBagWeight ? `(${event.cabinBagWeight})` : ''}</span>}
                        </div>
                    ) : (
                        <div className="pl-5">{event.baggage}</div>
                    )}
                </div>
            )}

            {/* Stops */}
            {(event.numberOfStops !== undefined || event.stops) && (
                <FieldRow
                    label="Stops"
                    value={
                        event.numberOfStops !== undefined
                            ? (event.numberOfStops === 0 ? "Non-stop" : `${event.numberOfStops} Stop(s)${event.stopLocations?.length ? ` via ${event.stopLocations.join(', ')}` : ''}`)
                            : event.stops
                    }
                />
            )}
        </div>
    )
}

const HotelDetails = ({ event }: { event: any }) => {
    return (
        <div className="space-y-2">
            {/* Primary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {(event.checkIn || event.checkOut) && (
                    <FieldRow
                        label="Stay"
                        value={`${event.checkIn || 'Check-in'} ➝ ${event.checkOut || 'Check-out'}`}
                        icon={Calendar}
                    />
                )}
                {event.hotelRating && <FieldRow label="Rating" value={`${event.hotelRating} Stars`} icon={BadgePercent} />}
                {event.roomCategory && <FieldRow label="Room" value={event.roomCategory} icon={Building2} />}
                {event.mealPlan && <FieldRow label="Meal Plan" value={event.mealPlan} icon={UtensilsCrossed} />}
                {event.confirmationNumber && <FieldRow label="Conf. No" value={event.confirmationNumber} icon={FileText} />}
                {event.propertyType && <FieldRow label="Type" value={event.propertyType} />}
            </div>

            {/* Address & Links */}
            {event.address && <FieldRow label="Address" value={event.address} icon={MapPin} />}
            {event.hotelLink && (
                <div className="flex items-center gap-2 text-xs">
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                    <a href={event.hotelLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                        View Hotel Website
                    </a>
                </div>
            )}

            {/* Amenities */}
            {event.amenities && event.amenities.length > 0 && (
                <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1">Amenities:</span>
                    <BadgeList items={event.amenities} />
                </div>
            )}
        </div>
    )
}

const TransferDetails = ({ event }: { event: any }) => {
    return (
        <div className="space-y-3">
            {/* Vehicle Head */}
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded border border-slate-100">
                {event.vehicleType && <FieldRow label="Vehicle" value={event.vehicleType} icon={Car} />}
                {event.transferType && <FieldRow label="Type" value={event.transferType} />}
            </div>

            {/* Route Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-1 sm:col-span-2">
                    <FieldRow
                        label="Route"
                        value={`${event.fromLocation || event.fromCity || 'Pickup'} ➝ ${event.toLocation || event.toCity || 'Dropoff'}`}
                        icon={MapPin}
                    />
                </div>
                {(event.pickupTime || event.departureTime) && <FieldRow label="Pickup Time" value={event.pickupTime || event.departureTime} icon={Clock} />}
                {(event.dropTime || event.arrivalTime) && <FieldRow label="Drop Time" value={event.dropTime || event.arrivalTime} icon={Clock} />}
            </div>

            {/* Driver & Rental Specifics */}
            {(event.driverName || event.driverContact || event.noOfHours || event.noOfDays) && (
                <div className="bg-slate-50 p-2 rounded border border-slate-100 text-xs space-y-2">
                    {event.driverName && (
                        <FieldRow label="Driver" value={`${event.driverName} ${event.driverContact ? `(${event.driverContact})` : ''}`} icon={Users} />
                    )}
                    {(event.noOfHours || event.noOfDays) && (
                        <FieldRow
                            label="Rental Package"
                            value={`${event.noOfHours ? `${event.noOfHours} Hrs` : ''} ${event.noOfDays ? `${event.noOfDays} Days` : ''}`}
                            icon={Clock}
                        />
                    )}
                    {event.kmLimit && <FieldRow label="KM Limit" value={`${event.kmLimit} km`} />}
                </div>
            )}

            {/* Train/Bus Specifics */}
            {(event.trainNumber || event.busNumber || event.pnr) && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {event.trainNumber && <FieldRow label="Train No" value={event.trainNumber} icon={Train} />}
                    {event.busNumber && <FieldRow label="Bus No" value={event.busNumber} icon={Bus} />}
                    {event.pnr && <FieldRow label="PNR" value={event.pnr} />}
                    {event.transferClass && <FieldRow label="Class" value={event.transferClass} />}
                </div>
            )}
        </div>
    )
}

const MealDetails = ({ event }: { event: any }) => {
    // Map standard meal keys to labels
    const getMealLabel = (key: string) => {
        const map: any = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", highTea: "High Tea", allInclusive: "All Inclusive" };
        return map[key] || key;
    };

    return (
        <div className="space-y-2">
            {/* Types */}
            {event.meals && event.meals.length > 0 && (
                <div>
                    <span className="text-xs font-semibold text-slate-500 mr-2">Meal Type:</span>
                    <BadgeList items={event.meals.map((m: string) => getMealLabel(m))} className="inline-flex" />
                </div>
            )}

            {/* Custom Details */}
            {event.customMealDescription && (
                <div className="bg-orange-50 p-2 rounded border border-orange-100 text-xs text-orange-800">
                    <span className="font-semibold block mb-1">Details:</span>
                    {event.customMealDescription}
                </div>
            )}

            {event.location && <FieldRow label="Restaurant/Venue" value={event.location} icon={MapPin} />}
        </div>
    )
}

const ActivityDetails = ({ event }: { event: any }) => {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {event.location && <FieldRow label="Location" value={event.location} icon={MapPin} />}
                {event.duration && <FieldRow label="Duration" value={event.duration} icon={Clock} />}
                {event.difficulty && <FieldRow label="Difficulty" value={event.difficulty} icon={BadgePercent} />}
                {event.capacity && <FieldRow label="Capacity" value={`${event.capacity} Pax`} icon={Users} />}
            </div>

            {event.highlights && event.highlights.length > 0 && (
                <div className="pt-1">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">Highlights:</span>
                    <BadgeList items={event.highlights} />
                </div>
            )}

            {(event.pickupLocation || event.dropoffLocation) && (
                <div className="text-xs mt-2 bg-slate-50 p-2 rounded text-slate-600">
                    {event.pickupLocation && <div><span className="font-semibold">Pickup:</span> {event.pickupLocation}</div>}
                    {event.dropoffLocation && <div><span className="font-semibold">Dropoff:</span> {event.dropoffLocation}</div>}
                </div>
            )}
        </div>
    )
}

const AncillaryDetails = ({ event }: { event: any }) => {
    return (
        <div className="space-y-2 text-xs">
            {event.subCategory && <BadgeList items={[event.subCategory]} />}

            {/* Visa */}
            {event.visaType && <FieldRow label="Visa Type" value={event.visaType} />}
            {event.visaDuration && <FieldRow label="Duration" value={event.visaDuration} />}
            {event.entryMethod && <FieldRow label="Entry" value={event.entryMethod} />}

            {/* Insurance */}
            {event.insuranceType && <FieldRow label="Plan" value={event.insuranceType} icon={Shield} />}
            {event.sumInsured && <FieldRow label="Cover" value={event.sumInsured} />}
            {event.insuranceProvider && <FieldRow label="Provider" value={event.insuranceProvider} />}
            {event.policyNumber && <FieldRow label="Policy No" value={event.policyNumber} />}

            {/* Forex */}
            {event.forexCurrency && (
                <FieldRow
                    label="Forex"
                    value={`${event.forexCurrency} ${event.amount || ''}`}
                    icon={CreditCard}
                />
            )}
        </div>
    )
}


// ----------------------------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------------------------

export function MinimalistTemplate({ itinerary, showPrices, showItemizedPrices = true, isDetailed = true, currency, exchangeRates }: MinimalistTemplateProps) {
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
    const { total: calculatedTotal, displayTotal } = calculateTotalPrice(allEvents, pricingConfig)

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
        <div className="w-full bg-white text-slate-800 font-sans selection:bg-slate-100">
            {/* ------------------- HEADER ------------------- */}
            <header className="flex justify-between items-start pb-8 pt-4 border-b border-slate-100 mb-8 break-inside-avoid">
                <div className="text-left space-y-2 max-w-lg">
                    <h1 className="text-3xl font-serif font-medium text-slate-900 leading-tight">
                        {itinerary.title}
                    </h1>
                    {itinerary.description && (
                        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                            {itinerary.description}
                        </p>
                    )}
                    <div className="flex items-center justify-start gap-2 text-slate-400 text-xs uppercase tracking-wider font-medium pt-1">
                        <span>{itinerary.productId}</span>
                        {/* {itinerary.productReferenceCode && <span>• {itinerary.productReferenceCode}</span>} */}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {itinerary.branding?.logo ? (
                        <img src={itinerary.branding.logo} alt="Company Logo" className="h-16 w-auto object-contain" />
                    ) : null}
                    <div className="h-14 flex items-center">
                        <h2 className="text-xl font-serif font-bold tracking-tight text-slate-900">
                            {itinerary.branding?.companyName || "Travel Agency"}
                        </h2>
                    </div>
                </div>
            </header>

            {/* ------------------- TRIP OVERVIEW ------------------- */}
            <section className="flex flex-wrap gap-6 mb-12 p-6 bg-slate-50 rounded-xl border border-slate-100 break-inside-avoid">
                <div className="space-y-1 flex-1 min-w-[140px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prepared For</span>
                    <p className="text-base font-semibold text-slate-900">{previewConfig.customerName || "Valued Guest"}</p>
                </div>

                {/* Destination */}
                <div className="space-y-1 flex-1 min-w-[140px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination</span>
                    <div className="flex items-center gap-1.5 text-slate-900 font-medium text-sm">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {itinerary.country || "Multiple Destinations"}
                    </div>
                </div>

                {/* Travelers Count */}
                <div className="space-y-1 flex-1 min-w-[140px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Travelers</span>
                    <div className="flex items-center gap-1.5 text-slate-900 font-medium text-sm">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <p>{adults} Adult{adults !== 1 ? 's' : ''}, {children} Child{children !== 1 ? 'ren' : ''}</p>
                    </div>
                </div>

                <div className="space-y-1 flex-1 min-w-[140px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duration</span>
                    <div className="flex items-center gap-1.5 text-slate-900 font-medium text-sm">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {days.length} Days / {Math.max(0, days.length - 1)} Nights
                    </div>
                </div>

                <div className="space-y-1 flex-1 min-w-[140px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Travel Dates</span>
                    <div className="flex items-center gap-1.5 text-slate-900 font-medium text-sm">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : "Dates Flexible"}
                    </div>
                </div>
            </section>

            {/* ------------------- ITINERARY BODY ------------------- */}
            <div className="space-y-10">
                {days.map((day: any, index: number) => (
                    <article key={index} className="relative pl-0 page-break-inside-auto">

                        <div className="flex flex-col md:flex-row gap-6 items-start page-break-inside-avoid">
                            {/* Day Marker */}
                            <div className="md:w-32 flex-shrink-0 md:text-right sticky top-4">
                                <div className="flex flex-col md:items-end">
                                    <span className="text-2xl font-serif font-bold text-slate-900 leading-none mb-1">
                                        Day {day.day}
                                    </span>
                                    {startDate && (
                                        <span className="text-sm font-medium text-blue-600">
                                            {getDayDate(index)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Day Content */}
                            <div className="flex-1 space-y-4 border-l border-slate-200 pl-6 pb-8 last:border-0 last:pb-0">
                                {/* Day Description */}
                                <div className="mb-4">
                                    {day.title && day.title !== `Day ${day.day}` && (
                                        <h4 className="text-lg font-semibold text-slate-800">{day.title}</h4>
                                    )}
                                    {day.description && (
                                        <p className="text-slate-600 leading-relaxed max-w-2xl mt-2 text-sm">{day.description}</p>
                                    )}
                                </div>

                                {/* Events List */}
                                <div className="grid gap-6">
                                    {day.events.map((event: any, evtIdx: number) => {
                                        // Calculate pricing for this event
                                        const priceResult = showPrices && event.price ? calculateComponentPrice(event, pricingConfig) : null

                                        return (
                                            <div
                                                key={evtIdx}
                                                className="group relative bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-all break-inside-avoid shadow-sm"
                                            >
                                                <div className="flex gap-4 items-start">
                                                    {/* Category Icon */}
                                                    <div className={`p-2.5 rounded-md flex-shrink-0 bg-slate-50 text-slate-600`}>
                                                        {getCategoryIcon(event.category)}
                                                    </div>

                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        {/* Event Header */}
                                                        <div className="flex justify-between items-start gap-4">
                                                            <h5 className="font-semibold text-slate-900 text-base flex-1">{event.title}</h5>

                                                            {/* Individual Pricing Display */}
                                                            {priceResult && showItemizedPrices && (
                                                                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                                                    <span className="text-xs font-bold text-slate-700">
                                                                        {priceResult.displayPrice}
                                                                    </span>
                                                                    {priceResult.breakdown && (
                                                                        <span className="text-[10px] text-slate-400">
                                                                            {priceResult.breakdown}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {isDetailed && (
                                                            <>
                                                                {/* Description (Filtered) */}
                                                                {event.description &&
                                                                    event.description.trim() !== "" &&
                                                                    !event.description.toLowerCase().includes("no description provided") && (
                                                                        <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50/50 p-2 rounded">
                                                                            {event.description}
                                                                        </p>
                                                                    )}

                                                                {/* --- DETAILED COMPONENT RENDERERS --- */}
                                                                {event.category === 'flight' && <FlightDetails event={event} />}
                                                                {event.category === 'hotel' && <HotelDetails event={event} />}
                                                                {event.category === 'activity' && <ActivityDetails event={event} />}
                                                                {event.category === 'transfer' && <TransferDetails event={event} />}
                                                                {event.category === 'meal' && <MealDetails event={event} />}
                                                                {event.category === 'ancillaries' && <AncillaryDetails event={event} />}

                                                                {/* Generic Notes/Additional Info */}
                                                                {event.additionalInfo && <div className="text-xs text-slate-500 bg-yellow-50 p-2 rounded border border-yellow-100 mt-2">{event.additionalInfo}</div>}
                                                                {event.hotelNotes && <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2">Note: {event.hotelNotes}</div>}
                                                                {event.flightNotes && <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2">Note: {event.flightNotes}</div>}

                                                                {/* Additional Info Sections (Generic) */}
                                                                {event.additionalInfoSections && event.additionalInfoSections.length > 0 && (
                                                                    <div className="space-y-1 mt-2">
                                                                        {event.additionalInfoSections.map((sec: any, idx: number) => (
                                                                            <div key={idx} className="text-xs bg-slate-50 p-2 rounded">
                                                                                <span className="font-semibold">{sec.heading}:</span> {sec.content}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Images */}
                                                {isDetailed && event.imageUrl && (
                                                    <div className="mt-4 rounded-md overflow-hidden h-40 w-full bg-slate-100 relative">
                                                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                {isDetailed && !event.imageUrl && event.images && event.images.length > 0 && (
                                                    <div className="mt-4 rounded-md overflow-hidden h-40 w-full bg-slate-100 relative">
                                                        <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* ------------------- TOTAL PRICING ------------------- */}
            {showPrices && (
                <section className="mt-16 bg-slate-900 text-white rounded-xl p-8 break-inside-avoid">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-1 text-center md:text-left">
                            <h3 className="text-xl font-serif font-medium">Trip Cost</h3>
                            <p className="text-slate-400 text-xs">Total package cost including taxes.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-light tracking-tight font-serif">
                                {displayTotal}
                            </div>
                            <p className="text-slate-400 text-xs mt-1">Total for {totalPax} Traveler{totalPax !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* ------------------- FOOTER ------------------- */}
            <footer className="mt-16 pt-8 border-t-2 border-slate-200 break-inside-avoid bg-slate-50/30">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                    <div className="text-left space-y-3 flex-1">
                        <p className="text-base font-serif font-bold text-slate-900">
                            {itinerary.branding?.companyName || "TRAV PLATFORMS"}
                        </p>
                        {/* Contact Info from Settings */}
                        <div className="text-xs text-slate-600 space-y-2">
                            {itinerary.branding?.address && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                                    <span className="max-w-xs">{itinerary.branding.address}</span>
                                </div>
                            )}
                            {itinerary.branding?.contactEmail && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                                    <a href={`mailto:${itinerary.branding.contactEmail}`} className="hover:text-slate-900 transition-colors underline-offset-2 hover:underline">
                                        {itinerary.branding.contactEmail}
                                    </a>
                                </div>
                            )}
                            {itinerary.branding?.contactPhone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                                    <a href={`tel:${itinerary.branding.contactPhone}`} className="hover:text-slate-900 transition-colors underline-offset-2 hover:underline">
                                        {itinerary.branding.contactPhone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Links - Logos Only */}
                    {(itinerary.branding?.socialLinks?.instagram ||
                        itinerary.branding?.socialLinks?.facebook ||
                        itinerary.branding?.socialLinks?.twitter ||
                        itinerary.branding?.socialLinks?.website) && (
                            <div className="flex gap-4 items-start">
                                {itinerary.branding?.socialLinks?.instagram && (
                                    <a href={itinerary.branding.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors" title="Instagram">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                )}
                                {itinerary.branding?.socialLinks?.facebook && (
                                    <a href={itinerary.branding.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors" title="Facebook">
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                )}
                                {itinerary.branding?.socialLinks?.twitter && (
                                    <a href={itinerary.branding.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors" title="Twitter">
                                        <Twitter className="h-5 w-5" />
                                    </a>
                                )}
                                {itinerary.branding?.socialLinks?.website && (
                                    <a href={itinerary.branding.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="Website">
                                        <Globe className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                        )}
                </div>
                <div className="text-center pt-6 pb-2 border-t border-slate-200 text-[10px] text-slate-400 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} {itinerary.branding?.companyName || "All Rights Reserved"}
                </div>
            </footer>
        </div>
    )
}
