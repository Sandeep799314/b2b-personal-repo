"use client"

import { IItineraryDay } from "@/models/Itinerary"
import { QuotationPricingOptions } from "@/models/Quotation"
import { EventCard } from "./event-card"
import { DayMeals } from "./day-meals"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Coffee, UtensilsCrossed, Wine, Plane, Clock, Sun, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface PrintableItineraryProps {
  title: string
  description: string
  days: number
  nights: number
  country: string
  highlights: string[]
  version: number
  itineraryData: {
    days: IItineraryDay[]
  }
  mode?: "itinerary" | "quotation"
  pricingOptions?: QuotationPricingOptions
}

export function PrintableItinerary({
  title,
  description,
  days,
  nights,
  country,
  highlights,
  version,

  itineraryData,
  mode = "itinerary",
  pricingOptions
}: PrintableItineraryProps) {
  return (
    <div className="container mx-auto p-6 bg-white">
      <div className="space-y-6">
        {/* Title Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{description}</p>
          {/* Location and Duration */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700 font-medium">{country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#E8F3FF] text-[#2D7CEA] border-[#2D7CEA] print:bg-[#E8F3FF] !important">
                  {days} Days • {nights} Nights
                </Badge>
              </div>
            </div>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {highlights.map((highlight, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-100">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Title and Description */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <h3 className="font-medium">Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {highlights.map((highlight) => (
                <Badge
                  key={highlight}
                  variant="outline"
                  className={highlights.includes(highlight)
                    ? 'bg-[#2D7CEA] text-white'
                    : 'bg-white text-gray-600'}
                >
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Days */}
        <div className="space-y-6">
          {itineraryData.days.map((day, dayIndex) => (
            <Card key={dayIndex} className="border-2 border-dashed border-gray-200">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#F8B02B] px-4 py-2 rounded-full">
                    <span className="font-semibold">DAY {dayIndex + 1}</span>
                  </div>
                  <span className="max-w-[200px]">{day.title}</span>
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-bold">{new Date(day.date).getDate()}</div>
                    <div className="text-xs font-medium">
                      {new Date(day.date).toLocaleString('en-us', { weekday: 'short' })}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {day.events.map((event, eventIndex) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      nightIndex={event.hotelNightIndex}
                      totalNights={event.hotelTotalNights}
                    />
                  ))}
                </div>
                {day.meals && (
                  <div className="mt-4">
                    <DayMeals meals={day.meals} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Summary (Quotation Mode) */}
        {mode === 'quotation' && pricingOptions && (
          <div className="space-y-6">
            <Card className="border-2 border-dashed border-gray-200">
              <CardHeader className="p-4 bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-xl">Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* We can show breakdown or just total */}
                  {pricingOptions.showIndividualPrices && (
                    <p className="text-sm text-gray-500 italic">Individual component prices are listed above.</p>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-2xl font-bold">Total Price</span>
                    <span className="text-3xl font-bold text-[#2D7CEA]">
                      {pricingOptions.currency} {pricingOptions.finalTotalPrice?.toLocaleString() || pricingOptions.originalTotalPrice?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    Make all checks payable to Your Company Name
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Version Footer */}
        <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
          <p>Itinerary Version {version}</p>
        </div>
      </div>
    </div>
  )
}
