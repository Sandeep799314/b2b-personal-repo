"use client"

import { Badge } from "@/components/ui/badge"
import { IItineraryEvent } from "@/models/Itinerary"
import { AlertTriangle } from "lucide-react"

export function EventSourceBadge({ event }: { event: IItineraryEvent }) {
  if (!event.componentSource) return null

  const sourceConfig: Record<string, { label: string; className: string; isEdited?: boolean }> = {
    manual: { label: "Manual", className: "bg-blue-50 text-blue-700 border-blue-200" },
    "my-library": { label: "Library", className: "bg-green-50 text-green-700 border-green-200" },
    "global-library": { label: "Global Library", className: "bg-purple-50 text-purple-700 border-purple-200" },
    "my-library-edited": { label: "Library", className: "bg-green-50 text-green-700 border-green-200", isEdited: true },
    "global-library-edited": { label: "Global", className: "bg-purple-50 text-purple-700 border-purple-200", isEdited: true },
  }

  const config = sourceConfig[event.componentSource]
  if (!config) return null

  return (
    <div className="absolute top-2 right-10 flex items-center gap-1.5 z-10">
      {config.isEdited && (
        <div className="flex items-center gap-0.5 text-red-600">
          <AlertTriangle className="h-3 w-3 fill-red-100" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Edited</span>
        </div>
      )}
      <Badge variant="outline" className={`text-[10px] font-bold py-0 h-4 ${config.className}`}>
        {config.label}
      </Badge>
    </div>
  )
}
