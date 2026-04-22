"use client"

import { StickyNote, Edit, Trash2, MoreVertical } from "lucide-react"
import { IItineraryEvent } from "@/models/Itinerary"
import { Button } from "@/components/ui/button"
import { EventSourceBadge } from "./source-badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NoteEventProps {
    event: IItineraryEvent
    isDetailedView?: boolean
    onEdit?: () => void
    onDelete?: () => void
}

export function NoteEvent({
    event,
    isDetailedView = true,
    onEdit,
    onDelete
}: NoteEventProps) {
    return (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 relative group">
            <EventSourceBadge event={event} />

            {(onEdit || onDelete) && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-yellow-100">
                                <MoreVertical className="h-4 w-4 text-yellow-700" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onEdit && (
                                <DropdownMenuItem onClick={onEdit}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div className="min-w-0">
                <div className="text-sm text-yellow-800 whitespace-pre-wrap leading-relaxed">
                    {event.description || "No content"}
                </div>
            </div>
        </div>
    )
}
