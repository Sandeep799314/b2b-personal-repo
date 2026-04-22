import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import LibraryCollection from "@/models/LibraryCollection"

export async function GET() {
  try {
    await dbConnect()
    const collections = await LibraryCollection.find({}).sort({ createdAt: -1 })
    return NextResponse.json(collections)
  } catch (error) {
    console.error("Failed to fetch library collections:", error)
    return NextResponse.json({ error: "Failed to fetch library collections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const data = await request.json()
    const name = typeof data?.name === "string" ? data.name.trim() : ""

    if (!name) {
      return NextResponse.json({ error: "Library name is required" }, { status: 400 })
    }

    const existing = await LibraryCollection.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
    if (existing) {
      return NextResponse.json({ error: "A library with this name already exists" }, { status: 409 })
    }

    const collection = await LibraryCollection.create({
      name,
      description: typeof data?.description === "string" ? data.description.trim() : undefined,
    })

    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error("Failed to create library collection:", error)
    return NextResponse.json({ error: "Failed to create library collection" }, { status: 500 })
  }
}
