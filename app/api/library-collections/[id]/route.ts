import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import LibraryCollection from "@/models/LibraryCollection"
import LibraryItem from "@/models/LibraryItem"
import { verifyAuth } from "@/lib/server-auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params
    const collection = await LibraryCollection.findById(id);

    if (!collection) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 })
    }

    // Check ownership
    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = adminEmail && user.email && 
      user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim();

    if (collection.userId !== user.uid && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to update this library" }, { status: 403 });
    }

    const data = await request.json()
    const name = typeof data?.name === "string" ? data.name.trim() : ""

    if (!name) {
      return NextResponse.json({ error: "Library name is required" }, { status: 400 })
    }

    const duplicate = await LibraryCollection.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name}$`, "i") },
      userId: user.uid
    })

    if (duplicate) {
      return NextResponse.json({ error: "A library with this name already exists" }, { status: 409 })
    }

    const updatedCollection = await LibraryCollection.findByIdAndUpdate(
      id,
      {
        name,
        description: typeof data?.description === "string" ? data.description.trim() : undefined,
      },
      { new: true },
    )

    return NextResponse.json(updatedCollection)
  } catch (error) {
    console.error("Failed to update library collection:", error)
    return NextResponse.json({ error: "Failed to update library collection" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params
    const collection = await LibraryCollection.findById(id);

    if (!collection) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 })
    }

    // Check ownership
    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = adminEmail && user.email && 
      user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim();

    if (collection.userId !== user.uid && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to delete this library" }, { status: 403 });
    }

    const itemsUsingLibrary = await LibraryItem.countDocuments({ libraryCollection: id })
    if (itemsUsingLibrary > 0) {
      return NextResponse.json(
        { error: "Cannot delete a library that still contains items" },
        { status: 409 },
      )
    }

    await LibraryCollection.findByIdAndDelete(id)
    return NextResponse.json({ message: "Library deleted" })
  } catch (error) {
    console.error("Failed to delete library collection:", error)
    return NextResponse.json({ error: "Failed to delete library collection" }, { status: 500 })
  }
}
