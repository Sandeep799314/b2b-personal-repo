import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import PublicShare from "@/models/PublicShare"

// GET /api/shares/by-slug/[slug] - Get share by URL slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectToDatabase()

        const { slug } = await params

        // First try to find by slug directly
        let share = await PublicShare.findOne({ slug, isActive: true })
            .populate({
                path: 'itineraryId',
                select: 'title description type productId destination duration totalPrice currency days highlights images gallery branding fixedDates cartItems htmlBlocks'
            })
            .populate({
                path: 'itineraryIds',
                select: 'title description type productId destination duration totalPrice currency days highlights images gallery branding fixedDates cartItems htmlBlocks'
            })

        // If not found by slug, try to find legacy shares by matching title
        // This handles shares created before the slug field was added
        if (!share) {
            // Get all active shares and match by generated slug from title
            const allShares = await PublicShare.find({ isActive: true })
                .populate({
                    path: 'itineraryId',
                    select: 'title description type productId destination duration totalPrice currency days highlights images gallery branding fixedDates cartItems htmlBlocks'
                })
                .populate({
                    path: 'itineraryIds',
                    select: 'title description type productId destination duration totalPrice currency days highlights images gallery branding fixedDates cartItems htmlBlocks'
                })

            // Find share where generated slug from title matches the requested slug
            share = allShares.find((s: any) => {
                const generatedSlug = s.title
                    ?.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim()
                return generatedSlug === slug
            })
        }

        if (!share) {
            return NextResponse.json(
                { error: "Weblink not found or inactive" },
                { status: 404 }
            )
        }

        // Check if share has expired
        if (share.expiresAt && new Date() > share.expiresAt) {
            // Transform the data to show even when expired
            const transformedShare = {
                ...share.toObject(),
                itinerary: share.shareType === "individual" ? share.itineraryId : undefined,
                itineraries: share.shareType === "collection" ? share.itineraryIds : undefined
            }

            // Remove the original populated fields
            delete transformedShare.itineraryId
            delete transformedShare.itineraryIds

            return NextResponse.json(
                {
                    error: "Weblink has expired",
                    expiryMessage: share.expiryMessage || null,
                    expiresAt: share.expiresAt,
                    share: transformedShare // Include full share data for contact info display
                },
                { status: 410 }
            )
        }

        // Transform the data to match frontend expectations
        const transformedShare = {
            ...share.toObject(),
            itinerary: share.shareType === "individual" ? share.itineraryId : undefined,
            itineraries: share.shareType === "collection" ? share.itineraryIds : undefined
        }

        // Remove the original populated fields to avoid confusion
        delete transformedShare.itineraryId
        delete transformedShare.itineraryIds

        return NextResponse.json({ share: transformedShare })

    } catch (error) {
        console.error("Error fetching weblink by slug:", error)
        return NextResponse.json(
            { error: "Failed to fetch weblink" },
            { status: 500 }
        )
    }
}
