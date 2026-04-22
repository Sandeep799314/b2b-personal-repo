import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LibraryItem from '@/models/LibraryItem'
import LibraryCollection from '@/models/LibraryCollection'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await dbConnect()

    const itemsNeedingFix = await LibraryItem.find({ libraryCollection: { $type: 'string' } })
    const fixes = []
    for (const item of itemsNeedingFix) {
      const ref = item.libraryCollection as any
      if (typeof ref === 'string' && mongoose.Types.ObjectId.isValid(ref)) {
        item.libraryCollection = new mongoose.Types.ObjectId(ref)
        fixes.push(item.save())
      } else if (typeof ref === 'string') {
        item.libraryCollection = null
        fixes.push(item.save())
      }
    }

    if (fixes.length) {
      await Promise.all(fixes)
    }

    const items = await LibraryItem.find({}).populate('libraryCollection').sort({ createdAt: -1 })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const data = await request.json()
    
    // Clean undefined values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
    )

    if (!cleanData.libraryCollection) {
      return NextResponse.json({ error: 'Library selection is required' }, { status: 400 })
    }

    const collectionId = typeof cleanData.libraryCollection === 'string'
      ? cleanData.libraryCollection
      : cleanData.libraryCollection?._id

    if (!collectionId || !mongoose.Types.ObjectId.isValid(collectionId)) {
      return NextResponse.json({ error: 'Invalid library id supplied' }, { status: 400 })
    }

    const collectionExists = await LibraryCollection.exists({ _id: collectionId })
    if (!collectionExists) {
      return NextResponse.json({ error: 'Selected library does not exist' }, { status: 404 })
    }

    cleanData.libraryCollection = collectionId // Allow the setter to cast it

    const item = await LibraryItem.create(cleanData)
    const populatedItem = await item.populate('libraryCollection')
    return NextResponse.json(populatedItem, { status: 201 })
  } catch (error) {
    console.error('Error creating library item:', error)
    const message = error instanceof Error ? error.message : 'Failed to create item'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
