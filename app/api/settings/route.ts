
import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Settings } from "@/models/Settings"

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase()
        // Find standard global settings doc
        let settings = await Settings.findOne({ type: "global" })

        // If not exists, return defaults (or empty object, frontend handles defaults)
        if (!settings) {
            settings = {
                type: "global",
                currency: { baseCurrency: "INR", rates: {}, isManual: false },
                branding: {}
            }
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Error fetching settings:", error)
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase()
        const data = await request.json()

        // Upsert global settings
        const settings = await Settings.findOneAndUpdate(
            { type: "global" },
            {
                $set: {
                    currency: data.currency,
                    branding: data.branding
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Error saving settings:", error)
        return NextResponse.json(
            { error: "Failed to save settings" },
            { status: 500 }
        )
    }
}
