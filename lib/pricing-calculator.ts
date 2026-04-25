/**
 * Pricing Calculator for Itinerary Components
 * Handles component-specific pricing logic based on number of adults/children
 */

import { IItineraryEvent } from "@/models/Itinerary"
import { convertCurrency, formatCurrencyWithSymbol } from "./currency-utils"

export interface PricingConfig {
    adults: number
    children: number
    targetCurrency: string
    exchangeRates?: Record<string, number>
    baseCurrency?: string
    rooms?: number
}

export interface PriceResult {
    calculatedPrice: number
    displayPrice: string
    originalPrice: number
    originalCurrency: string
    originalDisplayPrice: string
    breakdown?: string
}

/**
 * Get exchange rates from localStorage price settings
 */
export function getExchangeRates(): { rates: Record<string, number>; baseCurrency: string } {
    try {
        const priceSettings = localStorage.getItem("priceSettings")
        if (priceSettings) {
            const parsed = JSON.parse(priceSettings)
            return {
                rates: parsed.rates || {},
                baseCurrency: parsed.baseCurrency || "INR"
            }
        }
    } catch (error) {
        console.error("Failed to load exchange rates:", error)
    }

    // Default fallback - rates represent 1 INR = X OTHER_CURRENCY
    return {
        rates: { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044 },
        baseCurrency: "INR"
    }
}

/**
 * Calculate flight pricing: price per person × total passengers
 */
export function calculateFlightPrice(
    event: IItineraryEvent,
    config: PricingConfig
): PriceResult {
    const totalPax = config.adults + config.children
    const pricePerPerson = event.price || 0
    const eventCurrency = event.currency || "INR"

    // Calculate total for all passengers
    const totalInOriginalCurrency = pricePerPerson * totalPax

    // Convert to target currency if different
    const { rates, baseCurrency } = config.exchangeRates && config.baseCurrency
        ? { rates: config.exchangeRates, baseCurrency: config.baseCurrency }
        : getExchangeRates()

    const calculatedPrice = convertCurrency(
        totalInOriginalCurrency,
        eventCurrency,
        config.targetCurrency,
        rates,
        baseCurrency
    )

    return {
        calculatedPrice,
        displayPrice: formatCurrencyWithSymbol(calculatedPrice, config.targetCurrency),
        originalPrice: pricePerPerson,
        originalCurrency: eventCurrency,
        originalDisplayPrice: formatCurrencyWithSymbol(pricePerPerson, eventCurrency),
        breakdown: `${totalPax} passengers × ${formatCurrencyWithSymbol(pricePerPerson, eventCurrency)}`
    }
}

/**
 * Calculate hotel pricing: rooms needed × price per night (PER NIGHT, not total)
 */
export function calculateHotelPrice(
    event: IItineraryEvent,
    config: PricingConfig,
    isCheckoutDay?: boolean
): PriceResult | null {
    // Detect checkout day: either explicitly passed or hotelNightIndex > hotelTotalNights
    const isActuallyCheckout = isCheckoutDay || (
        event.hotelNightIndex !== undefined && 
        event.hotelTotalNights !== undefined && 
        event.hotelNightIndex > event.hotelTotalNights
    );

    // Don't show price on checkout day
    if (isActuallyCheckout) {
        return null
    }

    const totalPax = config.adults + config.children
    const pricePerNight = event.price || 0
    const eventCurrency = event.currency || "INR"

    // Calculate number of rooms needed
    // If global room count is provided in config, use it. Otherwise calculate from occupancy.
    let roomsNeeded = 1
    if (config.rooms && config.rooms > 0) {
        roomsNeeded = config.rooms
    } else {
        // Calculate occupancy per room from event data
        const adultsPerRoom = event.adults || 2
        const childrenPerRoom = event.children || 0
        const occupancyPerRoom = adultsPerRoom + childrenPerRoom
        // Calculate number of rooms needed (round up)
        roomsNeeded = Math.ceil(totalPax / occupancyPerRoom)
    }

    // Calculate price for ONE NIGHT only
    const totalInOriginalCurrency = roomsNeeded * pricePerNight

    // Convert to target currency if different
    const { rates, baseCurrency } = config.exchangeRates && config.baseCurrency
        ? { rates: config.exchangeRates, baseCurrency: config.baseCurrency }
        : getExchangeRates()

    const calculatedPrice = convertCurrency(
        totalInOriginalCurrency,
        eventCurrency,
        config.targetCurrency,
        rates,
        baseCurrency
    )

    return {
        calculatedPrice,
        displayPrice: formatCurrencyWithSymbol(calculatedPrice, config.targetCurrency),
        originalPrice: pricePerNight,
        originalCurrency: eventCurrency,
        originalDisplayPrice: formatCurrencyWithSymbol(pricePerNight, eventCurrency),
        breakdown: `${roomsNeeded} rooms × ${formatCurrencyWithSymbol(pricePerNight, eventCurrency)}`
    }
}

/**
 * Calculate meal pricing: price per person × total passengers
 */
