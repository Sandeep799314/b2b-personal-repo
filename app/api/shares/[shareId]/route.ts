import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import PublicShare, { ShareView } from "@/models/PublicShare"

// GET /api/shares/[shareId] - Get specific share
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    await connectToDatabase()

    const { shareId } = await params

    const share = await PublicShare.findOne({ shareId, isActive: true })
      .populate({
        path: 'itineraryId',
        select: 'title description type productId destination duration totalPrice currency days highlights images gallery branding fixedDates cartItems htmlBlocks'
      })
      .populate({
        path: 'itineraryIds',
        select: 'title description type productId destination duration totalPrice currency days highlights images gallery branding fixedDates cartItems htmlBlocks'
      })

    if (!share) {
      return NextResponse.json(
        { error: "Share not found or inactive" },
        { status: 404 }
      )
    }

    // Check if share has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: "Share has expired" },
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
    console.error("Error fetching share:", error)
    return NextResponse.json(
      { error: "Failed to fetch share" },
      { status: 500 }
    )
  }
}

// PUT /api/shares/[shareId] - Update share
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    await connectToDatabase()

    const { shareId } = await params
    const body = await request.json()

    const share = await PublicShare.findOne({ shareId })

    if (!share) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description

    // Enable Updating Share Type & Dependencies
    if (body.shareType !== undefined) updateData.shareType = body.shareType
    if (body.itineraryId !== undefined) updateData.itineraryId = body.itineraryId || null
    if (body.itineraryIds !== undefined) updateData.itineraryIds = body.itineraryIds

    console.log('[API PUT] Update data:', JSON.stringify(updateData, null, 2))
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }
    if (body.expiryMessage !== undefined) updateData.expiryMessage = body.expiryMessage
    if (body.passwordProtected !== undefined) updateData.passwordProtected = body.passwordProtected
    if (body.password !== undefined) updateData.password = body.password

    // Merge settings including social media fields
    if (body.settings) {
      updateData.settings = {
        ...share.settings,
        ...body.settings
      }

      // Deep merge customBranding to preserve all fields including social media
      if (body.settings.customBranding) {
        updateData.settings.customBranding = {
          ...(share.settings?.customBranding || {}),
          ...body.settings.customBranding
        }
      }
    }

    // Update pricing options
    if (body.pricingOptions) {
      updateData.pricingOptions = {
        ...share.pricingOptions,
        ...body.pricingOptions
      }
    }

    // Update per-itinerary pricing if provided
    if (body.perItineraryPricing !== undefined) {
      updateData.perItineraryPricing = body.perItineraryPricing
    }

    if (body.globalEnquireLink !== undefined) updateData.globalEnquireLink = body.globalEnquireLink
    if (body.perItinerarySettings !== undefined) updateData.perItinerarySettings = body.perItinerarySettings

    const updatedShare = await PublicShare.findOneAndUpdate(
      { shareId },
      { $set: updateData },
      { new: true, runValidators: false } // Disable validators to avoid slug required error
    ).populate([
      {
        path: 'itineraryId',
        select: 'title description type productId totalPrice currency'
      },
      {
        path: 'itineraryIds',
        select: 'title description type productId totalPrice currency'
      }
    ])

    // Transform the response to match frontend expectations
    const transformedShare = {
      ...updatedShare.toObject(),
      itinerary: updatedShare.shareType === "individual" ? updatedShare.itineraryId : undefined,
      itineraries: updatedShare.shareType === "collection" ? updatedShare.itineraryIds : undefined
    }

    return NextResponse.json({
      message: "Share updated successfully",
      share: transformedShare
    })

  } catch (error) {
    console.error("Error updating share:", error)
    return NextResponse.json(
      { error: "Failed to update share" },
      { status: 500 }
    )
  }
}

// DELETE /api/shares/[shareId] - Delete share
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    await connectToDatabase()

    const { shareId } = await params

    const share = await PublicShare.findOne({ shareId })

    if (!share) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      )
    }

    // TODO: Add authorization check - only creator can delete

    await PublicShare.findOneAndDelete({ shareId })

    // Optional: Also delete related share views
    // Use a separate try-catch to ensure main deletion succeeds even if this fails
    try {
      if (ShareView) {
        await ShareView.deleteMany({ shareId })
      }
    } catch (viewError) {
      console.error("Error deleting share views:", viewError)
      // Continue execution, don't fail the request
    }

    return NextResponse.json({
      message: "Share deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting share:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete share" },
      { status: 500 }
    )
  }
}
