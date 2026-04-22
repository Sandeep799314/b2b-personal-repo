import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import PublicShare, { ShareView } from "@/models/PublicShare"

// POST /api/shares/[shareId]/verify - Verify password for protected shares
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    await connectToDatabase()
    
    const { shareId } = await params
    const { password } = await request.json()
    
    const share = await PublicShare.findOne({ shareId, isActive: true })
    
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

    if (!share.passwordProtected) {
      return NextResponse.json(
        { error: "Share is not password protected" },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      )
    }

    // For now, use simple comparison (in production, use bcrypt)
    const isValidPassword = share.password === password

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: "Password verified successfully",
      verified: true
    })

  } catch (error) {
    console.error("Error verifying password:", error)
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    )
  }
}
