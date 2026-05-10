import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import { verifyAuth } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userDoc = await User.findOne({ userId: user.uid });

    return NextResponse.json({
      subdomain: userDoc?.subdomain || null,
    });
  } catch (error) {
    console.error("[API Subdomain GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subdomain } = await request.json();

    // Validate subdomain format if provided
    if (subdomain) {
      const subdomainRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
      if (!subdomainRegex.test(subdomain)) {
        return NextResponse.json({ 
          error: "Invalid subdomain format. Use only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen." 
        }, { status: 400 });
      }

      if (subdomain.length < 3) {
        return NextResponse.json({ error: "Subdomain must be at least 3 characters long." }, { status: 400 });
      }
    }

    await connectToDatabase();

    // Check if subdomain is already taken by another user
    if (subdomain) {
      const existingUser = await User.findOne({ 
        subdomain: subdomain.toLowerCase(), 
        userId: { $ne: user.uid } 
      });
      
      if (existingUser) {
        return NextResponse.json({ error: "This subdomain is already taken. Please choose another one." }, { status: 409 });
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId: user.uid },
      { $set: { subdomain: subdomain ? subdomain.toLowerCase() : null } },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "Subdomain updated successfully",
      subdomain: updatedUser.subdomain,
    });
  } catch (error) {
    console.error("[API Subdomain PUT Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
