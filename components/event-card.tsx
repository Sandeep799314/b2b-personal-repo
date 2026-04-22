"use client"

import type React from "react"

import { Clock, MapPin, DollarSign, Edit, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { IItineraryEvent } from "@/models/Itinerary"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EventSourceTags } from "./event-source-tags"
import { MealIndicators } from "./meal-indicators"
import { FlightEvent } from "./itinerary-builder/flight-event"
import { DayMeals } from "./itinerary-builder/day-meals"
import { HotelEvent } from "./itinerary-builder/hotel-event"
import { TransferEvent } from "./itinerary-builder/transfer-event"
import { ActivityEvent } from "./itinerary-builder/activity-event"
import { MealEvent } from "./itinerary-builder/meal-event"
import { ImageEvent } from "./itinerary-builder/image-event"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: IItineraryEvent
  isDetailedView?: boolean
  onDragStart?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onMealChange?: (meal: "breakfast" | "lunch" | "dinner", value: boolean) => void
  onUpdate?: (updatedEvent: IItineraryEvent) => void
  nightIndex?: number // Current night for multi-night hotels (1, 2, 3, etc.)
  totalNights?: number // Total nights for the hotel stay
  dayNumber?: number // Actual day number (1, 2, 3, etc.)
  // Pricing configuration
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingCurrency?: string
  pricingMode?: 'individual' | 'total-only'
}

export function EventCard({
  event,
  isDetailedView = false,
  onDragStart,
  onEdit,
  onDelete,
  onMealChange,
  onUpdate,
  nightIndex,
  totalNights,
  dayNumber,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingCurrency = "INR",
  pricingMode = 'individual',
}: EventCardProps) {
  const getEventColor = (category: string) => {
    if (!category) return "bg-gray-50 border-gray-200"

    switch (category.toLowerCase()) {
      case "hotel":
        return "bg-blue-50 border-blue-200"
      case "transfer":
        return "bg-purple-50 border-purple-200"
      case "activity":
        return "bg-green-50 border-green-200"
      case "flight":
        return "bg-orange-50 border-orange-200"
      case "meal":
        return "bg-yellow-50 border-yellow-200"
      case "heading":
        return "bg-gray-100 border-gray-300"
      case "paragraph":
        return "bg-gray-50 border-gray-200"
      case "list":
        return "bg-gray-200 border-gray-400"
      case "image":
        return "bg-pink-50 border-pink-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger edit if clicking on dropdown menu or other interactive elements
    if (
      e.target instanceof Element &&
      (e.target.closest('[role="menuitem"]') || e.target.closest("button") || e.target.closest("[data-no-edit]"))
    ) {
      return
    }
    onEdit?.()
  }

  const renderComponentSourceBadge = () => {
    if (!event.componentSource) return null

    const sourceConfig = {
      manual: { label: "Manual", className: "bg-blue-100 text-blue-700" },
      "my-library": { label: "My Library", className: "bg-green-100 text-green-700" },
      "global-library": { label: "Global Library", className: "bg-purple-100 text-purple-700" },
      "my-library-edited": { label: "My Library - Edited", className: "bg-yellow-100 text-yellow-700" },
      "global-library-edited": { label: "Global Library - Edited", className: "bg-orange-100 text-orange-700" },
    }

    const config = sourceConfig[event.componentSource]
    if (!config) return null

    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    )
  }

  if (event.category === "image") {
    return <ImageEvent event={event} isDetailedView={isDetailedView} onClick={handleCardClick} onUpdate={onUpdate} />
  }

  if (event.category === "meal") {
    return (
      <MealEvent
        event={event}
        isDetailedView={isDetailedView}
        onEdit={onEdit}
        onDelete={onDelete}
        pricingEnabled={pricingEnabled}
        pricingAdults={pricingAdults}
        pricingChildren={pricingChildren}
        pricingCurrency={pricingCurrency}
        pricingMode={pricingMode}
      />
    )
  }

  if (event.category === "note") {
    return (
      <div
        className="group relative py-3 px-4 hover:bg-gray-50 rounded-md transition-colors cursor-pointer border border-transparent hover:border-gray-200"
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        onClick={handleCardClick}
      >
        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{event.description || "Add a note..."}</p>

        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200" data-no-edit>
                  <MoreVertical className="h-3 w-3 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "border-2 cursor-pointer hover:shadow-md transition-shadow relative",
        getEventColor(event.category)
      )}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onClick={handleCardClick}
    >
      <CardContent className="p-4 relative">
        {event.category === "flight" ? (
          <FlightEvent
            event={event}
            isDetailedView={isDetailedView}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        ) : event.category === "hotel" ? (
          <HotelEvent
            event={event}
            isDetailedView={isDetailedView}
            nightIndex={nightIndex}
            totalNights={totalNights}
            dayNumber={dayNumber}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        ) : event.category === "transfer" ? (
          <TransferEvent
            event={event}
            isDetailedView={isDetailedView}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        ) : event.category === "activity" ? (
          <ActivityEvent
            event={event}
            isDetailedView={isDetailedView}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        ) : event.category === "heading" ? (
          <div className="py-2">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-gray-800">{event.title || "Heading"}</h2>
              {renderComponentSourceBadge()}
            </div>
            {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
          </div>
        ) : event.category === "paragraph" ? (
          <div className="py-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-500">Paragraph</span>
              {renderComponentSourceBadge()}
            </div>
            <p className="text-gray-700 leading-relaxed">{event.description || "Enter your text here..."}</p>
          </div>
        ) : event.category === "list" ? (
          <div className="py-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-800">{event.title || "List Title"}</h4>
                {renderComponentSourceBadge()}
              </div>
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-no-edit>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {event.listItems?.map((item, index) => (
                <li key={index} className="whitespace-pre-wrap">{item}</li>
              )) || <li>Add list items...</li>}
            </ul>
          </div>
        ) : isDetailedView ? (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {event.category}
                  </Badge>
                  {renderComponentSourceBadge()}
                  {event.time && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {event.time}
                    </div>
                  )}
                </div>
                {(onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-no-edit>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem onClick={onDelete} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <h3 className="font-semibold mb-1">{event.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
              {event.location && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.location}
                </div>
              )}
            </div>
            <div className="text-right">
              {event.price && event.price > 0 && pricingEnabled && pricingMode === 'individual' && (
                <div className="flex items-center text-brand-primary font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {event.price}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {event.category}
              </Badge>
              {renderComponentSourceBadge()}
              <span className="font-medium">{event.title}</span>
            </div>
            <div className="flex items-center gap-4">
              {event.time && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {event.time}
                </div>
              )}
              {event.price && event.price > 0 && pricingEnabled && pricingMode === 'individual' && (
                <div className="flex items-center text-brand-primary font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {event.price}
                </div>
              )}
            </div>
          </div>
        )}

        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-no-edit>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
