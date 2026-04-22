"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface LeadFormData {
  name: string
  leadDate?: string
  leadReferenceNo?: string
  remarks: string
  contactDetails?: string
}

interface QuotationLeadFormProps {
  onSubmit: (data: LeadFormData) => void
}

export function QuotationLeadForm({ onSubmit }: QuotationLeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    leadDate: "",
    leadReferenceNo: "",
    remarks: "",
    contactDetails: "",
  })

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      alert("Name is required")
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="leadDate">Lead Date (Optional)</Label>
        <Input
          id="leadDate"
          type="date"
          value={formData.leadDate}
          onChange={(e) => handleChange("leadDate", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="leadReferenceNo">Lead Reference No. (Optional)</Label>
        <Input
          id="leadReferenceNo"
          value={formData.leadReferenceNo}
          onChange={(e) => handleChange("leadReferenceNo", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={(e) => handleChange("remarks", e.target.value)}
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="contactDetails">Contact Details (Optional)</Label>
        <Textarea
          id="contactDetails"
          value={formData.contactDetails}
          onChange={(e) => handleChange("contactDetails", e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  )
}
