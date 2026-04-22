"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { convertQuotationPrices } from "@/lib/currency-utils"

interface CurrencySettings {
  baseCurrency: string
  displayCurrency: string
  exchangeRates: Record<string, number>
}

interface CurrencyConversionProps {
  currencySettings?: CurrencySettings
  onUpdateSettings: (settings: CurrencySettings) => Promise<void>
  onUpdateDisplayCurrency: (currency: string) => void
}

export function CurrencyConversion({
  currencySettings,
  onUpdateSettings,
  onUpdateDisplayCurrency
}: CurrencyConversionProps) {
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [settings, setSettings] = useState<CurrencySettings>({
    baseCurrency: "USD",
    displayCurrency: "USD",
    exchangeRates: {
      USD: 1,
      EUR: 0.92,
      INR: 83.36
    }
  })

  // Available currencies
  const currencies = ["INR", "USD", "GBP", "EUR", "AED"]

  // Initialize settings from props
  useEffect(() => {
    if (currencySettings) {
      setSettings(currencySettings)
    }
  }, [currencySettings])

  // Handle display currency change
  const handleDisplayCurrencyChange = (currency: string) => {
    setSettings({
      ...settings,
      displayCurrency: currency
    })

    onUpdateDisplayCurrency(currency)
  }

  // Handle exchange rate change
  const handleExchangeRateChange = (currency: string, value: string) => {
    const rate = parseFloat(value)
    if (isNaN(rate) || rate <= 0) return

    setSettings({
      ...settings,
      exchangeRates: {
        ...settings.exchangeRates,
        [currency]: rate
      }
    })
  }

  // Save exchange rates
  const handleSaveExchangeRates = async () => {
    try {
      await onUpdateSettings(settings)
      toast({
        title: "Success",
        description: "Currency settings updated successfully"
      })
    } catch (error) {
      console.error("Error updating currency settings:", error)
      toast({
        title: "Error",
        description: "Failed to update currency settings",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex justify-between items-center">
          <span>Currency Settings</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide" : "Show"}
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1/2">
                <Label htmlFor="display-currency">Display Currency</Label>
                <Select
                  value={settings.displayCurrency}
                  onValueChange={handleDisplayCurrencyChange}
                >
                  <SelectTrigger id="display-currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-1/2">
                <Label htmlFor="base-currency">Base Currency (Storage)</Label>
                <Input
                  id="base-currency"
                  value={settings.baseCurrency}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Exchange Rates (relative to {settings.baseCurrency})</h4>
              <div className="space-y-2">
                {currencies
                  .filter(currency => currency !== settings.baseCurrency)
                  .map(currency => (
                    <div key={currency} className="flex items-center gap-2">
                      <Label className="w-16">{currency}:</Label>
                      <div className="flex-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={settings.exchangeRates[currency]}
                          onChange={(e) => handleExchangeRateChange(currency, e.target.value)}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        1 {settings.baseCurrency} = {settings.exchangeRates[currency]} {currency}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <Button onClick={handleSaveExchangeRates}>
              Save Exchange Rates
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}