export function calculateMealPrice(
    event: IItineraryEvent,
    config: PricingConfig
): PriceResult {
    const totalPax = config.adults + config.children
    const pricePerPerson = event.price || 0
    const eventCurrency = event.currency || "INR"

    // Calculate total for all passengers
    const totalInOriginalCurrency = pricePerPerson * totalPax

    // Convert to target currency if different
    const { rates, baseCurrency } = config.exchangeRates && config.baseCurrency
        ? { rates: config.exchangeRates, baseCurrency: config.baseCurrency }
        : getExchangeRates()

    const calculatedPrice = convertCurrency(
        totalInOriginalCurrency,
        eventCurrency,
        config.targetCurrency,
        rates,
        baseCurrency
    )

    return {
        calculatedPrice,
        displayPrice: formatCurrencyWithSymbol(calculatedPrice, config.targetCurrency),
        originalPrice: pricePerPerson,
        originalCurrency: eventCurrency,
        originalDisplayPrice: formatCurrencyWithSymbol(pricePerPerson, eventCurrency),
        breakdown: `${totalPax} persons × ${formatCurrencyWithSymbol(pricePerPerson, eventCurrency)}`
    }
}

/**
 * Calculate transfer pricing: shared (per person) or private (per vehicle)
 * Based on transfer category and type
 */
export function calculateTransferPrice(
    event: IItineraryEvent,
    config: PricingConfig,
    transferCategory?: string
): PriceResult {
    const totalPax = config.adults + config.children
    const priceInput = event.price || 0
    const eventCurrency = event.currency || "INR"

    // Determine if this is a shared or private transfer
    // Check event.vehicleType or event.title for indicators
    const isShared = event.vehicleType?.toLowerCase().includes("shared") ||
        event.title.toLowerCase().includes("shared") ||
        transferCategory === "train" || // Trains are always per person
        transferCategory === "bus"      // Buses are always per person

    // Car Hire categories are always private (per vehicle)
    const isCarHire = transferCategory?.includes("car-hire") ||
        transferCategory === "car-hire-hourly" ||
        transferCategory === "car-hire-outstation" ||
        transferCategory === "car-hire-roundtrip" ||
        transferCategory === "car-hire-selfdrive"

    let calculatedPriceInOriginalCurrency: number
    let breakdown: string

    if (isShared && !isCarHire) {
        // Shared: Price per person × total passengers
        calculatedPriceInOriginalCurrency = priceInput * totalPax
        breakdown = `${totalPax} persons × ${formatCurrencyWithSymbol(priceInput, eventCurrency)}`
    } else {
        // Private: Calculate vehicles needed based on capacity
        const vehicleCapacity = event.capacity || (event as any).vehicleCapacity || 4 // Default capacity
        const vehiclesNeeded = Math.ceil(totalPax / vehicleCapacity)
        calculatedPriceInOriginalCurrency = priceInput * vehiclesNeeded
        breakdown = `${vehiclesNeeded} vehicles × ${formatCurrencyWithSymbol(priceInput, eventCurrency)}`
    }

    // Convert to target currency if different
    const { rates, baseCurrency } = config.exchangeRates && config.baseCurrency
        ? { rates: config.exchangeRates, baseCurrency: config.baseCurrency }
        : getExchangeRates()

    const calculatedPrice = convertCurrency(
        calculatedPriceInOriginalCurrency,
        eventCurrency,
        config.targetCurrency,
        rates,
        baseCurrency
    )

    return {
        calculatedPrice,
        displayPrice: formatCurrencyWithSymbol(calculatedPrice, config.targetCurrency),
        originalPrice: priceInput,
        originalCurrency: eventCurrency,
        originalDisplayPrice: formatCurrencyWithSymbol(priceInput, eventCurrency),
        breakdown
    }
}

/**
 * Calculate ancillary pricing: price per person × total passengers
 * For activities and other per-person services
 */
export function calculateAncillaryPrice(
    event: IItineraryEvent,
    config: PricingConfig
): PriceResult {
    const totalPax = config.adults + config.children
    const pricePerPerson = event.price || 0
    const eventCurrency = event.currency || "INR"

    // Calculate total for all passengers
    const totalInOriginalCurrency = pricePerPerson * totalPax

    // Convert to target currency if different
    const { rates, baseCurrency } = config.exchangeRates && config.baseCurrency
        ? { rates: config.exchangeRates, baseCurrency: config.baseCurrency }
        : getExchangeRates()

    const calculatedPrice = convertCurrency(
        totalInOriginalCurrency,
        eventCurrency,
        config.targetCurrency,
        rates,
        baseCurrency
    )

    return {
        calculatedPrice,
        displayPrice: formatCurrencyWithSymbol(calculatedPrice, config.targetCurrency),
        originalPrice: pricePerPerson,
        originalCurrency: eventCurrency,
        originalDisplayPrice: formatCurrencyWithSymbol(pricePerPerson, eventCurrency),
        breakdown: `${totalPax} persons × ${formatCurrencyWithSymbol(pricePerPerson, eventCurrency)}`
    }
}

