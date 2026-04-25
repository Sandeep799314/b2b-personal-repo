import mongoose from "mongoose"

export interface IItinerary {
  _id?: string
  // User authentication fields
  userId: string // Firebase UID of the user who created this
  userEmail?: string // User's email for reference
  createdByUser?: string // User's display name
  productId: string
  productReferenceCode?: string // Optional product reference code
  title: string
  description: string
  destination: string
  countries: string[]; // NEW: support single or multiple countries
  duration: string
  totalPrice: number
  currency: string
  markupType?: "percentage" | "amount"
  markupValue?: number
  status?: "published" | "archived" | "draft"
  type: "fixed-group-tour" | "customized-package" | "cart-combo" | "html-editor" // NEW: Itinerary types
  createdBy: string
  lastUpdatedBy?: string // NEW: Track who last updated
  createdAt: Date
  updatedAt: Date
  days: IItineraryDay[]
  highlights: string[]
  images: string[]
  gallery?: IGalleryItem[] // NEW: Gallery section for multimedia files
  branding?: {
    logo?: string
    companyName?: string
    contactEmail?: string
    contactPhone?: string
    address?: string
    socialLinks?: {
      instagram?: string
      whatsapp?: string
      facebook?: string
      twitter?: string
      youtube?: string
      website?: string
    }
  }
  // NEW: Fixed Group Tour specific fields
  fixedDates?: {
    startDate: string
    endDate: string
    availableDates: string[]
    maxParticipants?: number
    currentBookings?: number
  }
  // NEW: Cart/Combo specific fields
  cartItems?: ICartItem[]
  // NEW: HTML Editor content
  htmlContent?: string
  htmlBlocks?: IHtmlBlock[]
  // NEW: Quotation-specific fields
  isQuotationOnly?: boolean // Flag to identify itineraries created specifically for quotations
  quotationLead?: any // Store lead data associated with quotation
  // NEW: Overview events for customized packages
  overviewEvents?: IItineraryEvent[] // Overview notes that appear above Day 1
  // Service Slots for Additional Information
  serviceSlots?: Array<{
    id: string
    title: string
    events: IItineraryEvent[]
  }>

  // NEW: Guest Details
  guestDetails?: {
    name: string
    leadReferenceCode: string
    email: string
    mobile: string
  }
  // NEW: Agency Details
  agencyDetails?: {
    logo: string
    name: string
    address: string
    phone: string
    email: string
    gst: string
  }
  // NEW: Header/Footer Settings
  headerFooter?: {
    headerImage?: string
    footerImage?: string
    contactInfo?: string
    showOnAllPages?: boolean
  }
}

export interface IGalleryItem {
  id: string
  url: string
  type: "image" | "video"
  caption?: string
  altText?: string
  fileName: string
  uploadedAt: Date
}

// NEW: Cart/Combo item interface
export interface ICartItem {
  id: string
  productId: string
  name: string
  description: string
  category: "activity" | "hotel" | "flight" | "transfer" | "meal" | "other" | "image" | "ancillaries"
  price: number
  date: string // Required: Service date in YYYY-MM-DD format
  currency?: string // Optional: Currency for the price (default: USD)
  nights?: number // Not applicable for combo items except hotels
  quantity: number
  addedAt: Date

  // Flight specific
  fromCity?: string
  toCity?: string
  airline?: string
  flightNumber?: string
  startTime?: string
  endTime?: string
  flightClass?: string

  // Hotel specific
  hotelName?: string
  location?: string
  checkIn?: string
  checkOut?: string
  roomCategory?: string

  // Transfer specific
  fromLocation?: string
  toLocation?: string
  vehicleType?: string
  transferType?: "private" | "shared"

  // Activity specific
  duration?: string
  difficulty?: string

  // Meal specific
  mealType?: string

  // Ancillaries specific
  // Visa
  country?: string
  visaType?: string
  visaDuration?: string
  entryMethod?: string
  // Forex
  forexCurrency?: string
  amount?: number
  // Insurance
  destinations?: string[]
  startDate?: string
  endDate?: string
  noOfTravellers?: number
  insuranceType?: string
  sumInsured?: number
  insuranceNotes?: string
  // Subcategory for others/ancillaries
  subCategory?: string


