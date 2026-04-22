"use client"

import { Badge } from "@/components/ui/badge"
import { IItineraryEvent } from "@/models/Itinerary"

export function EventSourceBadge({ event }: { event: IItineraryEvent }) {
  if (!event.componentSource) return null

  const sourceConfig = {
    manual: { label: "Manual", className: "bg-blue-100 text-blue-700" },
    "my-library": { label: "Library", className: "bg-green-100 text-green-700" },
    "global-library": { label: "Global Library", className: "bg-purple-100 text-purple-700" },
    "my-library-edited": { label: "Library + Edited", className: "bg-yellow-100 text-yellow-700" },
    "global-library-edited": { label: "Global + Edited", className: "bg-orange-100 text-orange-700" },
  }

  const config = sourceConfig[event.componentSource]
  if (!config) return null

  return (
    <Badge variant="outline" className={`absolute top-2 right-10 text-xs z-10 ${config.className}`}>
      {config.label}
    </Badge>
  )
}