/**
 * Calculate others pricing: standard price (not affected by pax count)
 */
export function calculateOthersPrice(
    event: IItineraryEvent,
    config: PricingConfig
): PriceResult {
    let standardPrice = event.price || 0
    const eventCurrency = event.currency || "INR"

    // Handle Gift Cards: Price + Service Charge
    if (event.subCategory === "gift-cards") {
        standardPrice = (event.price || 0) + (event.serviceCharge || 0)
    }
    // Handle Travel Gears: Sum of all gear items
    else if (event.subCategory === "travel-gears" && event.travelGears && event.travelGears.length > 0) {
        // Calculate sum of all items
        const gearsTotal = event.travelGears.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
        // Only use this if it's greater than 0, otherwise fallback to event.price
        if (gearsTotal > 0) {
            standardPrice = gearsTotal
        }
    }

    // Convert to target currency if different
    const { rates, baseCurrency } = config.exchangeRates && config.baseCurrency
        ? { rates: config.exchangeRates, baseCurrency: config.baseCurrency }
        : getExchangeRates()

    const calculatedPrice = convertCurrency(
        standardPrice,
        eventCurrency,
        config.targetCurrency,
        rates,
        baseCurrency
    )

    return {
        calculatedPrice,
        displayPrice: formatCurrencyWithSymbol(calculatedPrice, config.targetCurrency),
        originalPrice: standardPrice,
        originalCurrency: eventCurrency,
        originalDisplayPrice: formatCurrencyWithSymbol(standardPrice, eventCurrency),
        breakdown: event.subCategory === "gift-cards" ? "Inclusive of service charge" : "Total price"
    }
}

/**
 * Main dispatcher function to calculate price based on component category
 */
export function calculateComponentPrice(
    event: IItineraryEvent,
    config: PricingConfig
): PriceResult | null {
    // If no price set, return null
    if (!event.price || event.price === 0) {
        return null
    }

    const category = event.category.toLowerCase()

    switch (category) {
        case "flight":
            return calculateFlightPrice(event, config)

        case "hotel":
            return calculateHotelPrice(event, config)

        case "meal":
            return calculateMealPrice(event, config)

        case "transfer":
            // Use the new transfer pricing logic
            return calculateTransferPrice(event, config, event.transferCategory)

        case "activity":
            // Activities are treated as ancillaries (per person)
            return calculateAncillaryPrice(event, config)

        case "visa":
        case "insurance":
        case "cruise":
            // These are also per person
            return calculateAncillaryPrice(event, config)

        case "ancillaries":
            // Check subcategory for specific pricing logic
            if (event.subCategory === "visa" || event.subCategory === "travel-insurance") {
                return calculateAncillaryPrice(event, config)
            } else if (event.subCategory === "forex") {
                return calculateOthersPrice(event, config)
            }
            // Default to others (fixed) if no known subcategory matches
            return calculateOthersPrice(event, config)

        case "other":
            // Others are standard pricing (not affected by pax count)
            return calculateOthersPrice(event, config)

        default:
            // For any other category, treat as standard pricing
            return calculateOthersPrice(event, config)
    }
}

/**
 * Calculate total price for all events in itinerary
 */
export function calculateTotalPrice(
    events: IItineraryEvent[],
    config: PricingConfig
): {
    total: number
    displayTotal: string
    breakdown: Array<{ title: string; price: number; displayPrice: string }>
} {
    let total = 0
    const breakdown: Array<{ title: string; price: number; displayPrice: string }> = []

    events.forEach(event => {
        // Special handling for multi-night hotels to avoid double counting
        // We now count 1 night per event if it's an indexed night (part of a spread)
        // This ensures both Day Totals and Itinerary Totals are correct
        if (event.category === 'hotel') {
            const result = calculateComponentPrice(event, config)
            if (result) {
                if (event.hotelNightIndex) {
                    // Spread multi-night hotel case: each event instance represents ONE night
                    total += result.calculatedPrice
                    breakdown.push({
                        title: event.title,
                        price: result.calculatedPrice,
                        displayPrice: result.displayPrice
                    })
                } else {
                    // Standalone hotel event: multiply by nights
                    const nights = event.nights || 1
                    const totalStayPrice = result.calculatedPrice * nights
                    total += totalStayPrice
                    breakdown.push({
                        title: event.title,
                        price: totalStayPrice,
                        displayPrice: formatCurrencyWithSymbol(totalStayPrice, config.targetCurrency)
                    })
                }
            }
            return
        }

        // Standard calculation for all other events
        const result = calculateComponentPrice(event, config)
        if (result) {
            total += result.calculatedPrice
            breakdown.push({
                title: event.title,
                price: result.calculatedPrice,
                displayPrice: result.displayPrice
            })
        }
    })

    return {
        total,
        displayTotal: formatCurrencyWithSymbol(total, config.targetCurrency),
        breakdown
    }
}