  // Image specific
  imageUrl?: string
  imageCaption?: string

  // Extended fields for full parity
  stopsList?: string[]
  additionalVehicles?: { vehicleType: string; capacity: number; price: number }[]
  pickupTime?: string
  dropTime?: string
  noOfHours?: number
  noOfDays?: number
  fuelType?: string
  carModel?: string
  transmission?: string
  busNumber?: string
  trainNumber?: string
  transferClass?: string
  transferLink?: string
  pnr?: string

  // Hotel extended
  adults?: number
  children?: number
  mealPlan?: string
  propertyType?: string
  address?: string
  hotelLink?: string
  confirmationNumber?: string
  amenities?: string[]
  highlights?: string[]
  hotelRating?: number
  refundable?: string

  // Flight extended
  bookingId?: string
  seatNumber?: string
  inFlightMeals?: string
  checkinBags?: number
  checkinBagWeight?: string
  cabinBags?: number
  cabinBagWeight?: string
  numberOfStops?: number
  stopLocations?: string[]

  // Others extended
  serviceCharge?: number
  giftAmount?: number
  products?: { name: string; price: number; description: string; currency?: string }[]

  // Ancillaries extended
  visaCountry?: string
  entryMethod?: string
  departureDate?: string
  returnDate?: string
  baseCurrency?: string
  insuranceProvider?: string
  policyNumber?: string
  coverageDetails?: string
}

// NEW: HTML Block interface for HTML editor
export interface IHtmlBlock {
  id: string
  type: "heading" | "paragraph" | "list" | "image" | "divider" | "quote" | "table"
  content: string
  level?: number // For headings (h1, h2, h3, etc.)
  listType?: "ordered" | "unordered" // For lists
  items?: string[] // For list items
  imageUrl?: string
  imageCaption?: string
  order: number
  createdAt: Date
}

export interface IItineraryDay {
  day: number
  date: string
  title: string
  description?: string
  detailedDescription?: string
  events: IItineraryEvent[]
  nights?: number
  meals?: string[] | { breakfast: boolean; lunch: boolean; dinner: boolean } // Array of selected meals for the day or object state
}

export interface IItineraryEvent {
  id: string
  category:
  | "flight"
  | "hotel"
  | "activity"
  | "transfer"
  | "meal"
  | "photo"
  | "other"
  | "others" // Support both for legacy/compatibility
  | "heading"
  | "paragraph"
  | "list"
  | "image"
  | "note"
  | "ancillaries"
  | "cruise"
  title: string
  description: string
  time?: string
  location?: string
  price?: number
  currency?: string // NEW: Currency for the price
  componentSource?: "manual" | "my-library" | "global-library" | "my-library-edited" | "global-library-edited"
  libraryItemId?: string
  originalLibraryId?: string
  versionHistory?: Array<{
    timestamp: Date
    action: "created" | "edited" | "imported"
    source: string
  }>
  highlights?: string[]
  listItems?: string[]
  // Activity specific
  duration?: string
  difficulty?: "easy" | "moderate" | "hard" | string
  capacity?: number
  // Hotel specific
  checkIn?: string
  checkOut?: string
  amenities?: string[]
  hotelName?: string
  roomCategory?: string
  hotelRating?: number
  mealPlan?: string // BLD format (Breakfast, Lunch, Dinner)
  hotelNotes?: string
  adults?: number
  children?: number
  propertyType?: string
  address?: string
  hotelLink?: string
  confirmationNumber?: string
  // Flight specific
  fromCity?: string
  toCity?: string
  mainPoint?: string
  airlines?: string
  flightNumber?: string
  startTime?: string
  endTime?: string
  flightClass?: string
  flightNotes?: string
  baggage?: string // Legacy field - kept for backward compatibility
  stops?: string // Legacy field - kept for backward compatibility
  pnr?: string
  refundable?: string
  // Flight additional fields
  bookingId?: string
  seatNumber?: string
  inFlightMeals?: string

