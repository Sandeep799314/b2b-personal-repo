import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Itinerary from '@/models/Itinerary'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await params
    
    console.log("[API] GET Itinerary - ID:", id)

    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 })
    }

    // Basic ObjectId validation if it's 24 chars hex
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id)
    if (!isValidObjectId) {
      console.warn("[API] GET Itinerary - ID is not a valid ObjectId:", id)
      // We still try findById as it might be a custom string ID in some cases
    }

    const itinerary = await Itinerary.findById(id)
    
    if (!itinerary) {
      console.error("[API] GET Itinerary - Not Found:", id)
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
    }
    
    return NextResponse.json(itinerary)
  } catch (error) {
    console.error("[API] GET Itinerary - Error:", error)
    return NextResponse.json({ error: 'Failed to fetch itinerary' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await params
    const data = await request.json()
    
    const itinerary = await Itinerary.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    )
    
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
    }
    
    return NextResponse.json(itinerary)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await params
    const itinerary = await Itinerary.findByIdAndDelete(id)
    
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Itinerary deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete itinerary' }, { status: 500 })
  }
}
