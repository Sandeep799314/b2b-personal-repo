"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Baby, Layout, Building2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PreviewConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (config: PreviewConfig) => void
  initialCompanyId?: string
}

export interface PreviewConfig {
  adults: number
  children: number
  withDates: boolean
  startDate?: string
  template: number
  customerName?: string
  companyId?: string
}

export function PreviewConfigModal({ isOpen, onClose, onConfirm, initialCompanyId }: PreviewConfigModalProps) {
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [withDates, setWithDates] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [template, setTemplate] = useState(4) // Default to Branded Premium
  const [customerName, setCustomerName] = useState("")
  const [companyId, setCompanyId] = useState<string>(initialCompanyId || "")
  const [allCompanies, setAllCompanies] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchCompanies()
    }
  }, [isOpen])

  useEffect(() => {
    if (initialCompanyId) {
      setCompanyId(initialCompanyId)
    }
  }, [initialCompanyId])

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        let companies = data.companies || []
        
        // Ensure global branding is in the list
        if (data.branding?.companyName) {
          const defaultExists = companies.some((c: any) => c.id === "default" || c.companyName === data.branding.companyName)
          if (!defaultExists) {
            companies = [{ ...data.branding, id: data.branding.id || "default", isDefaultBrand: true }, ...companies]
          }
        }
        
        setAllCompanies(companies)
        if (companies.length > 0) {
          // Select default or first one
          const defaultComp = companies.find((c: any) => c.isDefault || c.isDefaultBrand)
          setCompanyId(defaultComp?.id || companies[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch companies", error)
    }
  }

  const handleConfirm = () => {
    onConfirm({
      adults,
      children,
      withDates,
      startDate: withDates ? startDate : undefined,
      template,
      customerName,
      companyId,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Preview Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Layout className="h-5 w-5 text-purple-500" />
              <Label className="text-base font-medium">Template Style</Label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTemplate(1)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${template === 1
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-xs sm:text-sm text-center">Minimalist</div>
              </button>
              <button
                type="button"
                onClick={() => setTemplate(2)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${template === 2
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-xs sm:text-sm text-center">Classic</div>
              </button>
              <button
                type="button"
                onClick={() => setTemplate(3)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${template === 3
                  ? 'border-[#f0c105] bg-[#f0c105]/5 text-[#9A7B00]'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-xs sm:text-sm text-center">Editorial</div>
              </button>
              <button
                type="button"
                onClick={() => setTemplate(4)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${template === 4
                  ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-xs sm:text-sm text-center">Branded Premium</div>
              </button>
              <button
                type="button"
                onClick={() => setTemplate(5)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${template === 5
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-xs sm:text-sm text-center">Elite Elegance</div>
              </button>
            </div>
          </div>

          {/* Company Selection */}
          {allCompanies.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-emerald-500" />
                <Label className="text-base font-medium">Agency Profile</Label>
              </div>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an agency profile..." />
                </SelectTrigger>
                <SelectContent>
                  {allCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
