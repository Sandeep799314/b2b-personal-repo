import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import { isValidObjectId } from "mongoose"

// PUT /api/quotations/[id]/versions/[versionNumber]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionNumber: string }> }
) {
    try {
        // Connect to database
        await connectDB()

        // Await params before accessing properties
        const { id, versionNumber } = await params

        // Validate if the ID is a valid MongoDB ObjectId
        if (!isValidObjectId(id)) {
            return NextResponse.json({ error: "Invalid quotation ID format" }, { status: 400 })
        }

        const parsedVersionNumber = parseInt(versionNumber)
        if (isNaN(parsedVersionNumber)) {
            return NextResponse.json({ error: "Invalid version number" }, { status: 400 })
        }

        // Check if quotation exists
        const quotation = await Quotation.findById(id)
        if (!quotation) {
            return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
        }

        // Find the specified version in history
        const versionData = quotation.versionHistory?.find(
            (v: any) => v.versionNumber === parsedVersionNumber
        )

        if (!versionData) {
            return NextResponse.json({ error: "Version not found in history" }, { status: 404 })
        }

        // Restore the version's state to the quotation
        if (versionData.state) {
            quotation.days = versionData.state.days || quotation.days
            quotation.pricingOptions = versionData.state.pricingOptions || quotation.pricingOptions
            quotation.subtotal = versionData.state.subtotal || quotation.subtotal
            quotation.markup = versionData.state.markup || quotation.markup
            quotation.total = versionData.state.total || quotation.total
            if (versionData.state.currencySettings) {
                quotation.currencySettings = versionData.state.currencySettings
            }
        }

        // Set current version to the restored version
        quotation.currentVersion = parsedVersionNumber
        quotation.isDraft = true // Mark as draft after restoration
        quotation.isLocked = false // Unlock when restoring

        // Mark fields as modified
        quotation.markModified("days")
        quotation.markModified("pricingOptions")
        quotation.markModified("versionHistory")

        // Save changes
        await quotation.save()

        return NextResponse.json(quotation)
    } catch (error: any) {
        console.error("Error restoring quotation version:", error)
        return NextResponse.json(
            { error: "Failed to restore version", details: error.message || String(error) },
            { status: 500 }
        )
    }
}
