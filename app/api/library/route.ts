import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LibraryItem from '@/models/LibraryItem'
import LibraryCollection from '@/models/LibraryCollection'
import User from '@/models/User'
import { verifyAuth } from '@/lib/server-auth'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Verify authentication
    const user = await verifyAuth(request);
    
    // Build query - Filter by userId or return items with no userId (public/legacy)
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

    const items = await LibraryItem.find(query).populate('libraryCollection').sort({ createdAt: -1 })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching library items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
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

    // --- CREDIT SYSTEM START ---
    let userDoc = await User.findOne({ userId: user.uid });
    if (!userDoc) {
      userDoc = await User.create({
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        credits: 20
      });
    }

    const LIBRARY_ITEM_CREDIT_COST = 1;
    if (userDoc.credits < LIBRARY_ITEM_CREDIT_COST) {
      return NextResponse.json({ 
        error: "Insufficient Credits", 
        message: `Creating a library product costs ${LIBRARY_ITEM_CREDIT_COST} credit. You currently have ${userDoc.credits} credits.` 
      }, { status: 403 });
    }
    // --- CREDIT SYSTEM END ---

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
    
    // Inject user fields
    cleanData.userId = user.uid;
    cleanData.userEmail = user.email;

    const item = await LibraryItem.create(cleanData)
    
    // --- DEDUCT CREDITS ---
    userDoc.credits -= LIBRARY_ITEM_CREDIT_COST;
    await userDoc.save();
    // ----------------------

    const populatedItem = await item.populate('libraryCollection')
    return NextResponse.json(populatedItem, { status: 201 })
  } catch (error) {
    console.error('Error creating library item:', error)
    const message = error instanceof Error ? error.message : 'Failed to create item'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
