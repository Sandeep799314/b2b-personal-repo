import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAuth } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      credits
    } = await request.json();

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET is missing!");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await connectDB();
      
      let user = await User.findOne({ userId: authUser.uid });
      
      if (!user) {
        user = await User.create({
          userId: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          credits: 20 + credits
        });
      } else {
        user.credits = (user.credits || 0) + credits;
        await user.save();
      }

      return NextResponse.json({ 
        success: true, 
        message: "Payment verified successfully",
        newBalance: user.credits
      });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
