"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Baby, Layout } from "lucide-react"

interface PreviewConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (config: PreviewConfig) => void
}

export interface PreviewConfig {
  adults: number
  children: number
  withDates: boolean
  startDate?: string
  template: number
  customerName?: string
}

export function PreviewConfigModal({ isOpen, onClose, onConfirm }: PreviewConfigModalProps) {
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [withDates, setWithDates] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [template, setTemplate] = useState(1)
  const [customerName, setCustomerName] = useState("")

  const handleConfirm = () => {
    onConfirm({
      adults,
      children,
      withDates,
      startDate: withDates ? startDate : undefined,
      template,
      customerName,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Preview Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Layout className="h-5 w-5 text-purple-500" />
              <Label className="text-base font-medium">Template</Label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTemplate(1)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${template === 1
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-xs sm:text-sm">Minimalist</div>
                <div className="text-[10px] text-gray-500">Clean</div>
              </button>
              <button
                type="button"
                onClick={() => setTemplate(2)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${template === 2
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-xs sm:text-sm">Classic</div>
                <div className="text-[10px] text-gray-500">Standard</div>
              </button>
              <button
                type="button"
                onClick={() => setTemplate(3)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${template === 3
                  ? 'border-[#f0c105] bg-[#f0c105]/5 text-[#9A7B00]'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-xs sm:text-sm">Editorial</div>
                <div className="text-[10px] text-gray-500">Premium</div>
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <Label className="text-base font-medium">Customer Details</Label>
            </div>
            <div>
              <Label htmlFor="customerName" className="text-sm text-gray-600">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Travelers */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <Label className="text-base font-medium">Travelers</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adults" className="text-sm text-gray-600">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="children" className="text-sm text-gray-600">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <Label className="text-base font-medium">Include Dates</Label>
              </div>
              <Switch checked={withDates} onCheckedChange={setWithDates} />
            </div>

            {withDates && (
              <div>
                <Label htmlFor="startDate" className="text-sm text-gray-600">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">End date will be calculated automatically based on trip duration</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
              Generate Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}