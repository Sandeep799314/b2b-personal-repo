import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import PublicShare, { IPublicShare } from "@/models/PublicShare"
import Itinerary from "@/models/Itinerary"
import { v4 as uuidv4 } from "uuid"

interface CreateShareRequest {
  title: string
  description?: string
  shareType: "individual" | "collection"
  itineraryId?: string
  itineraryIds?: string[]
  expiresAt?: string
  expiryMessage?: string
  passwordProtected?: boolean
  password?: string
  settings: {
    allowComments: boolean
    showPricing: boolean
    showContactInfo: boolean
    customBranding?: {
      logo?: string
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
  // Pricing markup options
  pricingOptions?: {
    markupType: "percentage" | "fixed"
    markupValue: number
    showOriginalPrice: boolean
    showIndividualPricing: boolean
    pricingCurrency: string
  }
  globalEnquireLink?: string
  perItineraryPricing?: Array<{
    itineraryId: string
    markupType: "percentage" | "fixed"
    markupValue: number
    showOriginalPrice: boolean
    strikethroughMarkupType: "percentage" | "fixed"
    strikethroughMarkupValue: number
  }>
  perItinerarySettings?: Array<{
    itineraryId: string
    enquireLink?: string
  }>
}

// GET /api/shares - List user's shares
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const createdBy = searchParams.get("createdBy")
    const shareType = searchParams.get("shareType")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!createdBy) {
      return NextResponse.json(
        { error: "Missing createdBy parameter" },
        { status: 400 }
      )
    }

    const query: any = { createdBy }
    if (shareType) {
      query.shareType = shareType
    }

    const skip = (page - 1) * limit

    const [shares, total] = await Promise.all([
      PublicShare.find(query)
        .populate({
          path: 'itineraryId',
          select: 'title description type productId totalPrice currency'
        })
        .populate({
          path: 'itineraryIds',
          select: 'title description type productId totalPrice currency'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PublicShare.countDocuments(query)
    ])

    // Transform the data to match frontend expectations
    const transformedShares = shares.map(share => {
      const shareObj = share.toObject()
      return {
        ...shareObj,
        itinerary: share.shareType === "individual" ? share.itineraryId : undefined,
        itineraries: share.shareType === "collection" ? share.itineraryIds : undefined
      }
    })

    return NextResponse.json({
      shares: transformedShares,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching shares:", error)
    return NextResponse.json(
      { error: "Failed to fetch shares" },
      { status: 500 }
    )
  }
}

// POST /api/shares - Create new share
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body: CreateShareRequest = await request.json()

    // Validate request
    const { title, shareType, settings } = body

    if (!title || !shareType || !settings) {
      return NextResponse.json(
        { error: "Missing required fields: title, shareType, settings" },
        { status: 400 }
      )
    }

    if (shareType === "individual" && !body.itineraryId) {
      return NextResponse.json(
        { error: "itineraryId is required for individual shares" },
        { status: 400 }
      )
    }

    if (shareType === "collection" && (!body.itineraryIds || body.itineraryIds.length === 0)) {
      return NextResponse.json(
        { error: "itineraryIds is required for collection shares" },
        { status: 400 }
      )
    }

    // Verify itineraries exist
    let itineraryVerification
    if (shareType === "individual") {
      itineraryVerification = await Itinerary.findById(body.itineraryId)
      if (!itineraryVerification) {
        return NextResponse.json(
          { error: "Itinerary not found" },
          { status: 404 }
        )
      }
    } else {
      itineraryVerification = await Itinerary.find({
        _id: { $in: body.itineraryIds }
      })
      if (itineraryVerification.length !== body.itineraryIds!.length) {
        return NextResponse.json(
          { error: "One or more itineraries not found" },
          { status: 404 }
        )
      }
    }

    // Generate unique share ID
    const shareId = uuidv4()

    // Generate URL-friendly slug from title
    const baseSlug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()

    // Ensure slug uniqueness by checking existing slugs
    let slug = baseSlug
    let counter = 1
    while (await PublicShare.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Store password directly for now (in production, use proper hashing)
    let hashedPassword
    if (body.passwordProtected && body.password) {
      hashedPassword = body.password
    }

    // Create share
    const shareData: Partial<IPublicShare> = {
      shareId,
      slug,
      title: body.title,
      description: body.description,
      shareType: body.shareType,
      createdBy: "current-user", // TODO: Get from authentication
      isActive: true,
      passwordProtected: body.passwordProtected || false,
      password: hashedPassword,
      settings: body.settings,
      viewCount: 0,
      // Include pricing options with defaults
      pricingOptions: body.pricingOptions || {
        markupType: "percentage",
        markupValue: 0,
        showOriginalPrice: false,
        showIndividualPricing: true,
        pricingCurrency: "INR"
      },
      // Per-itinerary pricing for collection shares
      perItineraryPricing: body.perItineraryPricing || [],
      globalEnquireLink: body.globalEnquireLink,
      perItinerarySettings: body.perItinerarySettings || []
    }

    if (body.expiresAt) {
      shareData.expiresAt = new Date(body.expiresAt)
    }

    // Add expiry message if provided
    if (body.expiryMessage) {
      shareData.expiryMessage = body.expiryMessage
    }

    if (shareType === "individual") {
      shareData.itineraryId = body.itineraryId
    } else {
      shareData.itineraryIds = body.itineraryIds
    }

    console.log('[API POST] Social media BEFORE save:', JSON.stringify(shareData.settings?.customBranding, null, 2))

    const newShare = new PublicShare(shareData)
    await newShare.save()

    console.log('[API POST] Social media AFTER save:', JSON.stringify(newShare.settings?.customBranding, null, 2))

    // Populate the response
    await newShare.populate([
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
      ...newShare.toObject(),
      itinerary: newShare.shareType === "individual" ? newShare.itineraryId : undefined,
      itineraries: newShare.shareType === "collection" ? newShare.itineraryIds : undefined
    }

    return NextResponse.json({
      message: "Share created successfully",
      share: transformedShare,
      publicUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/weblinks/${slug}`
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating share:", error)
    return NextResponse.json(
      { error: "Failed to create share" },
      { status: 500 }
    )
  }
}
