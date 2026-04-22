"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CruiseFormsProps {
  manualTitle: string
  setManualTitle: (v: string) => void
  manualDescription: string
  setManualDescription: (v: string) => void
  manualLocation: string
  setManualLocation: (v: string) => void
  manualTime: string
  setManualTime: (v: string) => void
  manualPrice: string | number
  setManualPrice: (v: any) => void
  manualCurrency: string
  setManualCurrency: (v: string) => void
  manualHighlights: string[]
  handleAddHighlight: () => void
  handleRemoveHighlight: (index: number) => void
  handleHighlightChange: (index: number, value: string) => void
  errors?: Record<string, string>
}

export function CruiseForms({
  manualTitle,
  setManualTitle,
  manualDescription,
  setManualDescription,
  manualLocation,
  setManualLocation,
  manualTime,
  setManualTime,
  manualPrice,
  setManualPrice,
  manualCurrency,
  setManualCurrency,
  manualHighlights,
  handleAddHighlight,
  handleRemoveHighlight,
  handleHighlightChange,
  errors = {},
}: CruiseFormsProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="cruiseTitle">Title</Label>
        <Input
          id="cruiseTitle"
          value={manualTitle}
          onChange={(e) => setManualTitle(e.target.value)}
          placeholder="e.g., Mediterranean Cruise"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="cruiseDescription">Description</Label>
        <Textarea
          id="cruiseDescription"
          value={manualDescription}
          onChange={(e) => setManualDescription(e.target.value)}
          placeholder="Describe the cruise..."
          rows={3}
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="cruiseLocation">Location / Port</Label>
        <Input
          id="cruiseLocation"
          value={manualLocation}
          onChange={(e) => setManualLocation(e.target.value)}
          placeholder="e.g., Port of Barcelona"
        />
      </div>

      {/* Time */}
      <div className="space-y-2">
        <Label htmlFor="cruiseTime">Time</Label>
        <Input
          id="cruiseTime"
          value={manualTime}
          onChange={(e) => setManualTime(e.target.value)}
          placeholder="e.g., 10:00 AM"
        />
      </div>

      {/* Price & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cruisePrice">Price</Label>
          <Input
            id="cruisePrice"
            type="number"
            value={manualPrice}
            onChange={(e) => setManualPrice(e.target.value ? Number(e.target.value) : "")}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cruiseCurrency">Currency</Label>
          <select
            id="cruiseCurrency"
            value={manualCurrency}
            onChange={(e) => setManualCurrency(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="AED">AED (د.إ)</option>
          </select>
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-2">
        <Label>Highlights</Label>
        {manualHighlights.map((highlight, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={highlight}
              onChange={(e) => handleHighlightChange(index, e.target.value)}
              placeholder={`Highlight ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemoveHighlight(index)}
              className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddHighlight}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Add Highlight
        </button>
      </div>
    </div>
  )
}
