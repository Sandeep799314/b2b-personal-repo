
import mongoose from "mongoose"

// Sub-schemas for cleaner structure
const CurrencySettingsSchema = new mongoose.Schema({
    baseCurrency: { type: String, default: "INR" },
    rates: { type: Map, of: Number, default: {} },
    isManual: { type: Boolean, default: false },
    lastUpdated: { type: Date }
})

const BrandingSettingsSchema = new mongoose.Schema({
    id: { type: String, required: true },
    logo: String,
    companyName: String,
    contactEmail: String,
    contactPhone: String,
    address: String,
    gst: String,
    isDefault: { type: Boolean, default: false },
    headerImage: String,
    footerImage: String,
    headerText: String,
    footerText: String,
    socialLinks: {
        instagram: String,
        whatsapp: String,
        facebook: String,
        twitter: String,
        youtube: String,
        website: String
    }
})

const SettingsSchema = new mongoose.Schema({
    // Store settings per user
    userId: { type: String, required: true, unique: true, index: true },

    currency: { type: CurrencySettingsSchema, default: () => ({}) },
    branding: { type: BrandingSettingsSchema },
    companies: { type: [BrandingSettingsSchema], default: [] }
}, {
    timestamps: true
})

// Prevent recompilation error
export const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema)
