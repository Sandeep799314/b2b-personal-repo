import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Quotation from "@/models/Quotation"
import User from "@/models/User"
import { verifyAuth } from "@/lib/server-auth"

// GET /api/quotations
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    // Connect to database
    await connectDB()

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "100")

    // Build query - FILTER BY USER
    let query: any = { userId: user.uid }
    if (status) {
      query.status = status
    }

    // Fetch quotations for this user only
    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json(quotations)
  } catch (error) {
    console.error("Error fetching quotations:", error)
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
  }
}

// POST /api/quotations
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    // Connect to database
    await connectDB()

    // --- CREDIT SYSTEM START ---
    let userDoc = await User.findOne({ userId: user.uid });
    if (!userDoc) {
      userDoc = await User.create({
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        credits: 20
      });
    } else if (userDoc.credits === undefined || userDoc.credits === null) {
      userDoc.credits = 20;
      await userDoc.save();
    }

    const QUOTATION_CREDIT_COST = 1;
    if (userDoc.credits < QUOTATION_CREDIT_COST) {
      return NextResponse.json({ 
        error: "Insufficient Credits", 
        message: `Creating a product/quotation costs ${QUOTATION_CREDIT_COST} credit. You currently have ${userDoc.credits} credits.` 
      }, { status: 403 });
    }
    // --- CREDIT SYSTEM END ---

    // Parse request body
    const quotationData = await request.json()

    // Inject user fields automatically
    const dataWithUser = {
      ...quotationData,
      userId: user.uid,
      userEmail: user.email,
      createdByUser: user.displayName || user.email,
    };

    // Create new quotation
    const quotation = new Quotation(dataWithUser)
    await quotation.save()

    // --- DEDUCT CREDITS ---
    userDoc.credits -= QUOTATION_CREDIT_COST;
    await userDoc.save();
    // ----------------------

    return NextResponse.json({
      message: "Quotation created successfully",
      quotationId: quotation._id
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating quotation:", error)
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 })
  }
}