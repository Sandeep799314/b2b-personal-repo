"use client"

import { Clock, MapPin, DollarSign, Sun, Moon, Coffee } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface HotelEventProps {
  title: string
  description: string
  checkIn: string
  checkOut: string
  location: string
  roomType: string
  meals: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
  price: number
  viewMode: "detailed" | "summarized"
}

export function HotelEvent({ title, description, checkIn, checkOut, location, roomType, meals, price, viewMode }: HotelEventProps) {
  return (
    <Card className="border-2 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        {viewMode === "detailed" ? (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="secondary">Hotel</Badge>
                <h3 className="font-semibold mt-2">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-brand-primary font-semibold">
                  <DollarSign className="h-4 w-4" />
                  {price}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Sun className="h-4 w-4 mr-2" />
                  <div>
                    <span className="text-xs text-gray-500">Check In</span>
                    <p className="text-sm font-medium">{checkIn}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{location}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Moon className="h-4 w-4 mr-2" />
                  <div>
                    <span className="text-xs text-gray-500">Check Out</span>
                    <p className="text-sm font-medium">{checkOut}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs">
                    {roomType}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Coffee className="h-4 w-4" />
                <span>Breakfast</span>
                <Badge variant={meals.breakfast ? "default" : "secondary"} className={cn("text-xs", meals.breakfast && "bg-green-100 text-green-800 hover:bg-green-100")}>
                  {meals.breakfast ? "Included" : "Not Included"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <span>Lunch</span>
                <Badge variant={meals.lunch ? "default" : "secondary"} className={cn("text-xs", meals.lunch && "bg-green-100 text-green-800 hover:bg-green-100")}>
                  {meals.lunch ? "Included" : "Not Included"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4" />
                <span>Dinner</span>
                <Badge variant={meals.dinner ? "default" : "secondary"} className={cn("text-xs", meals.dinner && "bg-green-100 text-green-800 hover:bg-green-100")}>
                  {meals.dinner ? "Included" : "Not Included"}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary">Hotel</Badge>
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">{checkIn} - {checkOut}</div>
              <div className="flex items-center text-brand-primary font-semibold">
                <DollarSign className="h-4 w-4" />
                {price}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
