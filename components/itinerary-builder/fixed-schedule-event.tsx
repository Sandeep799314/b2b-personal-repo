"use client"

import { Calendar, Info, Tag, DollarSign } from "lucide-react"
import { IItineraryEvent } from "@/models/Itinerary"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FixedScheduleEventProps {
  event: IItineraryEvent
}

export function FixedScheduleEvent({ event }: FixedScheduleEventProps) {
  // Use manualDate and manualDepartureCity if they exist, otherwise fallback to standard fields
  const date = (event as any).manualDate || event.time || ""
  const city = (event as any).manualDepartureCity || event.location || ""
  const price = event.price
  const currency = event.currency || "INR"
  const tags = event.subtitle
  const remarks = event.description
  
  // Format date if possible
  let dayNum = ""
  let weekday = ""
  let monthYear = ""

  if (date) {
    try {
      const d = new Date(date)
      if (!isNaN(d.getTime())) {
        dayNum = d.getDate().toString()
        weekday = d.toLocaleString('default', { weekday: 'short' }).toUpperCase()
        monthYear = d.toLocaleString('default', { month: 'short', year: '2-digit' }).toUpperCase()
      }
    } catch (e) {}
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center">
            {tags && (
              <div className="mb-2">
                <div className="bg-white text-brand-primary-600 text-[10px] font-bold px-3 py-1 rounded-sm border border-brand-primary-200 uppercase tracking-wider flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-inset ring-brand-primary-500/10">
                  <Tag className="h-3 w-3 text-brand-primary-500" />
                  <span>{tags}</span>
                </div>
              </div>
            )}
            <div className="bg-white p-2 rounded-xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center min-w-[110px] hover:border-indigo-300 transition-all cursor-pointer group relative overflow-hidden">
              {/* iOS Style Calendar Icon */}
              <div className="flex flex-col items-center justify-center bg-white border border-neutral-200 rounded-xl w-14 h-16 mb-2 overflow-hidden shadow-sm">
                {/* Red Header Section */}
                <div className="w-full bg-[#FF3B30] py-1 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white uppercase tracking-wider leading-none">
                    {monthYear || "MONTH"}
                  </span>
                </div>
                {/* Body Section */}
                <div className="flex-1 w-full flex flex-col items-center justify-center bg-white pb-1">
                  <span className="text-2xl font-semibold text-neutral-900 leading-none">
                    {dayNum || "--"}
                  </span>
                  <span className="text-[9px] font-medium text-neutral-500 uppercase mt-0.5">
                    {weekday || "DAY"}
                  </span>
                </div>
              </div>

              <div className="text-[10px] font-bold text-neutral-800 uppercase tracking-tight text-center truncate w-full px-1">
                {city ? city.split(/[,]+/).map(s => s.trim()).filter(Boolean).join(' | ') : "Fixed Date"}
              </div>
              <div className="mt-1 text-center flex items-baseline justify-center gap-1.5">
                {event.originalPrice ? (
                  <span className="text-[8px] font-bold text-red-500 line-through opacity-80 mb-0.5">
                    {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency} {event.originalPrice}
                  </span>
                ) : null}
                {price ? (
                  <span className="text-[11px] font-black text-emerald-600">
                    {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency} {price}
                  </span>
                ) : (
                  <div className="h-4" /> 
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        {remarks && (
          <TooltipContent side="top" className="max-w-[200px] bg-white text-brand-primary-600 p-2 text-xs rounded-lg shadow-xl border border-brand-primary-100">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-brand-primary-500 uppercase text-[9px]">Remarks</span>
              <p className="leading-relaxed font-medium">{remarks}</p>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
