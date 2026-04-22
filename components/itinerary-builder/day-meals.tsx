"use client"

import { UtensilsCrossed, Coffee, Wine } from "lucide-react"
import { cn } from "@/lib/utils"

interface DayMealsProps {
  meals: string[] | { breakfast?: boolean; lunch?: boolean; dinner?: boolean }
  onChange?: (meal: 'breakfast' | 'lunch' | 'dinner', value: boolean) => void
  className?: string
}

export function DayMeals({ meals, onChange, className }: DayMealsProps) {
  // Convert old format to new format if needed
  const mealsArray = Array.isArray(meals)
    ? meals
    : Object.entries(meals || {}).filter(([_, value]) => value).map(([key]) => key);

  const getMealLabel = (mealId: string): string => {
    const labels: { [key: string]: string } = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      highTea: "High Tea",
      halfBoard: "Half Board",
      fullBoard: "Full Board",
      allInclusive: "All Inclusive",
      others: "Others"
    };
    return labels[mealId] || mealId;
  };

  const mealLabels = mealsArray.map(getMealLabel).filter(Boolean);

  if (mealLabels.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-[#FFF8E7] p-3 rounded-md", className)}>
      <div className="flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">Meals:</span>
        <span className="text-sm text-gray-800">
          {mealLabels.join(" | ")}
        </span>
      </div>
    </div>
  )
}
