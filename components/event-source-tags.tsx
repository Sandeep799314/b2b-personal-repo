"use client"

import { Library, PencilLine, FileText } from "lucide-react"

interface EventSourceTagsProps {
  source: "library" | "manual"
  isEdited?: boolean
}

export function EventSourceTags({ source, isEdited }: EventSourceTagsProps) {
  return (
    <div className="absolute top-2 right-10 flex flex-col gap-1 z-10">
      {source === "library" && (
        <div className="flex items-center px-2 py-1 bg-blue-500 text-white text-xs font-medium shadow-md transform -skew-x-12 rounded-tr-md rounded-bl-md border-r-2 border-blue-600">
          <Library className="w-3 h-3 mr-1 transform skew-x-12" />
          <span className="transform skew-x-12">Library</span>
        </div>
      )}
      {source === "manual" && (
        <div className="flex items-center px-2 py-1 bg-gray-500 text-white text-xs font-medium shadow-md transform -skew-x-12 rounded-tr-md rounded-bl-md border-r-2 border-gray-600">
          <FileText className="w-3 h-3 mr-1 transform skew-x-12" />
          <span className="transform skew-x-12">Manual</span>
        </div>
      )}
      {isEdited && source === "library" && (
        <div className="flex items-center px-2 py-1 bg-yellow-500 text-white text-xs font-medium shadow-md transform -skew-x-12 rounded-tr-md rounded-bl-md border-r-2 border-yellow-600 mt-1">
          <PencilLine className="w-3 h-3 mr-1 transform skew-x-12" />
          <span className="transform skew-x-12">Edited</span>
        </div>
      )}
    </div>
  )
}
