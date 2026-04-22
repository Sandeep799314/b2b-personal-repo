"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Save, 
  Settings2, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  MapPin, 
  CalendarDays
} from "lucide-react"

interface CurrencyOption {
  value: string
  label: string
  symbol: string
  icon: React.ReactNode
}

const currencies: CurrencyOption[] = [
  {
    value: "INR",
    label: "Indian Rupee (₹)",
    symbol: "₹",
    icon: <span className="font-semibold">₹</span>,
  },
  {
    value: "USD",
    label: "US Dollar ($)",
    symbol: "$",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    value: "EUR",
    label: "Euro (€)",
    symbol: "€",
    icon: <Euro className="h-4 w-4" />,
  },
  {
    value: "GBP",
    label: "British Pound (£)",
    symbol: "£",
    icon: <PoundSterling className="h-4 w-4" />,
  },
]

export interface QuotationSettingsData {
  title: string
  description: string
  destination: string
  duration: string
  currency: string
}

interface QuotationSettingsProps {
  initialData: QuotationSettingsData
  onUpdate: (data: QuotationSettingsData) => Promise<void>
}

export function QuotationSettings({ initialData, onUpdate }: QuotationSettingsProps) {
  const [formData, setFormData] = useState<QuotationSettingsData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (field: keyof QuotationSettingsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onUpdate(formData)
      toast({
        title: "Quotation Settings Updated",
        description: "The quotation settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update quotation settings:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update quotation settings.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings2 className="mr-2 h-5 w-5 text-primary" />
          Quotation Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quotation Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter quotation title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter a short description"
                required
              />
              <p className="text-xs text-neutral-500">
                A brief overview of the trip shown at the top of the quotation
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
                Destination *
              </Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleChange("destination", e.target.value)}
                placeholder="Enter destination"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-neutral-500" />
                Duration *
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="e.g. 5 Days / 4 Nights"
                required
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleChange("currency", value)}
            >
              <SelectTrigger id="currency" className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    <div className="flex items-center">
                      <span className="mr-2">{currency.icon}</span>
                      {currency.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-500">
              All prices will be displayed in this currency
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}