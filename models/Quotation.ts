import mongoose from "mongoose"
import { IItinerary } from "./Itinerary"

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
      days: any[]
      pricingOptions: any
      subtotal: number
      markup: number
      total: number
      currencySettings: any
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
