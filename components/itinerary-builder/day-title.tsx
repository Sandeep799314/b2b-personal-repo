"use client"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface DayTitleProps {
  day: number
  title: string
  date?: string // Kept for backward compatibility or direct date string usage if needed
  nights?: number
  onTitleChange: (title: string) => void
  onNightsChange?: (nights: string) => void
}

export function DayTitle({ day, title, date, nights, onTitleChange, onNightsChange }: DayTitleProps) {
  return (
    <div className="flex items-center space-x-1.5">
      <Badge variant="secondary" className="bg-orange-100 text-orange-600 border-none py-0 px-1.5 text-xs whitespace-nowrap">
        DAY {day}
      </Badge>
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="text-sm font-medium border-none p-0 h-auto bg-transparent w-44 focus-visible:ring-0 placeholder:text-gray-400"
        placeholder="Destination"
      />
      {onNightsChange && (
        <div className="flex items-center space-x-0.5">
          <Input
            type="number"
            value={nights || ""}
            onChange={(e) => onNightsChange(e.target.value)}
            className="w-8 h-6 p-0.5 text-center text-xs"
            min={0}
          />
          <span className="text-xs text-gray-600">N</span>
        </div>
      )}
    </div>
  )
}
