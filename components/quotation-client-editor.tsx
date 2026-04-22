"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Save, User, Mail, Phone, FileText, CalendarClock, Info } from "lucide-react"

export interface ClientInfo {
  name: string
  email?: string
  phone?: string
  referenceNo?: string
  notes?: string
  validUntil?: string
}

interface QuotationClientEditorProps {
  initialData: ClientInfo
  onUpdate: (data: ClientInfo) => Promise<void>
}

export function QuotationClientEditor({ initialData, onUpdate }: QuotationClientEditorProps) {
  const [formData, setFormData] = useState<ClientInfo>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (field: keyof ClientInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onUpdate(formData)
      toast({
        title: "Client Information Updated",
        description: "The client information has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update client information:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update client information.",
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
          <User className="mr-2 h-5 w-5 text-primary" />
          Client Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="client-name" className="flex items-center">
                <User className="h-4 w-4 mr-2 text-neutral-500" />
                Client Name *
              </Label>
              <Input
                id="client-name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client-email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-neutral-500" />
                Email Address
              </Label>
              <Input
                id="client-email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client-phone" className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-neutral-500" />
                Phone Number
              </Label>
              <Input
                id="client-phone"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client-reference" className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-neutral-500" />
                Reference Number
              </Label>
              <Input
                id="client-reference"
                value={formData.referenceNo || ""}
                onChange={(e) => handleChange("referenceNo", e.target.value)}
                placeholder="Enter reference number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valid-until" className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2 text-neutral-500" />
                Valid Until
              </Label>
              <Input
                id="valid-until"
                type="date"
                value={formData.validUntil || ""}
                onChange={(e) => handleChange("validUntil", e.target.value)}
              />
              <p className="text-xs text-neutral-500">
                Date until which this quotation is valid
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-neutral-500" />
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Enter any additional notes about this quotation"
              rows={4}
            />
            <p className="text-xs text-neutral-500">
              These notes will be visible to the client on the quotation
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
                Save Client Information
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}