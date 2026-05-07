"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"

interface AvailabilityCalendarFormsProps {
  manualTitle: string
  setManualTitle: (val: string) => void
  manualPrice: number | ""
  setManualPrice: (val: number | "") => void
  manualCurrency: string
  setManualCurrency: (val: string) => void
  availabilityData: Record<string, any>
  setAvailabilityData: (data: Record<string, any>) => void
}

export function AvailabilityCalendarForms({
  manualTitle,
  setManualTitle,
  manualPrice,
  setManualPrice,
  manualCurrency,
  setManualCurrency,
  availabilityData,
  setAvailabilityData
}: AvailabilityCalendarFormsProps) {
  
  const handleAddDate = () => {
    const today = new Date().toISOString().split('T')[0]
    setAvailabilityData({
      ...availabilityData,
      [today]: { price: manualPrice || 0, seats: 10, status: 'Available' }
    })
  }

  const handleUpdateDate = (date: string, field: string, value: any) => {
    setAvailabilityData({
      ...availabilityData,
      [date]: { ...availabilityData[date], [field]: value }
    })
  }

  const handleRemoveDate = (date: string) => {
    const newData = { ...availabilityData }
    delete newData[date]
    setAvailabilityData(newData)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">General Information</h4>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="manualTitle">Calendar Title</Label>
            <Input
              id="manualTitle"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g., Summer 2026 Availability"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="manualPrice">Default Price</Label>
              <Input
                id="manualPrice"
                type="number"
                value={manualPrice}
                onChange={(e) => setManualPrice(Number(e.target.value) || "")}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manualCurrency">Currency</Label>
              <Select value={manualCurrency} onValueChange={setManualCurrency}>
                <SelectTrigger id="manualCurrency">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Date-wise Pricing & Availability</h4>
          <Button size="sm" onClick={handleAddDate} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Date
          </Button>
        </div>

        <div className="space-y-3">
          {Object.entries(availabilityData).length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
              <p className="text-sm text-gray-400">No dates added yet. Add dates to configure custom pricing.</p>
            </div>
          ) : (
            Object.entries(availabilityData).map(([date, data]) => (
              <div key={date} className="flex flex-col sm:flex-row items-end gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="grid gap-1.5 flex-1">
                  <Label className="text-[10px] uppercase font-bold text-gray-400">Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => {
                       const newDate = e.target.value
                       if (newDate === date) return
                       const newData = { ...availabilityData }
                       newData[newDate] = newData[date]
                       delete newData[date]
                       setAvailabilityData(newData)
                    }}
                    className="h-9"
                  />
                </div>
                <div className="grid gap-1.5 w-24">
                  <Label className="text-[10px] uppercase font-bold text-gray-400">Price</Label>
                  <Input
                    type="number"
                    value={data.price}
                    onChange={(e) => handleUpdateDate(date, 'price', Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="grid gap-1.5 w-20">
                  <Label className="text-[10px] uppercase font-bold text-gray-400">Seats</Label>
                  <Input
                    type="number"
                    value={data.seats}
                    onChange={(e) => handleUpdateDate(date, 'seats', Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="grid gap-1.5 w-32">
                  <Label className="text-[10px] uppercase font-bold text-gray-400">Status</Label>
                  <Select value={data.status} onValueChange={(val) => handleUpdateDate(date, 'status', val)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Limited">Limited</SelectItem>
                      <SelectItem value="Sold out">Sold out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveDate(date)} className="h-9 w-9 text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
