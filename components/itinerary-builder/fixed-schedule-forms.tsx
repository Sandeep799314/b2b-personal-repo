"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FixedScheduleFormsProps {
  manualDepartureCity: string
  setManualDepartureCity: (value: string) => void
  manualDate: string
  setManualDate: (value: string) => void
  manualTitle: string
  setManualTitle: (value: string) => void
  manualPrice: string | number
  setManualPrice: (value: string) => void
  manualOriginalPrice: string | number
  setManualOriginalPrice: (value: string) => void
  manualOfferedPrice: string | number
  setManualOfferedPrice: (value: string) => void
  manualCurrency: string
  setManualCurrency: (value: string) => void
  manualTags: string
  setManualTags: (value: string) => void
  manualRemarks: string
  setManualRemarks: (value: string) => void
  errors?: Record<string, string>
}

export function FixedScheduleForms({
  manualDepartureCity,
  setManualDepartureCity,
  manualDate,
  setManualDate,
  manualTitle,
  setManualTitle,
  manualPrice,
  setManualPrice,
  manualOriginalPrice,
  setManualOriginalPrice,
  manualOfferedPrice,
  setManualOfferedPrice,
  manualCurrency,
  setManualCurrency,
  manualTags,
  setManualTags,
  manualRemarks,
  setManualRemarks,
  errors,
}: FixedScheduleFormsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="schedule-date">Date</Label>
          <Input
            id="schedule-date"
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="departure-city">Fixed Date Name / Cities</Label>
          <Input
            id="departure-city"
            placeholder="e.g. Delhi, Mumbai, Bangalore"
            value={manualDepartureCity}
            onChange={(e) => setManualDepartureCity(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="original-price">Original Price (Strikethrough)</Label>
          <div className="flex gap-2">
            <div className="w-[80px] h-10 flex items-center justify-center border rounded-md bg-neutral-50 text-xs font-bold text-neutral-500">
              {manualCurrency}
            </div>
            <Input
              id="original-price"
              type="number"
              placeholder="e.g. 50000"
              value={manualOriginalPrice}
              onChange={(e) => setManualOriginalPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fixed-price">Offered Price (Actual)</Label>
          <div className="flex gap-2">
            <Select value={manualCurrency} onValueChange={setManualCurrency}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="CCY" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="fixed-price"
              type="number"
              placeholder="0.00"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fixed-tags">Tags</Label>
          <Input
            id="fixed-tags"
            placeholder="e.g. Limited Seats, Early Bird Discount"
            value={manualTags}
            onChange={(e) => setManualTags(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="fixed-title">Fixed Date Title</Label>
        <Input
          id="fixed-title"
          placeholder="e.g. Festive Season Fixed Departure"
          value={manualTitle}
          onChange={(e) => setManualTitle(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="fixed-remarks">Remarks</Label>
        <Textarea
          id="fixed-remarks"
          placeholder="Enter remarks or details..."
          value={manualRemarks}
          onChange={(e) => setManualRemarks(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
}
