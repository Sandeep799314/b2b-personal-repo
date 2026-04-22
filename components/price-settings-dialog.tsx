"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2, RefreshCw, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PriceSettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const CURRENCIES = [
    { code: "INR", name: "Indian Rupee", flag: "🇮🇳", symbol: "₹" },
    { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£" },
    { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€" },
    { code: "AED", name: "UAE Dirham", flag: "🇦🇪", symbol: "د.إ" },
]

interface CurrencyRates {
    [key: string]: number
}

export function PriceSettingsDialog({ open, onOpenChange }: PriceSettingsDialogProps) {
    const { toast } = useToast()
    const [baseCurrency, setBaseCurrency] = useState("INR")
    const [rates, setRates] = useState<CurrencyRates>({})
    const [loading, setLoading] = useState(false)
    const [isManual, setIsManual] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)

    // Load settings from API on mount
    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/settings")
            if (res.ok) {
                const data = await res.json()
                if (data.currency) {
                    setBaseCurrency(data.currency.baseCurrency || "INR")
                    setRates(data.currency.rates || {})
                    setIsManual(data.currency.isManual || false)
                    setLastUpdated(data.currency.lastUpdated || null)
                } else {
                    // First load defaults if empty
                    fetchLiveRates("INR")
                }
            } else {
                fetchLiveRates("INR")
            }
        } catch (error) {
            console.error("Failed to fetch settings", error)
            fetchLiveRates("INR")
        } finally {
            setLoading(false)
        }
    }

    const fetchLiveRates = async (base: string) => {
        if (isManual) return // Don't overwrite manual rates automatically

        setLoading(true)
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`)
            const data = await response.json()

            const newRates: CurrencyRates = {}
            CURRENCIES.forEach(curr => {
                if (curr.code === base) {
                    newRates[curr.code] = 1
                } else {
                    newRates[curr.code] = data.rates[curr.code] || 0
                }
            })

            setRates(newRates)
            setLastUpdated(new Date().toISOString())
        } catch (error) {
            console.error("Failed to fetch rates:", error)
            toast({
                title: "Error fetching rates",
                description: "Could not fetch live rates. Please try again or enter manually.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleBaseCurrencyChange = (value: string) => {
        setBaseCurrency(value)
        if (!isManual) {
            fetchLiveRates(value)
        } else {
            // If manual, we just reset the base rate to 1, user has to update others
            setRates(prev => ({ ...prev, [value]: 1 }))
        }
    }

    const handleRateChange = (currency: string, value: string) => {
        const numValue = parseFloat(value)
        if (!isNaN(numValue)) {
            setRates(prev => ({ ...prev, [currency]: numValue }))
            setIsManual(true)
        }
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            // Fetch current settings to preserve branding
            const currentRes = await fetch("/api/settings")
            const currentData = await currentRes.json()

            const settings = {
                currency: {
                    baseCurrency,
                    rates,
                    isManual,
                    lastUpdated: new Date().toISOString()
                },
                branding: currentData.branding // Preserve branding
            }

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            })

            if (!res.ok) throw new Error("Failed to save")

            toast({
                title: "Settings saved",
                description: "Currency settings have been updated successfully.",
            })
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = () => {
        setIsManual(false)
        fetchLiveRates(baseCurrency)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Price Settings</DialogTitle>
                    <DialogDescription>
                        Manage currency exchange rates and base currency settings.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>Base Currency</Label>
                            <p className="text-sm text-muted-foreground">
                                Select the primary currency for your dashboard.
                            </p>
                        </div>
                        <Select value={baseCurrency} onValueChange={handleBaseCurrencyChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {CURRENCIES.map((curr) => (
                                    <SelectItem key={curr.code} value={curr.code}>
                                        <span className="mr-1 text-muted-foreground">({curr.symbol})</span>
                                        {curr.code}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Exchange Rates</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {isManual ? "Manual Mode" : "Live Rates"}
                                </span>
                                <Switch
                                    checked={isManual}
                                    onCheckedChange={setIsManual}
                                    aria-label="Toggle manual mode"
                                />
                                {!isManual && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleRefresh}
                                        disabled={loading}
                                        title="Refresh live rates"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {CURRENCIES.map((curr) => (
                                <div key={curr.code} className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 w-28">
                                        <span className="font-medium">{curr.code}</span>
                                        <span className="text-muted-foreground text-sm">({curr.symbol})</span>
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={rates[curr.code] || ""}
                                            onChange={(e) => handleRateChange(curr.code, e.target.value)}
                                            disabled={curr.code === baseCurrency || (!isManual && loading)}
                                            className="text-right"
                                            step="0.0001"
                                        />
                                        <span className="text-sm text-muted-foreground w-12">
                                            {curr.code}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {lastUpdated && (
                            <p className="text-xs text-muted-foreground text-right">
                                Last updated: {new Date(lastUpdated).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
