import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import LibraryCollection from "@/models/LibraryCollection"
import { verifyAuth } from "@/lib/server-auth"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Verify authentication
    const user = await verifyAuth(request);
    
    // Build query - Filter by userId or return collections with no userId (public/legacy)
    const query = user ? { 
      $or: [
        { userId: user.uid },
        { userId: { $exists: false } },
        { userId: null }
      ]
    } : {
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    }

    const collections = await LibraryCollection.find(query).sort({ createdAt: -1 })
    return NextResponse.json(collections)
  } catch (error) {
    console.error("Failed to fetch library collections:", error)
    return NextResponse.json({ error: "Failed to fetch library collections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    const data = await request.json()
    const name = typeof data?.name === "string" ? data.name.trim() : ""

    if (!name) {
      return NextResponse.json({ error: "Library name is required" }, { status: 400 })
    }

    const existing = await LibraryCollection.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, "i") },
      $or: [
        { userId: user.uid },
        { userId: { $exists: false } },
        { userId: null }
      ]
    })
    
    if (existing) {
      return NextResponse.json({ error: "A library with this name already exists" }, { status: 409 })
    }

    const collection = await LibraryCollection.create({
      userId: user.uid,
      name,
      description: typeof data?.description === "string" ? data.description.trim() : undefined,
    })

    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error("Failed to create library collection:", error)
    return NextResponse.json({ error: "Failed to create library collection" }, { status: 500 })
  }
}
