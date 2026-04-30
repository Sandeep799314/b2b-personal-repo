"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PriceSettingsDialog } from "@/components/price-settings-dialog"
import { BrandSettingsDialog } from "@/components/brand-settings-dialog"
import { DollarSign, Building2, Wallet } from "lucide-react"

export default function SettingsPage() {
    const [showPriceSettings, setShowPriceSettings] = useState(false)
    const [showBrandSettings, setShowBrandSettings] = useState(false)
    const router = useRouter()

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
            <TopHeader />
            <main className="flex-1 overflow-auto animate-fade-in p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
                    <p className="text-neutral-600">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="shadow-brand-sm border-yellow-200/60 transition-all hover:shadow-brand-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-yellow-600" />
                                Price Settings
                            </CardTitle>
                            <CardDescription>
                                Manage currency exchange rates and base currency.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setShowPriceSettings(true)} className="w-full">
                                Configure Prices
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-brand-sm border-blue-200/60 transition-all hover:shadow-brand-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                Brand Settings
                            </CardTitle>
                            <CardDescription>
                                Configure company details and social media links.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setShowBrandSettings(true)} className="w-full">
                                Configure Brand
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-brand-sm border-purple-200/60 transition-all hover:shadow-brand-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-purple-600" />
                                Payment & Credits
                            </CardTitle>
                            <CardDescription>
                                Recharge your wallet and manage credit usage.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => router.push("/credits")} className="w-full bg-purple-600 hover:bg-purple-700">
                                Manage Credits
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <PriceSettingsDialog
                open={showPriceSettings}
                onOpenChange={setShowPriceSettings}
            />

            <BrandSettingsDialog
                open={showBrandSettings}
                onOpenChange={setShowBrandSettings}
            />
        </div>
    )
}
