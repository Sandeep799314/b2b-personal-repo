import mongoose from "mongoose"
import { IItinerary, ItineraryEventSchema, ItineraryDaySchema } from "./Itinerary"

// Define QuotationPricingOptions interface
export interface QuotationPricingOptions {
  showIndividualPrices: boolean
  showSubtotals: boolean
  showTotal: boolean
  markupType: "percentage" | "fixed"
  markupValue: number
  originalTotalPrice: number
  finalTotalPrice: number
  currency?: string
}

export interface IQuotation extends Omit<IItinerary, "_id" | "status" | "userId" | "userEmail" | "createdByUser"> {
  _id?: string
  // User authentication fields
  userId: string // Firebase UID of the user who created this
  userEmail?: string // User's email for reference
  createdByUser?: string // User's display name
  itineraryId: string // Reference to the original itinerary
  pricingOptions: QuotationPricingOptions
  subtotal?: number // Base price before markup
  markup?: number // Calculated markup amount
  total?: number // Final total after markup
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  validUntil?: Date
  client: {
    name: string
    email?: string
    phone?: string
    referenceNo?: string
  }
  // Currency conversion settings
  currencySettings?: {
    baseCurrency: string // The currency in which prices are stored (e.g., USD)
    displayCurrency: string // The currency to display prices in (e.g., INR, EUR)
    exchangeRates: {
      [currency: string]: number // Exchange rates from base currency to other currencies
    }
  }
  // Version control
  versionHistory?: Array<{
    versionNumber: number
    createdAt: Date
    description: string
    isLocked: boolean
    lockedBy?: string
    lockedAt?: Date
    state?: {
      days?: any[]
      pricingOptions?: any
      subtotal?: number
      markup?: number
      total?: number
      currencySettings?: any
      title?: string
      description?: string
      countries?: string[]
      destination?: string
      duration?: string
      totalPrice?: number
      currency?: string
      type?: string
      cartItems?: any[]
      htmlContent?: string
      htmlBlocks?: any[]
      serviceSlots?: any[]
      branding?: any
      gallery?: any[]
      highlights?: string[]
      images?: string[]
      overviewEvents?: any[]
      notes?: string
      productId?: string
    }
    isDraft?: boolean
  }>
  // Current version information
  currentVersion?: number
  isLocked?: boolean
  isDraft?: boolean
  isQuotationOnly?: boolean // Flag to identify itineraries created specifically for quotations
  quotationLead?: any // Store lead data associated with quotation
  generatedDate: Date
  notes?: string
}

const QuotationSchema = new mongoose.Schema(
  {
    // User authentication fields
    userId: { type: String, required: true, index: true },
    userEmail: { type: String },
    createdByUser: { type: String },
    itineraryId: { type: String, required: true },
    productId: { type: String },
    title: { type: String },
    description: { type: String },
    destination: { type: String },
    countries: { type: [String] },
    duration: { type: String },
    totalPrice: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired"],
      default: "draft",
    },
    type: {
      type: String,
      enum: ["fixed-group-tour", "customized-package", "cart-combo", "html-editor"],
      default: "customized-package",
    },
    createdBy: { type: String },
    lastUpdatedBy: { type: String },
    days: [
      {
        day: { type: Number, required: true },
        date: { type: String, required: true },
        title: { type: String, required: true },
        description: String,
        detailedDescription: String,
        events: [
          {
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
                "heading",
                "paragraph",
                "list",
                "image",
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
          },
        ],
        nights: Number,
        meals: {
          breakfast: Boolean,
          lunch: Boolean,
          dinner: Boolean,
        },
      },
    ],
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
    // Overview events
    overviewEvents: [ItineraryEventSchema],
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
        originalPrice: Number,
        offerTag: String,
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

        // Extended Transfer Fields
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
        pnr: String,
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
        refundable: String,

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
        visaCountry: String,
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
    // Service Slots for Additional Information
    serviceSlots: [
      {
        id: { type: String },
        title: { type: String },
        events: [ItineraryEventSchema],
      },
    ],
    branding: {
      headerLogo: String,
      headerText: String,
      footerLogo: String,
      footerText: String,
      primaryColor: String,
      secondaryColor: String,
    },
    pricingOptions: {
      showIndividualPrices: { type: Boolean, default: true },
      showSubtotals: { type: Boolean, default: true },
      showTotal: { type: Boolean, default: true },
      markupType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
      markupValue: { type: Number, default: 0 },
      originalTotalPrice: { type: Number, default: 0 },
      finalTotalPrice: { type: Number, default: 0 },
    },
    subtotal: { type: Number },
    markup: { type: Number },
    total: { type: Number },
    // Currency conversion settings
    currencySettings: {
      baseCurrency: { type: String, default: "USD" },
      displayCurrency: { type: String, default: "USD" },
      exchangeRates: {
        type: Map,
        of: Number,
        default: {
          "USD": 1,
          "EUR": 0.92,
          "INR": 83.36
        }
      }
    },
    // Version control
    versionHistory: [{
      versionNumber: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now },
      description: { type: String },
      isLocked: { type: Boolean, default: false },
      lockedBy: { type: String },
      lockedAt: { type: Date },
      isDraft: { type: Boolean, default: true },
      state: {
        days: { type: [mongoose.Schema.Types.Mixed], default: [] },
        pricingOptions: { type: mongoose.Schema.Types.Mixed, default: {} },
        subtotal: { type: Number },
        markup: { type: Number },
        total: { type: Number },
        currencySettings: { type: mongoose.Schema.Types.Mixed, default: {} },
        title: { type: String },
        description: { type: String },
        countries: { type: [String] },
        destination: { type: String },
        duration: { type: String },
        totalPrice: { type: Number },
        currency: { type: String },
        type: { type: String },
        cartItems: { type: [mongoose.Schema.Types.Mixed] },
        htmlContent: { type: String },
        htmlBlocks: { type: [mongoose.Schema.Types.Mixed] },
        serviceSlots: { type: [mongoose.Schema.Types.Mixed] },
        branding: { type: mongoose.Schema.Types.Mixed },
        gallery: { type: [mongoose.Schema.Types.Mixed] },
        highlights: { type: [String] },
        images: { type: [String] },
        overviewEvents: { type: [mongoose.Schema.Types.Mixed] },
        notes: { type: String },
        productId: { type: String },
      },
    }],
    currentVersion: { type: Number, default: 1 },
    isLocked: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: true },
    validUntil: { type: Date },
    client: {
      name: { type: String, required: true },
      email: String,
      phone: String,
      referenceNo: String,
    },
    generatedDate: { type: Date, default: Date.now },
    notes: String,
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Quotation || mongoose.model<IQuotation>("Quotation", QuotationSchema)
