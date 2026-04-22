import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import LibraryCollection from "@/models/LibraryCollection"
import LibraryItem from "@/models/LibraryItem"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const data = await request.json()
    const name = typeof data?.name === "string" ? data.name.trim() : ""

    if (!name) {
      return NextResponse.json({ error: "Library name is required" }, { status: 400 })
    }

    const duplicate = await LibraryCollection.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name}$`, "i") },
    })

    if (duplicate) {
      return NextResponse.json({ error: "A library with this name already exists" }, { status: 409 })
    }

    const collection = await LibraryCollection.findByIdAndUpdate(
      id,
      {
        name,
        description: typeof data?.description === "string" ? data.description.trim() : undefined,
      },
      { new: true },
    )

    if (!collection) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 })
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error("Failed to update library collection:", error)
    return NextResponse.json({ error: "Failed to update library collection" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const itemsUsingLibrary = await LibraryItem.countDocuments({ libraryCollection: id })
    if (itemsUsingLibrary > 0) {
      return NextResponse.json(
        { error: "Cannot delete a library that still contains items" },
        { status: 409 },
      )
    }

    const result = await LibraryCollection.findByIdAndDelete(id)
    if (!result) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Library deleted" })
  } catch (error) {
    console.error("Failed to delete library collection:", error)
    return NextResponse.json({ error: "Failed to delete library collection" }, { status: 500 })
  }
}
