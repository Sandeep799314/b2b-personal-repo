import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = !!(adminEmail && user.email === adminEmail);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
