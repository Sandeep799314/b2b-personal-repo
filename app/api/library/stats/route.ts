import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import LibraryItem from '@/models/LibraryItem'
import { verifyAuth } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Aggregate stats for the current user's items (and potentially global ones if wanted)
    // Here we focus on the user's personal library items
    const stats = await LibraryItem.aggregate([
      { $match: { userId: user.uid } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const statsMap: Record<string, number> = {};
    stats.forEach(item => {
      if (item._id) {
        statsMap[item._id] = item.count;
      }
    });

    const total = stats.reduce((sum, item) => sum + item.count, 0);
    
    return NextResponse.json({
      total,
      activities: statsMap.activity || 0,
      hotels: statsMap.hotel || 0,
      flights: statsMap.flight || 0,
      transportation: statsMap.transfer || 0,
      cruises: statsMap.cruise || 0,
      ancillaries: statsMap.ancillaries || 0,
      meals: statsMap.meal || 0,
      others: statsMap.others || 0,
      notes: statsMap.note || 0
    })
  } catch (error) {
    console.error('Error fetching library stats:', error)
    return NextResponse.json({ error: 'Failed to fetch library stats' }, { status: 500 })
  }
}
