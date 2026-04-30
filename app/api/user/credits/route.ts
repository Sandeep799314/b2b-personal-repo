import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAuth } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await verifyAuth(request);
    
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user or create if new
    let user = await User.findOne({ userId: authUser.uid });
    
    if (!user) {
      user = await User.create({
        userId: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        credits: 20 // Default free credits
      });
    }

    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
