"use client"

import { Button } from "@/components/ui/button"
import { IItineraryEvent } from "@/models/Itinerary"
import { MoreHorizontal, Pencil, Trash, ChevronUp, ChevronDown } from "lucide-react"
import { HotelEvent } from "./hotel-event"
import { TransferEvent } from "./transfer-event"
import { ActivityEvent } from "./activity-event"
import { FlightEvent } from "./flight-event"
import { OthersEvent } from "./others-event"
import { AncillariesEvent } from "./ancillaries-event"
import { MealEvent } from "./meal-event"
import { CruiseEvent } from "./cruise-event"
import { NoteEvent } from "./note-event"
import { ImageEvent } from "./image-event"
import { FixedScheduleEvent } from "./fixed-schedule-event"
import { AvailabilityCalendar } from "./availability-pricing-calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: IItineraryEvent
  isDragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  nightIndex?: number // Current night for multi-night hotels (1, 2, 3, etc.)
  totalNights?: number // Total nights for the hotel stay
  dayNumber?: number // Actual day number (1, 2, 3, etc.)
  // Pricing props
  isDetailedView?: boolean
  pricingEnabled?: boolean
  pricingAdults?: number
  pricingChildren?: number
  pricingRooms?: number
  pricingCurrency?: string
  pricingMode?: 'individual' | 'total-only'
  readOnly?: boolean
}

export function EventCard({
  event,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  nightIndex,
  totalNights,
  dayNumber,
  isDetailedView = true,
  pricingEnabled = false,
  pricingAdults = 2,
  pricingChildren = 0,
  pricingRooms = 1,
  pricingCurrency = "INR",
  pricingMode = 'individual',
  readOnly = false,
}: EventCardProps) {

  const renderEventContent = () => {
    switch (event.category) {
      case 'hotel':
        return <HotelEvent event={event} nightIndex={nightIndex} totalNights={totalNights} dayNumber={dayNumber} pricingEnabled={pricingEnabled} pricingAdults={pricingAdults} pricingChildren={pricingChildren} pricingRooms={pricingRooms} pricingCurrency={pricingCurrency} pricingMode={pricingMode} />
      case 'transfer':
        return (
          <TransferEvent
            event={event}
            isDetailedView={isDetailedView}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        )
      case 'activity':
        return (
          <ActivityEvent
            event={event}
            isDetailedView={isDetailedView}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        )
      case 'flight':
        return (
          <FlightEvent
            event={event}
            isDetailedView={isDetailedView}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        )
      case 'ancillaries':
        return (
          <AncillariesEvent
            event={event}
            pricingEnabled={pricingEnabled}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        )
      case 'meal':
        return (
          <MealEvent
            event={event}
            isDetailedView={isDetailedView}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      case 'cruise':
        return (
          <CruiseEvent
            event={event}
            isDetailedView={isDetailedView}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      case 'note':
        return (
          <NoteEvent
            event={event}
            isDetailedView={isDetailedView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      case 'image':
        return (
          <ImageEvent
            event={event}
            isDetailedView={isDetailedView}
            onClick={onEdit}
          />
        )
      case 'heading':
        return (
          <div className="py-2 px-1">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{event.title || "Heading"}</h2>
            {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
          </div>
        )
      case 'fixed-schedule':
      case 'fixedSchedule':
        return (
          <FixedScheduleEvent
            event={event}
          />
        )
      case 'availability-calendar':
        return (
          <AvailabilityCalendar
            event={event}
          />
        )
      case 'others':
      case 'other':
        return (
          <OthersEvent
            event={event}
            pricingEnabled={pricingEnabled}
            pricingAdults={pricingAdults}
            pricingChildren={pricingChildren}
            pricingCurrency={pricingCurrency}
            pricingMode={pricingMode}
          />
        )
      case 'list':
      case 'additionalInformation':
        return (
          <div className="bg-white p-4 rounded-md border shadow-sm">
            <h4 className="font-semibold mb-2 text-indigo-900">{event.title}</h4>
            {event.listItems && event.listItems.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {event.listItems.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No additional information provided</p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative">
      <div
        className={cn(
          isDragging ? 'opacity-50' : '',
          (event.componentSource === 'manual' && 
           event.category !== 'fixed-schedule' && 
           event.category !== 'fixedSchedule' && 
           event.category !== 'availability-calendar') ? 'manual-event-pink' : ''
        )}
        draggable={!readOnly}
        onDragStart={!readOnly ? onDragStart : undefined}
        onDragEnd={!readOnly ? onDragEnd : undefined}
      >
        {/* DEBUG MARKER TO VERIFY FILE LOADING */}
        <div className="hidden" data-debug-id="event-card-loaded"></div>
        {renderEventContent()}
      </div>

      {!readOnly && (onEdit || onDelete || onMoveUp || onMoveDown) && (
        <div className={cn(
          "absolute top-1 right-1 flex items-center gap-1 z-10",
          (event.category === 'fixed-schedule' || event.category === 'fixedSchedule' || event.category === 'availability-calendar') 
            ? "opacity-0 group-hover:opacity-100 transition-opacity" 
            : ""
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "p-0 bg-white/90 hover:bg-white shadow-sm border",
                  (event.category === 'fixed-schedule' || event.category === 'fixedSchedule' || event.category === 'availability-calendar')
                    ? "h-6 w-6"
                    : "h-8 w-8"
                )}
              >
                <MoreHorizontal className={cn(
                  (event.category === 'fixed-schedule' || event.category === 'fixedSchedule' || event.category === 'availability-calendar')
                    ? "h-3 w-3"
                    : "h-4 w-4"
                )} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onMoveUp && event.category !== "fixed-schedule" && event.category !== "fixedSchedule" && (
                <DropdownMenuItem onClick={onMoveUp}>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Move Up
                </DropdownMenuItem>
              )}
              {onMoveDown && event.category !== "fixed-schedule" && event.category !== "fixedSchedule" && (
                <DropdownMenuItem onClick={onMoveDown}>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Move Down
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
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
