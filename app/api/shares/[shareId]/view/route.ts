import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import PublicShare, { ShareView } from "@/models/PublicShare"

// POST /api/shares/[shareId]/view - Track view for analytics
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    await connectToDatabase()
    
    const { shareId } = await params
    const userAgent = request.headers.get("user-agent") || "Unknown"
    const referrer = request.headers.get("referer")
    
    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "127.0.0.1"
    
    // Verify share exists and is active
    const share = await PublicShare.findOne({ shareId, isActive: true })
    
    if (!share) {
      return NextResponse.json(
        { error: "Share not found or inactive" },
        { status: 404 }
      )
    }

    // Create view record
    const shareView = new ShareView({
      shareId,
      viewerIP: ip,
      userAgent,
      referrer,
      viewedAt: new Date()
    })
    
    await shareView.save()
    
    // Increment view count on share
    await PublicShare.findOneAndUpdate(
      { shareId },
      { $inc: { viewCount: 1 } }
    )

    return NextResponse.json({
      message: "View tracked successfully"
    })

  } catch (error) {
    console.error("Error tracking view:", error)
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    )
  }
}