  // Flight luggage - granular fields
  checkinBags?: number
  checkinBagWeight?: string // e.g., "23kg"
  cabinBags?: number
  cabinBagWeight?: string // e.g., "7kg"
  // Flight stops - structured data
  numberOfStops?: number
  stopLocations?: string[] // Array of stop city names
  // Transfer specific
  fromLocation?: string
  toLocation?: string
  vehicleType?: string
  transferType?: "private" | "shared" // Type of transfer for pricing
  transferCategory?: string // Subcategory: airport-transfer, car-hire-hourly, train, bus, etc.
  airportName?: string // For airport transfers
  pickupDrop?: "pickup" | "drop" // For airport transfers: pickup from airport or drop to airport
  pickupTime?: string
  dropTime?: string
  noOfHours?: number
  noOfDays?: number
  fuelType?: string
  carModel?: string
  transmission?: string
  busNumber?: string
  trainNumber?: string
  transferClass?: string
  transferLink?: string
  stopsList?: string[]
  additionalVehicles?: {
    vehicleType: string
    capacity: number
    price: number
  }[]
  // Others specific
  subCategory?: string
  serviceCharge?: number
  travelGears?: {
    name: string
    price: number | ""
    description: string
    currency?: string
  }[]
  giftAmount?: number // Ensure this is present
  products?: { name: string; price: number; description: string; currency?: string }[] // Generic products list

  // Ancillaries specific
  // Visa
  country?: string
  visaType?: string
  visaDuration?: string
  entryMethod?: string
  visaCountry?: string // Added
  // Forex
  forexCurrency?: string
  baseCurrency?: string
  amount?: number
  exchangeRate?: string // Added
  // Travel Insurance
  destinations?: string[]
  startDate?: string
  endDate?: string
  noOfTravellers?: number
  insuranceType?: string
  sumInsured?: number
  insuranceNotes?: string
  insuranceProvider?: string // Added
  policyNumber?: string // Added
  coverageDetails?: string // Added
  // SIM Card
  simProvider?: string // Added
  dataLimit?: string // Added
  validity?: string // Added


  // Image specific
  imageUrl?: string
  imageCaption?: string
  imageAlt?: string
  // Meal specific
  meals?: string[] // Array of selected meals: "breakfast", "lunch", "dinner", "highTea", "halfBoard", "fullBoard", "allInclusive", "others"
  customMealDescription?: string // Custom description when "others" is selected
  // Additional properties
  nights?: number
  images?: string[]
  subtitle?: string
  additionalInfoSections?: {
    heading: string
    content: string
  }[]
  // Multi-night hotel tracking
  hotelGroupId?: string // Unique ID to group related hotel instances across days
  hotelNightIndex?: number // Which night this is (1, 2, 3, etc. for 3-night stays)
  hotelTotalNights?: number // Total nights for the stay
}

