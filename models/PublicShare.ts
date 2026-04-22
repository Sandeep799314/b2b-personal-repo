import mongoose from "mongoose"

export interface IPublicShare {
  _id?: string
  shareId: string // UUID for internal reference
  slug: string // URL-friendly slug based on title (for /weblinks/[slug])
  title: string
  description?: string
  shareType: "individual" | "collection"
  // For individual sharing
  itineraryId?: string
  // For collection sharing
  itineraryIds?: string[]
  createdBy: string
  isActive: boolean
  expiresAt?: Date
  expiryMessage?: string // Custom message shown when link expires
  passwordProtected?: boolean
  password?: string
  viewCount: number
  createdAt: Date
  updatedAt: Date
  settings: {
    allowComments: boolean
    showPricing: boolean
    showContactInfo: boolean
    customBranding?: {
      logo?: string
      heroImage?: string
      primaryColor?: string
      secondaryColor?: string
      companyName?: string
      contactEmail?: string
      contactPhone?: string
      instagram?: string
      whatsapp?: string
      facebook?: string
      youtube?: string
      website?: string
      twitter?: string
    }
  }
  // Global pricing markup options (for individual shares or default for collections)
  pricingOptions?: {
    markupType: "percentage" | "fixed"
    markupValue: number
    showOriginalPrice: boolean  // Show strikethrough price (higher than selling price)
    strikethroughMarkupType?: "percentage" | "fixed"  // Markup type for strikethrough price
    strikethroughMarkupValue?: number  // Markup value applied on top of selling price
    showIndividualPricing: boolean  // Show per-event prices
    pricingCurrency: string  // Currency to display prices in (e.g., "INR", "USD")
  }
  // Per-itinerary pricing for collection shares (overrides global pricingOptions)
  perItineraryPricing?: Array<{
    itineraryId: string
    markupType: "percentage" | "fixed"
    markupValue: number
    showOriginalPrice: boolean
    strikethroughMarkupType?: "percentage" | "fixed"
    strikethroughMarkupValue?: number
  }>
  // Global enquire link
  globalEnquireLink?: string
  // Per-itinerary settings (e.g. enquire links)
  perItinerarySettings?: Array<{
    itineraryId: string
    enquireLink?: string
  }>
}

export interface IShareView {
  _id?: string
  shareId: string
  viewerIP: string
  viewerLocation?: string
  userAgent: string
  viewedAt: Date
  referrer?: string
}

const shareViewSchema = new mongoose.Schema({
  shareId: { type: String, required: true, index: true },
  viewerIP: { type: String, required: true },
  viewerLocation: { type: String },
  userAgent: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now },
  referrer: { type: String }
})

const publicShareSchema = new mongoose.Schema({
  shareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: { type: String, required: true },
  description: { type: String },
  shareType: {
    type: String,
    enum: ["individual", "collection"],
    required: true
  },
  itineraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Itinerary",
    required: function (this: IPublicShare) { return this.shareType === "individual" }
  },
  itineraryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Itinerary",
    required: function (this: IPublicShare) { return this.shareType === "collection" }
  }],
  createdBy: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  expiryMessage: { type: String }, // Custom message shown when link expires
  passwordProtected: { type: Boolean, default: false },
  password: { type: String },
  viewCount: { type: Number, default: 0 },
  settings: {
    allowComments: { type: Boolean, default: false },
    showPricing: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: true },
    customBranding: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        logo: '',
        heroImage: '',
        primaryColor: '',
        companyName: '',
        contactEmail: '',
        contactPhone: '',
        instagram: '',
        whatsapp: '',
        facebook: '',
        youtube: '',
        website: '',
        twitter: ''
      }
    }
  },
  // Global pricing markup options
  pricingOptions: {
    markupType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    markupValue: { type: Number, default: 0 },
    showOriginalPrice: { type: Boolean, default: false },
    strikethroughMarkupType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    strikethroughMarkupValue: { type: Number, default: 0 },
    showIndividualPricing: { type: Boolean, default: true },
    pricingCurrency: { type: String, default: "INR" }
  },
  // Per-itinerary pricing for collection shares
  perItineraryPricing: [{
    itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Itinerary" },
    markupType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    markupValue: { type: Number, default: 0 },
    showOriginalPrice: { type: Boolean, default: false },
    strikethroughMarkupType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    strikethroughMarkupValue: { type: Number, default: 0 }
  }],
  globalEnquireLink: { type: String },
  perItinerarySettings: [{
    itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: "Itinerary" },
    enquireLink: { type: String }
  }]
}, {
  timestamps: true
})

// Add indexes for better performance (shareId and slug already indexed via field definitions)
publicShareSchema.index({ createdBy: 1 })
publicShareSchema.index({ shareType: 1 })
publicShareSchema.index({ isActive: 1 })
publicShareSchema.index({ expiresAt: 1 })


shareViewSchema.index({ shareId: 1, viewedAt: -1 })

const PublicShare = mongoose.models.PublicShare || mongoose.model<IPublicShare>("PublicShare", publicShareSchema)
const ShareView = mongoose.models.ShareView || mongoose.model<IShareView>("ShareView", shareViewSchema)

export { PublicShare, ShareView }
export default PublicShare
