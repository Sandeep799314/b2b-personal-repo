"use client"

import { Coffee, UtensilsCrossed, Wine } from "lucide-react"

interface MealIndicatorProps {
  meals: {
    breakfast?: boolean;
    lunch?: boolean;
    dinner?: boolean;
  }
  onChange?: (type: 'breakfast' | 'lunch' | 'dinner', value: boolean) => void;
}

export function MealIndicator({ meals, onChange }: MealIndicatorProps) {
  const handleMealToggle = (type: 'breakfast' | 'lunch' | 'dinner') => {
    if (onChange) {
      onChange(type, !meals[type]);
    }
  };

  return (
    <div className="bg-yellow-50 p-2 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Coffee className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-700">Breakfast</span>
          <span className={`text-sm ${meals.breakfast ? 'text-green-600' : 'text-gray-600'}`}>
            {meals.breakfast ? 'Included' : ''}
          </span>
        </div>
      </div>

      <span className="mx-2 text-gray-400">|</span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-700">Lunch</span>
          <span className="text-sm text-gray-600">
            Not Included
          </span>
        </div>
      </div>

      <span className="mx-2 text-gray-400">|</span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Wine className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-700">Dinner</span>
          <span className="text-sm text-gray-600">
            Not Included
          </span>
        </div>
      </div>
    </div>
  );
}
