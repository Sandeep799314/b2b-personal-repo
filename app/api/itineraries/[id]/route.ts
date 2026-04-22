import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Itinerary from '@/models/Itinerary'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await params
    const itinerary = await Itinerary.findById(id)
    
    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
    }
    
    return NextResponse.json(itinerary)
  } catch (error) {
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
