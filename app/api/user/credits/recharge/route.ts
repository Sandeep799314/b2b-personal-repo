import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAuth } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await verifyAuth(request);
    
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid recharge amount" }, { status: 400 });
    }

    // Find user or create if new
    let user = await User.findOne({ userId: authUser.uid });
    
    if (!user) {
      user = await User.create({
        userId: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        credits: 20 + amount
      });
    } else {
      user.credits += amount;
      await user.save();
    }

    return NextResponse.json({ 
      success: true, 
      newBalance: user.credits,
      message: `Successfully added ${amount} credits to your wallet.`
    });
  } catch (error) {
    console.error("Error recharging credits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
