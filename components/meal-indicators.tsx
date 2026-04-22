"use client"

import { Utensils } from "lucide-react"
import { cn } from "@/lib/utils"

interface MealIndicatorsProps {
  meals: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
  className?: string
}

export function MealIndicators({ meals, className }: MealIndicatorsProps) {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <div className="flex items-center">
        <div className={cn(
          "w-2 h-2 rounded-full mr-2",
          meals.breakfast ? "bg-green-500" : "bg-gray-300"
        )} />
        <span className="text-sm">Breakfast {meals.breakfast ? "Included" : "Not Included"}</span>
      </div>
      <div className="flex items-center">
        <div className={cn(
          "w-2 h-2 rounded-full mr-2",
          meals.lunch ? "bg-green-500" : "bg-gray-300"
        )} />
        <span className="text-sm">Lunch {meals.lunch ? "Included" : "Not Included"}</span>
      </div>
      <div className="flex items-center">
        <div className={cn(
          "w-2 h-2 rounded-full mr-2",
          meals.dinner ? "bg-green-500" : "bg-gray-300"
        )} />
        <span className="text-sm">Dinner {meals.dinner ? "Included" : "Not Included"}</span>
      </div>
    </div>
  )
}
