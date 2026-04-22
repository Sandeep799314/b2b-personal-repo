"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Library, ExternalLink, Trash2 } from "lucide-react"
import { useLibraryIntegration } from "@/hooks/use-library-integration"
import { format } from "date-fns"

interface LibraryIntegrationPanelProps {
  itinerary: any
  onRemoveLibraryItem?: (eventId: string) => void
  onViewLibraryItem?: (itemId: string) => void
}

export function LibraryIntegrationPanel({ 
  itinerary, 
  onRemoveLibraryItem, 
  onViewLibraryItem 
}: LibraryIntegrationPanelProps) {
  const { getUsedLibraryItems, getLibraryItemById } = useLibraryIntegration()
  
  const usedLibraryItems = getUsedLibraryItems(itinerary)
  
  if (usedLibraryItems.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <Library className="h-4 w-4 mr-2" />
            Library Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No library items used in this itinerary yet. 
            <br />
            Drag items from the library tab to get started!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Library className="h-4 w-4 mr-2" />
            Library Integration
          </div>
          <Badge variant="secondary" className="text-xs">
            {usedLibraryItems.length} item{usedLibraryItems.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {usedLibraryItems.map((item) => {
              const eventsUsingItem = itinerary.days?.flatMap((day: any) => 
                day.events?.filter((event: any) => event.libraryItemId === item._id) || []
              ) || []
              
              return (
                <div 
                  key={item._id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Used {eventsUsingItem.length} time{eventsUsingItem.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {(item.city || item.country) && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {[item.city, item.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Added {(() => {
                        const date = new Date(item.createdAt)
                        return date instanceof Date && !isNaN(date.getTime()) 
                          ? format(date, 'MMM dd, yyyy') 
                          : 'Unknown date'
                      })()}
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewLibraryItem?.(item._id)}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    {eventsUsingItem.length === 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveLibraryItem?.(eventsUsingItem[0].id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
