"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react"

interface LibraryUsageStatsProps {
  totalLibraryItems: number
  usedLibraryItems: number
  itineraryEventCount: number
  libraryBasedEventCount: number
  recentlyUsedCount?: number
}

export function LibraryUsageStats({
  totalLibraryItems,
  usedLibraryItems,
  itineraryEventCount,
  libraryBasedEventCount,
  recentlyUsedCount = 0
}: LibraryUsageStatsProps) {
  const usagePercentage = totalLibraryItems > 0 ? (usedLibraryItems / totalLibraryItems) * 100 : 0
  const eventPercentage = itineraryEventCount > 0 ? (libraryBasedEventCount / itineraryEventCount) * 100 : 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Library Usage Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Library Item Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Library Items Used</span>
            <Badge variant="secondary" className="text-xs">
              {usedLibraryItems}/{totalLibraryItems}
            </Badge>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {usagePercentage.toFixed(1)}% of your library is being utilized
          </p>
        </div>

        {/* Event Integration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Library-Based Events</span>
            <Badge variant="secondary" className="text-xs">
              {libraryBasedEventCount}/{itineraryEventCount}
            </Badge>
          </div>
          <Progress value={eventPercentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {eventPercentage.toFixed(1)}% of itinerary events from library
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <div>
              <p className="text-xs font-medium">{usedLibraryItems}</p>
              <p className="text-xs text-gray-500">Used Items</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-blue-500" />
            <div>
              <p className="text-xs font-medium">{libraryBasedEventCount}</p>
              <p className="text-xs text-gray-500">Lib Events</p>
            </div>
          </div>
        </div>

        {recentlyUsedCount > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-gray-600">
                {recentlyUsedCount} items used recently
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
