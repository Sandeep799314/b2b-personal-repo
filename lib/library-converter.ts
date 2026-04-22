import { IItineraryEvent } from "@/models/Itinerary"

export interface LibraryItem {
  _id: string
  title: string
  category: string
  subCategory?: string
  city?: string
  country?: string
  startDate?: string
  endDate?: string
  labels?: string
  notes?: string
  transferOptions?: string[]
  basePrice?: number
  currency: string
  availableFrom?: Date
  availableUntil?: Date
  variants?: string
  multimedia: string[]
  createdAt: Date
  updatedAt: Date
  extraFields?: Record<string, any>
}

export class LibraryToItineraryConverter {
  private static categoryMapping: { [key: string]: IItineraryEvent['category'] } = {
    'flight': 'flight',
    'hotel': 'hotel',
    'activity': 'activity',
    'transfer': 'transfer',
    'meal': 'meal',
    'restaurant': 'meal',
    'dining': 'meal',
    'transport': 'transfer',
    'transportation': 'transfer',
    'accommodation': 'hotel',
    'lodging': 'hotel',
    'sightseeing': 'activity',
    'tour': 'activity',
    'experience': 'activity'
  }

  private static mapExtraFieldsToEvent(libraryItem: LibraryItem): Partial<IItineraryEvent> {
    if (!libraryItem.extraFields) return {}
    const ef = libraryItem.extraFields
    const mappings: any = {}

    // 1. Direct String Mappings
    const stringKeys = [
      'flightNumber', 'airlines', 'flightClass', 'pnr', 'refundable', 'bookingId', 'seatNumber', 'inFlightMeals', 'checkinBagWeight', 'cabinBagWeight',
      'vehicleType', 'fuelType', 'carModel', 'transmission', 'busNumber', 'trainNumber', 'transferClass', 'transferLink', 'airportName',
      'hotelName', 'roomCategory', 'hotelNotes', 'propertyType', 'confirmationNumber', 'mealPlan', 'hotelGroupId',
      'visaType', 'visaDuration', 'entryMethod', 'forexCurrency', 'baseCurrency', 'insuranceType', 'insuranceNotes', 'policyNumber', 'insuranceProvider', 'coverageDetails',
      'simProvider', 'dataLimit', 'validity',
      'imageUrl', 'imageCaption', 'imageAlt', 'subCategory',
      'difficulty', 'duration', 'baggage', 'stops'
    ]

    stringKeys.forEach(key => {
      if (ef[key]) mappings[key] = String(ef[key])
    })

    // 2. Numeric Mappings
    const numberKeys = [
      'price', 'nights', 'adults', 'children', 'checkinBags', 'cabinBags', 'numberOfStops',
      'serviceCharge', 'giftAmount', 'amount', 'noOfTravellers', 'sumInsured', 'capacity',
      'noOfHours', 'noOfDays', 'hotelRating', 'hotelTotalNights', 'hotelNightIndex', 'maxParticipants', 'currentBookings'
    ]

    numberKeys.forEach(key => {
      if (ef[key] !== undefined && ef[key] !== "") mappings[key] = Number(ef[key])
    })

    // 3. Specific Field Aliases & Conversions
    if (ef.departure) mappings.fromCity = ef.departure
    if (ef.arrival) mappings.toCity = ef.arrival
    if (ef.checkin) mappings.checkIn = ef.checkin
    if (ef.checkout) mappings.checkOut = ef.checkout

    // Flight/Transfer times
    if (ef.startTime) mappings.startTime = ef.startTime
    if (ef.endTime) mappings.endTime = ef.endTime
    if (ef.pickupTime) mappings.pickupTime = ef.pickupTime
    if (ef.dropTime) mappings.dropTime = ef.dropTime

    // Transfer locations
    if (ef.fromLocation) mappings.fromLocation = ef.fromLocation
    if (ef.toLocation) mappings.toLocation = ef.toLocation

    // Arrays
    if (Array.isArray(ef.destinations)) mappings.destinations = ef.destinations
    if (Array.isArray(ef.stopLocations)) mappings.stopLocations = ef.stopLocations
    if (Array.isArray(ef.amenities)) mappings.amenities = ef.amenities
    if (Array.isArray(ef.stopsList)) mappings.stopsList = ef.stopsList
    if (Array.isArray(ef.products)) mappings.products = ef.products
    if (Array.isArray(ef.travelGears)) mappings.travelGears = ef.travelGears
    if (Array.isArray(ef.additionalVehicles)) mappings.additionalVehicles = ef.additionalVehicles

    return mappings
  }

  static convertToItineraryEvent(libraryItem: LibraryItem, customTime?: string): IItineraryEvent {
    const category = this.categoryMapping[libraryItem.category.toLowerCase()] || 'activity'
    const baseTime = customTime || this.getDefaultTimeForCategory(category)
    const mappedExtras = this.mapExtraFieldsToEvent(libraryItem)

    const baseEvent: IItineraryEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      componentSource: "my-library",
      libraryItemId: libraryItem._id,

      title: libraryItem.title,
      description: this.buildDescription(libraryItem),
      time: mappedExtras.time || baseTime,
      location: this.buildLocation(libraryItem),
      highlights: this.extractHighlights(libraryItem),
      images: libraryItem.multimedia || [],
      price: libraryItem.basePrice || 0,

      // Spread mapped extra fields to ensure data transfer
      ...mappedExtras
    }

