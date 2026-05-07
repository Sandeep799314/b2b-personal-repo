import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LibraryItem from '@/models/LibraryItem'
import LibraryCollection from '@/models/LibraryCollection'
import { verifyAuth } from '@/lib/server-auth'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params
    const item = await LibraryItem.findById(id);
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = adminEmail && user.email && 
      user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim();

    // Check ownership or admin status
    if (item.userId !== user.uid && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to delete this item" }, { status: 403 });
    }

    await LibraryItem.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Item deleted' })
  } catch (error) {
    console.error('Error deleting library item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params
    const item = await LibraryItem.findById(id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = adminEmail && user.email && 
      user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim();

    // Check ownership or admin status
    if (item.userId !== user.uid && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to update this item" }, { status: 403 });
    }

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

    // Handle isGlobal - only admin can change it or keep it true
    if (isAdmin) {
      if (data.isGlobal !== undefined) {
        cleanData.isGlobal = data.isGlobal === true;
      }
    } else {
      // Non-admins cannot make items global, and if they edit their own item, it stays non-global
      cleanData.isGlobal = false;
    }

    const updatedItem = await LibraryItem.findByIdAndUpdate(id, cleanData, { new: true }).populate('libraryCollection')
    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating library item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}
