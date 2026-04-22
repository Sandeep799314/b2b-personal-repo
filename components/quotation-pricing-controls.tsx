"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Calculator, Percent, DollarSign, Eye, EyeOff } from "lucide-react"
import { QuotationPricingOptions } from "@/models/Quotation"

interface QuotationPricingControlsProps {
  initialOptions?: Partial<QuotationPricingOptions>
  onOptionsChange: (options: QuotationPricingOptions) => void
  currency?: string
}

export function QuotationPricingControls({
  initialOptions,
  onOptionsChange,
  currency = "₹",
}: QuotationPricingControlsProps) {
  // Default options merged with any provided initial options
  const [options, setOptions] = useState<QuotationPricingOptions>({
    showIndividualPrices: initialOptions?.showIndividualPrices ?? true,
    showSubtotals: initialOptions?.showSubtotals ?? true,
    showTotal: initialOptions?.showTotal ?? true,
    markupType: initialOptions?.markupType ?? "percentage",
    markupValue: initialOptions?.markupValue ?? 0,
    currency: initialOptions?.currency ?? currency,
    originalTotalPrice: initialOptions?.originalTotalPrice ?? 0,
    finalTotalPrice: initialOptions?.finalTotalPrice ?? 0,
  })

  // Handle option changes
  const handleOptionChange = <K extends keyof QuotationPricingOptions>(key: K, value: QuotationPricingOptions[K]) => {
    const newOptions = { ...options, [key]: value }
    setOptions(newOptions)
    // Don't immediately call onOptionsChange for text/number inputs to avoid refresh during typing
    if (key !== "markupValue") {
      onOptionsChange(newOptions)
    }
  }

  // Handle markup value change with debounce
  const handleMarkupChange = (value: number) => {
    const newOptions = { ...options, markupValue: value }
    setOptions(newOptions)
    // Let the Apply button handle the submission
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <Calculator className="mr-2 h-5 w-5 text-primary" />
          Pricing Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Display Options</h3>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-individual-prices" className="flex items-center">
                <span className="mr-2">Individual Prices</span>
                {options.showIndividualPrices ? (
                  <Eye className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                )}
              </Label>
              <Switch
                id="show-individual-prices"
                checked={options.showIndividualPrices}
                onCheckedChange={(checked) => handleOptionChange("showIndividualPrices", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-subtotals" className="flex items-center">
                <span className="mr-2">Day Subtotals</span>
                {options.showSubtotals ? (
                  <Eye className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                )}
              </Label>
              <Switch
                id="show-subtotals"
                checked={options.showSubtotals}
                onCheckedChange={(checked) => handleOptionChange("showSubtotals", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-total" className="flex items-center">
                <span className="mr-2">Total Price</span>
                {options.showTotal ? (
                  <Eye className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                )}
              </Label>
              <Switch
                id="show-total"
                checked={options.showTotal}
                onCheckedChange={(checked) => handleOptionChange("showTotal", checked)}
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Markup Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Markup Options</h3>
          <Tabs
            defaultValue={options.markupType}
            onValueChange={(value) => handleOptionChange("markupType", value as "percentage" | "fixed")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="percentage" className="flex items-center">
                <Percent className="mr-2 h-4 w-4" />
                Percentage
              </TabsTrigger>
              <TabsTrigger value="fixed" className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Fixed Amount
              </TabsTrigger>
            </TabsList>
            <TabsContent value="percentage" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="markup-percentage">Markup Percentage (%)</Label>
                <div className="flex items-center">
                  <Input
                    id="markup-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={options.markupType === "percentage" ? options.markupValue : 0}
                    onChange={(e) => handleMarkupChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="fixed" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="markup-fixed">Fixed Markup Amount</Label>
                <div className="flex items-center">
                  <span className="mr-2">{currency}</span>
                  <Input
                    id="markup-fixed"
                    type="number"
                    min="0"
                    value={options.markupType === "fixed" ? options.markupValue : 0}
                    onChange={(e) => handleMarkupChange(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="pt-4">
          <Button
            className="w-full"
            onClick={() => onOptionsChange(options)}
          >
            Apply Pricing Options
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}