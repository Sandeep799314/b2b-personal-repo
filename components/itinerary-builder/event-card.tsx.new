"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IItineraryEvent } from "@/models/Itinerary"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { EditEventModal } from "./edit-event-modal"
import { HotelEvent } from "./hotel-event"
import { TransferEvent } from "./transfer-event"
import { ActivityEvent } from "./activity-event"
import { FlightEvent } from "./flight-event"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EventCardProps {
  event: IItineraryEvent
  isDragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onEdit?: (updatedEvent: IItineraryEvent) => void
  onDelete?: () => void
}

export function EventCard({
  event,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}: EventCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const renderEventContent = () => {
    switch (event.category) {
      case 'hotel':
        return <HotelEvent event={event} />
      case 'transfer':
        return <TransferEvent event={event} />
      case 'activity':
        return <ActivityEvent event={event} />
      case 'flight':
        return <FlightEvent event={event} />
      default:
        return null
    }
  }

  return (
    <div className="relative">
      <div 
        className={`${isDragging ? 'opacity-50' : ''}`}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {renderEventContent()}
      </div>

      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {onEdit && (
        <EditEventModal
          event={event}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={onEdit}
        />
      )}
    </div>
  )
}
