"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, GripVertical, PlaneLanding, Hotel, MapPin, Car, UtensilsCrossed, Info, Library } from "lucide-react"
import { useLibrary } from "@/hooks/use-library"
import { LibraryToItineraryConverter } from "@/lib/library-converter"
import { format } from "date-fns"

interface LibraryItem {
  _id: string
  title: string
  category: string
  subCategory?: string
  city?: string
  country?: string
  startDate?: string
  endDate?: string
  labels?: string
  notes?: string
  transferOptions?: string[]
  basePrice?: number
  currency: string
  availableFrom?: Date
  availableUntil?: Date
  variants?: string
  multimedia: string[]
  createdAt: Date
  updatedAt: Date
  extraFields?: Record<string, any>
}

interface LibrarySidebarProps {
  onDragStart: (item: LibraryItem, type: string) => void
}

export function LibrarySidebar({ onDragStart }: LibrarySidebarProps) {
  const { items, loading } = useLibrary()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const getIcon = (category: string) => {
    const lowerCategory = category.toLowerCase()
    switch (lowerCategory) {
      case 'flight':
        return <PlaneLanding className="h-4 w-4" />
      case 'hotel':
        return <Hotel className="h-4 w-4" />
      case 'activity':
        return <MapPin className="h-4 w-4" />
      case 'transfer':
        return <Car className="h-4 w-4" />
      case 'meal':
        return <UtensilsCrossed className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getColor = (category: string) => {
    const lowerCategory = category.toLowerCase()
    switch (lowerCategory) {
      case 'flight':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100'
      case 'hotel':
        return 'bg-green-50 border-green-200 hover:bg-green-100'
      case 'activity':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100'
      case 'transfer':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100'
      case 'meal':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }
  }

  const categories = ['all', 'flight', 'hotel', 'activity', 'transfer', 'meal', 'others']

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.city?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (item.country?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || 
                           item.category.toLowerCase() === selectedCategory ||
                           (selectedCategory === 'others' && !['flight', 'hotel', 'activity', 'transfer', 'meal'].includes(item.category.toLowerCase()))
    return matchesSearch && matchesCategory
  })

  const handleDragStart = (item: LibraryItem) => {
    const validation = LibraryToItineraryConverter.validateLibraryItemForItinerary(item)
    if (!validation.isValid) {
      console.warn('Library item has issues:', validation.issues)
      // You could show a toast notification here
    }
    onDragStart(item, 'library-item')
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="my-libraries" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="my-libraries" className="text-sm">
            <Library className="h-4 w-4 mr-2" />
            My Libraries
          </TabsTrigger>
          <TabsTrigger value="global-libraries" className="text-sm">
            <Library className="h-4 w-4 mr-2" />
            Global Libraries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-libraries" className="flex-1 flex flex-col mt-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search library items..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Library Items */}
          <div className="flex-1 overflow-auto space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">Loading library items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No library items found</p>
                {searchQuery && (
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              filteredItems.map((item) => {
                const validation = LibraryToItineraryConverter.validateLibraryItemForItinerary(item)
                const previewSummary = LibraryToItineraryConverter.getPreviewSummary(item)

                return (
                  <Card
                    key={item._id}
                    className={`${getColor(item.category)} cursor-move transition-colors ${!validation.isValid ? 'opacity-75 border-yellow-300' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        {getIcon(item.category)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm text-gray-900 truncate">{item.title}</h4>
                            <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {item.category}
                            </div>
                          </div>

                          {/* Preview Summary */}
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {previewSummary}
                          </p>

                          {/* Validation Issues */}
                          {!validation.isValid && (
                            <div className="flex items-center mt-1">
                              <Info className="h-3 w-3 text-yellow-500 mr-1" />
                              <span className="text-xs text-yellow-600">Needs attention</span>
                            </div>
                          )}

                          {/* Additional Info */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex space-x-1">
                              {item.labels && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {item.labels.split(',')[0].trim()}
                                  {item.labels.split(',').length > 1 && '...'}
                                </Badge>
                              )}
                              {item.subCategory && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  {item.subCategory}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              {(() => {
                                const date = new Date(item.createdAt)
                                return date instanceof Date && !isNaN(date.getTime())
                                  ? format(date, 'MMM dd, yyyy')
                                  : 'Unknown date'
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                      {item.multimedia && item.multimedia.length > 0 && (
                        <div className="mt-2">
                          <img
                            src={item.multimedia[0]}
                            alt={item.title}
                            className="w-full h-20 object-cover rounded border"
                          />
                          {item.multimedia.length > 1 && (
                            <p className="text-xs text-center text-gray-500 mt-1">
                              +{item.multimedia.length - 1} more
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="global-libraries" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8">
              <Library className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Global Libraries</h3>
              <p className="text-sm text-gray-400">
                Coming soon! Access to global library items from all agencies.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
