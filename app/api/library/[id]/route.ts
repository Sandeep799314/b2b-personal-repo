import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LibraryItem from '@/models/LibraryItem'
import LibraryCollection from '@/models/LibraryCollection'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const deleted = await LibraryItem.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Item deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const data = await request.json()
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    )

    if (cleanData.libraryCollection) {
      const collectionExists = await LibraryCollection.exists({ _id: cleanData.libraryCollection })
      if (!collectionExists) {
        return NextResponse.json({ error: 'Selected library does not exist' }, { status: 404 })
      }
    }

    const item = await LibraryItem.findByIdAndUpdate(id, cleanData, { new: true }).populate('libraryCollection')
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}
