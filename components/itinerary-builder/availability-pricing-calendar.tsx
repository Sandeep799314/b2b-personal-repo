"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { IItineraryEvent } from "@/models/Itinerary"

interface AvailabilityCalendarProps {
  event: IItineraryEvent
}

interface DateData {
  price: number
  seats: number
  status: 'Available' | 'Sold out' | 'Limited'
}

export function AvailabilityCalendar({ event }: AvailabilityCalendarProps) {
  // Use event's initial month if any date exists, otherwise default to today
  const getInitialDate = () => {
    const dates = Object.keys((event as any).availabilityData || {})
    if (dates.length > 0) {
      const sorted = dates.sort()
      return new Date(sorted[0])
    }
    return new Date()
  }

  const [currentDate, setCurrentDate] = useState(getInitialDate())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Actual data from event
  const availabilityData: Record<string, DateData> = (event as any).availabilityData || {}
  const currencySymbol = event.currency === 'USD' ? '$' : event.currency === 'EUR' ? '€' : '₹'

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const renderDays = () => {
    const days = []
    const totalDays = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)

    // Find lowest price in current view to highlight
    let lowestPrice = Infinity
    let hasData = false
    Object.values(availabilityData).forEach(d => {
        hasData = true
        if (d.status !== 'Sold out' && d.price < lowestPrice) lowestPrice = d.price
    })

    if (!hasData) {
       // Mock data if no data exists to show the UI
       // Actually, maybe better to show empty state
    }

    // Empty slots for days of previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 lg:h-24 border border-gray-100 bg-gray-50/30" />)
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      const data = availabilityData[dateStr]
      const isSelected = selectedDate === dateStr
      const isLowest = data && data.price === lowestPrice && data.status !== 'Sold out'

      days.push(
        <div
          key={day}
          onClick={() => data && data.status !== 'Sold out' && setSelectedDate(dateStr)}
          className={cn(
            "h-16 lg:h-24 border border-gray-100 p-1 lg:p-2 transition-all cursor-pointer relative flex flex-col justify-between",
            !data && "bg-white hover:bg-gray-50",
            data?.status === 'Sold out' && "bg-gray-50 opacity-60 cursor-not-allowed",
            isSelected && "ring-2 ring-indigo-500 bg-indigo-50/50 z-10",
            data && data.status !== 'Sold out' && "hover:bg-indigo-50/30"
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-xs lg:text-sm font-bold",
              isSelected ? "text-indigo-600" : "text-gray-500"
            )}>{day}</span>
            {data?.status === 'Limited' && (
              <Badge variant="destructive" className="px-1 py-0 text-[8px] lg:text-[10px] h-4">
                {data.seats} left
              </Badge>
            )}
          </div>

          {data && (
            <div className="flex flex-col items-center gap-0.5 lg:gap-1">
              <span className={cn(
                "text-[10px] lg:text-sm font-black tracking-tight",
                isLowest ? "text-emerald-600" : "text-gray-900",
                data.status === 'Sold out' && "line-through text-gray-400"
              )}>
                {currencySymbol}{data.price.toLocaleString()}
              </span>
              
              <div className="flex items-center gap-1">
                {data.status === 'Available' && <CheckCircle2 className="h-2 w-2 lg:h-3 lg:w-3 text-emerald-500" />}
                {data.status === 'Limited' && <AlertCircle className="h-2 w-2 lg:h-3 lg:w-3 text-amber-500" />}
                {data.status === 'Sold out' && <XCircle className="h-2 w-2 lg:h-3 lg:w-3 text-gray-400" />}
                <span className={cn(
                  "text-[8px] lg:text-[10px] font-bold uppercase tracking-tighter",
                  data.status === 'Available' && "text-emerald-600",
                  data.status === 'Limited' && "text-amber-600",
                  data.status === 'Sold out' && "text-gray-400"
                )}>
                  {data.status === 'Limited' ? "Few left" : data.status}
                </span>
              </div>
            </div>
          )}

          {isLowest && (
             <div className="absolute top-0 right-0 p-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
             </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-sm overflow-hidden w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-indigo-600 px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <CalendarIcon className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-bold tracking-tight">{event.title || "Availability & Pricing"}</h3>
            <p className="text-[10px] lg:text-xs text-indigo-100 font-medium">Select your preferred travel date</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-white hover:bg-white/20">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-2 lg:px-4 text-sm lg:text-base font-bold min-w-[120px] text-center">
            {monthName} {year}
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-white hover:bg-white/20">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2 lg:p-4">
        {Object.keys(availabilityData).length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/30">
             <CalendarIcon className="h-10 w-10 text-indigo-200 mx-auto mb-3" />
             <h4 className="text-indigo-900 font-bold">No availability data</h4>
             <p className="text-xs text-indigo-400">Edit this component to add travel dates and pricing.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 border-t border-l border-gray-100 rounded-lg overflow-hidden">
              {renderDays()}
            </div>
          </>
        )}
      </div>

      {/* Footer / Legend */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase">Limited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase">Sold Out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] lg:text-xs font-bold text-emerald-600 uppercase">Lowest Price</span>
          </div>
        </div>

        {selectedDate && (
           <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Selected Date</div>
                <div className="text-sm font-black text-indigo-600">
                  {new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold h-9 px-4 rounded-lg">
                Book This Date
              </Button>
           </div>
        )}
      </div>
    </div>
  )
}
