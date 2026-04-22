import { NextResponse } from 'next/server'
import { LibraryService } from '@/lib/database'

export async function GET() {
  try {
    const stats = await LibraryService.getStats()
    const total = Object.values(stats).reduce((sum: number, count: unknown) => sum + (typeof count === 'number' ? count : 0), 0)
    
    return NextResponse.json({
      total,
      activities: stats.Activity || 0,
      hotels: stats.Lodging || 0,
      flights: stats.Flight || 0,
      transportation: stats.Transportation || 0,
      cruises: stats.Cruise || 0,
      info: stats.Info || 0
    })
  } catch (error) {
    console.error('Error fetching library stats:', error)
    return NextResponse.json({ error: 'Failed to fetch library stats' }, { status: 500 })
  }
}
