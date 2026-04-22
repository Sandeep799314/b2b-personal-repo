
import mongoose from "mongoose"

// Sub-schemas for cleaner structure
const CurrencySettingsSchema = new mongoose.Schema({
    baseCurrency: { type: String, default: "INR" },
    rates: { type: Map, of: Number, default: {} },
    isManual: { type: Boolean, default: false },
    lastUpdated: { type: Date }
})

const BrandingSettingsSchema = new mongoose.Schema({
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
})

const SettingsSchema = new mongoose.Schema({
    // Use a fixed ID or userId for singleton 'global' settings 
    // For now, we assume one global settings document or per-user if auth was present.
    // Using a distinct field to find it easily.
    type: { type: String, default: "global", unique: true },

    currency: { type: CurrencySettingsSchema, default: () => ({}) },
    branding: { type: BrandingSettingsSchema, default: () => ({}) }
}, {
    timestamps: true
})

// Prevent recompilation error
export const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema)