const ItineraryEventSchema = new mongoose.Schema({
  id: { type: String, required: true },
  time: { type: String },
  category: {
    type: String,
    enum: [
      "flight",
      "hotel",
      "activity",
      "transfer",
      "meal",
      "photo",
      "other",
      "others",
      "ancillaries",
      "cruise",
      "heading",
      "paragraph",
      "list",
      "list",
      "image",
      "note",
    ],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: String,
  mainPoint: String,
  highlights: [String],
  fromCity: String,
  toCity: String,
  airlines: String,
  flightNumber: String,
  startTime: String,
  endTime: String,
  flightClass: String,
  flightNotes: String,
  nights: Number,
  checkIn: String,
  checkOut: String,
  images: [String],
  price: { type: Number, default: 0 },
  currency: { type: String, default: "INR" }, // NEW: Default to INR
  libraryItemId: String,
  componentSource: {
    type: String,
    enum: ["manual", "my-library", "global-library", "my-library-edited", "global-library-edited"],
  },
  originalLibraryId: String,
  versionHistory: [
    {
      timestamp: Date,
      action: { type: String, enum: ["created", "edited", "imported"] },
      source: String,
    },
  ],
  imageUrl: String,
  imageCaption: String,
  imageAlt: String,
  listItems: [String],
  subtitle: String,
  // Transfer fields
  fromLocation: String,
  toLocation: String,
  vehicleType: String,
  transferType: { type: String, enum: ["private", "shared"] },
  transferCategory: String,
  airportName: String,
  pickupDrop: { type: String, enum: ["pickup", "drop"] },
  pickupTime: String,
  dropTime: String,
  noOfHours: Number,
  noOfDays: Number,
  fuelType: String,
  carModel: String,
  transmission: String,
  busNumber: String,
  trainNumber: String,
  transferClass: String,
  transferLink: String,
  stopsList: [String],
  additionalVehicles: [
    {
      vehicleType: String,
      capacity: Number,
      price: Number,
    },
  ],
  // Activity fields
  duration: String,
  difficulty: String,
  capacity: Number,
  // Hotel fields
  amenities: [String],
  hotelName: String,
  roomCategory: String,
  hotelRating: Number,
  mealPlan: String,
  hotelNotes: String,
  adults: Number,
  children: Number,
  propertyType: String,
  address: String,
  hotelLink: String,
  confirmationNumber: String,
  // Meal fields
  meals: [String],
  customMealDescription: String,
  // Flight fields
  baggage: String, // Legacy field
  stops: String, // Legacy field
  pnr: String,
  refundable: String,
  bookingId: String,
  seatNumber: String,
  inFlightMeals: String,
  // Flight luggage - granular fields
  checkinBags: Number,
  checkinBagWeight: String,
  cabinBags: Number,
  cabinBagWeight: String,
  // Flight stops - structured data
  numberOfStops: Number,
  stopLocations: [String],
  // Multi-night hotel tracking
  hotelGroupId: String, // Unique ID to group related hotel instances across days
  hotelNightIndex: Number, // Which night this is (1, 2, 3, etc.)
  hotelTotalNights: Number, // Total nights for the stay
  // Additional info sections
  additionalInfoSections: [
    {
      heading: String,
      content: String,
    },
  ],
  // Others specific
  subCategory: String,
  serviceCharge: Number,
  travelGears: [
    {
      name: String,
      price: mongoose.Schema.Types.Mixed,
      description: String,
      currency: String
    }
  ],
  // Ancillaries specific
  // Visa
  country: String,
  visaType: String,
  visaDuration: String,
  entryMethod: String,
  departureDate: String,
  returnDate: String,
  lengthOfStay: String,
  // Forex
  forexCurrency: String,
  baseCurrency: String,
  amount: Number,
  // Travel Insurance
  destinations: [String],
  startDate: String,
  endDate: String,
  noOfTravellers: Number,
  insuranceType: String,
  sumInsured: Number,
  insuranceNotes: String,
})

const ItineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  detailedDescription: String,
  events: [ItineraryEventSchema],
  nights: Number,
  meals: [String],
})