    // Add category-specific fields
    switch (category) {
      case 'flight':
        return {
          ...baseEvent,
          ...this.buildFlightFields(libraryItem)
        }
      case 'hotel':
        return {
          ...baseEvent,
          ...this.buildHotelFields(libraryItem)
        }
      case 'activity':
        return {
          ...baseEvent,
          ...this.buildActivityFields(libraryItem)
        }
      case 'transfer':
        return {
          ...baseEvent,
          ...this.buildTransferFields(libraryItem)
        }
      case 'meal':
        return {
          ...baseEvent,
          ...this.buildMealFields(libraryItem)
        }
      default:
        return baseEvent
    }
  }

  private static getDefaultTimeForCategory(category: IItineraryEvent['category']): string {
    switch (category) {
      case 'flight':
        return '08:00'
      case 'hotel':
        return '14:00'
      case 'activity':
        return '10:00'
      case 'transfer':
        return '09:00'
      case 'meal':
        return '19:00'
      default:
        return '09:00'
    }
  }

  private static buildDescription(libraryItem: LibraryItem): string {
    // Priority: Notes -> Description field -> Empty
    if (libraryItem.notes && libraryItem.notes.trim()) {
      return libraryItem.notes
    }

    if (libraryItem.extraFields?.description && typeof libraryItem.extraFields.description === 'string' && libraryItem.extraFields.description.trim()) {
      return libraryItem.extraFields.description
    }

    return ""
  }

  private static buildLocation(libraryItem: LibraryItem): string {
    const locationParts = [libraryItem.city, libraryItem.country].filter(Boolean)
    return locationParts.join(', ')
  }

  private static extractHighlights(libraryItem: LibraryItem): string[] {
    const highlights: string[] = []

    // Add labels as highlights
    if (libraryItem.labels) {
      highlights.push(...libraryItem.labels.split(',').map(label => label.trim()))
    }

    // Add variants as highlights
    if (libraryItem.variants) {
      highlights.push(libraryItem.variants)
    }

    // Add transfer options as highlights
    if (libraryItem.transferOptions && libraryItem.transferOptions.length > 0) {
      highlights.push(...libraryItem.transferOptions)
    }

    return highlights.filter(Boolean)
  }

  private static buildFlightFields(libraryItem: LibraryItem) {
    return {
      fromCity: libraryItem.extraFields?.departure || 'Enter departure city',
      toCity: libraryItem.city || libraryItem.extraFields?.arrival || 'Enter destination city',
      mainPoint: libraryItem.notes || `Flight: ${libraryItem.title}`
    }
  }

  private static buildHotelFields(libraryItem: LibraryItem) {
    const checkInTime = libraryItem.extraFields?.checkin || '14:00'
    const checkOutTime = libraryItem.extraFields?.checkout || '12:00'
    const nights = libraryItem.extraFields?.nights ? parseInt(libraryItem.extraFields.nights) : 1

    return {
      checkIn: checkInTime,
      checkOut: checkOutTime,
      nights: nights,
      meals: [
        (libraryItem.extraFields?.breakfast === true || libraryItem.extraFields?.breakfast === 'true') ? 'breakfast' : '',
        (libraryItem.extraFields?.lunch === true || libraryItem.extraFields?.lunch === 'true') ? 'lunch' : '',
        (libraryItem.extraFields?.dinner === true || libraryItem.extraFields?.dinner === 'true') ? 'dinner' : ''
      ].filter(Boolean)
    }
  }

  private static buildActivityFields(libraryItem: LibraryItem) {
    return {
      // Activities can include meals too
      ...(libraryItem.extraFields?.includesMeals && {
        meals: [
          libraryItem.extraFields?.breakfast === true ? 'breakfast' : '',
          libraryItem.extraFields?.lunch === true ? 'lunch' : '',
          libraryItem.extraFields?.dinner === true ? 'dinner' : ''
        ].filter(Boolean)
      })
    }
  }

  private static buildTransferFields(libraryItem: LibraryItem) {
    return {
      fromCity: libraryItem.extraFields?.fromLocation || 'Pick-up location',
      toCity: libraryItem.extraFields?.toLocation || libraryItem.city || 'Drop-off location'
    }
  }

  private static buildMealFields(libraryItem: LibraryItem) {
    return {
      // Meal-specific fields could be added here
      mainPoint: `${libraryItem.title} dining experience`
    }
  }

  static getPreviewSummary(libraryItem: LibraryItem): string {
    const location = this.buildLocation(libraryItem)
    const price = libraryItem.basePrice ? `${libraryItem.currency} ${libraryItem.basePrice}` : 'Price on request'
    const parts = [libraryItem.title, location, price].filter(Boolean)
    return parts.join(' • ')
  }

  static validateLibraryItemForItinerary(libraryItem: LibraryItem): { isValid: boolean; issues: string[] } {
    const issues: string[] = []

    if (!libraryItem.title?.trim()) {
      issues.push('Title is required')
    }

    if (!libraryItem.category?.trim()) {
      issues.push('Category is required')
    }

    if (libraryItem.category?.toLowerCase() === 'flight' && !libraryItem.city) {
      issues.push('Destination city is required for flights')
    }

    if (libraryItem.category?.toLowerCase() === 'hotel' && !libraryItem.city) {
      issues.push('Location is required for hotels')
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }
}
