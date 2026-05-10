import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Settings } from "@/models/Settings"
import { verifyAuth } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase()
        
        // Find settings for the specific user
        let settings = await Settings.findOne({ userId: user.uid })

        // If not exists, return defaults
        if (!settings) {
            settings = {
                userId: user.uid,
                currency: { baseCurrency: "INR", rates: {}, isManual: false },
                branding: {},
                companies: []
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
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase()
        const data = await request.json()

        // Upsert settings for this user
        const settings = await Settings.findOneAndUpdate(
            { userId: user.uid },
            {
                $set: {
                    userId: user.uid,
                    currency: data.currency,
                    branding: data.branding,
                    companies: data.companies
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