const ItinerarySchema = new mongoose.Schema(
  {
    // User authentication fields
    userId: { type: String, required: true, index: true },
    userEmail: { type: String },
    createdByUser: { type: String },
    productId: { type: String },
    productReferenceCode: { type: String },
    title: { type: String },
    description: { type: String },
    destination: { type: String },
    countries: { type: [String] }, // Removed required constraint
    duration: { type: String },
    totalPrice: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    markupType: { type: String, enum: ["percentage", "amount"], default: "amount" },
    markupValue: { type: Number, default: 0 },

    type: {
      type: String,
      enum: ["fixed-group-tour", "customized-package", "cart-combo", "html-editor"],
      default: "customized-package",
    },
    createdBy: { type: String },
    lastUpdatedBy: { type: String },
    days: [ItineraryDaySchema],
    highlights: [String],
    images: [String],
    gallery: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], required: true },
        caption: String,
        altText: String,
        fileName: { type: String, required: true },
        uploadedAt: { type: Date, required: true },
      },
    ],
    branding: {
      logo: String,
      companyName: String,
      contactEmail: String,
      contactPhone: String,
      address: String,
      socialLinks: {
        instagram: String,
        whatsapp: String,
        facebook: String,
        twitter: String,
        youtube: String,
        website: String
      }
    },
    // Fixed Group Tour fields
    fixedDates: {
      startDate: String,
      endDate: String,
      availableDates: [String],
      maxParticipants: Number,
      currentBookings: { type: Number, default: 0 },
    },
    // Cart/Combo fields
    cartItems: [
      {
        id: { type: String, required: true },
        productId: { type: String, required: true },
        name: { type: String, required: true },
        date: { type: String, required: true }, // Service date: YYYY-MM-DD
        currency: { type: String, default: "USD" },
        description: String,
        category: {
          type: String,
          enum: ["activity", "hotel", "flight", "transfer", "meal", "other", "image", "ancillaries"],
          required: true,
        },
        price: { type: Number, required: true },
        nights: Number,
        quantity: { type: Number, default: 1 },
        addedAt: { type: Date, default: Date.now },

        // Flight specific
        fromCity: String,
        toCity: String,
        airline: String,
        flightNumber: String,
        startTime: String,
        endTime: String,
        flightClass: String,

        // Hotel specific
        hotelName: String,
        location: String,
        checkIn: String,
        checkOut: String,
        roomCategory: String,

        // Transfer specific
        fromLocation: String,
        toLocation: String,
        vehicleType: String,
        transferType: { type: String, enum: ["private", "shared"] },

        // Activity specific
        duration: String,
        difficulty: String,

        // Meal specific
        mealType: String,

        // Ancillaries specific
        country: String,
        visaType: String,
        visaDuration: String,
        entryMethod: String,
        forexCurrency: String,
        amount: Number,
        destinations: [String],
        startDate: String,
        endDate: String,
        noOfTravellers: Number,
        insuranceType: String,
        sumInsured: Number,
        insuranceNotes: String,
        subCategory: String,

        // Image specific
        imageUrl: String,
        imageCaption: String,

        // Extended Transfer Fields (Matching IItineraryEvent)
        pickupTime: String,
        dropTime: String,
        noOfHours: Number,
        noOfDays: Number,
        fuelType: String,
        carModel: String,
        transmission: String,
        pickupDrop: { type: String, enum: ["pickup", "drop"] },
        busNumber: String,
        trainNumber: String,
        transferClass: String,
        transferLink: String,
        pnr: String, // Also used for Flight
        stepsList: [String], // Note: Schema usually uses stopsList
        stopsList: [String],
        additionalVehicles: [{
          vehicleType: String,
          capacity: Number,
          price: Number
        }],

        // Extended Hotel Fields
        adults: Number,
        children: Number,
        mealPlan: String,
        propertyType: String,
        address: String,
        hotelLink: String,
        confirmationNumber: String,
        amenities: [String],
        highlights: [String],
        hotelRating: Number,
        refundable: String, // Also used for Flight

        // Extended Flight Fields
        bookingId: String,
        seatNumber: String,
        inFlightMeals: String,
        checkinBags: Number,
        checkinBagWeight: String,
        cabinBags: Number,
        cabinBagWeight: String,
        numberOfStops: Number,
        stopLocations: [String],

        // Extended Others Fields
        serviceCharge: Number,
        giftAmount: Number,
        products: [{
          name: String,
          price: Number,
          description: String,
          currency: String
        }],

        // Extended Ancillaries Fields
        visaCountry: String, // mapped to country usually but specific field here just in case
        visaDuration: String,
        serviceCharge: Number, // Shared with Others
        entryMethod: String,
        departureDate: String,
        returnDate: String,
        baseCurrency: String,
        insuranceProvider: String,
        policyNumber: String,
        coverageDetails: String,
      },
    ],
    // HTML Editor fields
    htmlContent: String,
    htmlBlocks: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ["heading", "paragraph", "list", "image", "divider", "quote", "table"],
          required: true,
        },
        content: String,
        level: Number,
        listType: { type: String, enum: ["ordered", "unordered"] },
        items: [String],
        imageUrl: String,
        imageCaption: String,
        order: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Quotation-specific fields
    isQuotationOnly: { type: Boolean, default: false },
    quotationLead: mongoose.Schema.Types.Mixed,
    // Overview events
    overviewEvents: [ItineraryEventSchema],
    // Service Slots for Additional Information
    serviceSlots: [
      {
        id: { type: String },
        title: { type: String },
        events: [ItineraryEventSchema],
      },
    ],
    // Guest Details
    guestDetails: {
      name: String,
      leadReferenceCode: String,
      email: String,
      mobile: String,
    },
    // Agency Details
    agencyDetails: {
      logo: String,
      name: String,
      address: String,
      phone: String,
      email: String,
      gst: String,
    },
    // Header/Footer Settings
    headerFooter: {
      headerImage: String,
      footerImage: String,
      contactInfo: String,
      showOnAllPages: { type: Boolean, default: true }
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Itinerary || mongoose.model<IItinerary>("Itinerary", ItinerarySchema)
