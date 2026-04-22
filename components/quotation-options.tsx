"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, Upload, FileText } from "lucide-react"
import { ComingSoon } from "./coming-soon"
import { useRouter } from "next/navigation"

interface QuotationOptionsProps {
  onOptionSelect: (option: string) => void
  onBack?: () => void
}

export function QuotationOptions({ onOptionSelect, onBack }: QuotationOptionsProps) {
  const router = useRouter()

  const options = [
    {
      id: "new-itinerary",
      title: "Create New Itinerary",
      description: "Build a new itinerary from scratch",
      icon: Package,
    },
    {
      id: "convert-from-itinerary",
      title: "Convert from Itinerary",
      description: "Convert an existing itinerary to a quotation with pricing controls",
      icon: FileText,
    },
  ]

  const handleSelect = (optionId: string) => {
    if (optionId === "convert-from-itinerary") {
      router.push("/itinerary?selectForQuotation=true")
    } else if (optionId === "new-itinerary") {
      onOptionSelect("create-blank-itinerary")
    } else {
      onOptionSelect(optionId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack} size="sm">
            ← Back
          </Button>
        )}
        <h2 className="text-2xl font-semibold">Choose Your Starting Point</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {options.map((option) => {
          const Icon = option.icon
          return (
            <Card key={option.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {option.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                <Button
                  onClick={() => handleSelect(option.id)}
                  className="w-full"
                >
                  Select
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
