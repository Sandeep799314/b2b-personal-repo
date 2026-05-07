"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PriceSettingsDialog } from "@/components/price-settings-dialog"
import { BrandSettingsDialog } from "@/components/brand-settings-dialog"
import { DollarSign, Building2, Wallet, Plus, Edit2, Trash2, Mail, Phone, MapPin, Palette, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
    const [currentView, setCurrentView] = useState<"main" | "entities">("main")
    const [showPriceSettings, setShowPriceSettings] = useState(false)
    const [showBrandSettings, setShowBrandSettings] = useState(false)
    const [editingCompany, setEditingCompany] = useState<any>(null)
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/settings")
            if (res.ok) {
                const data = await res.json()
                
                // Migration/Cleanup: Ensure all companies have IDs
                if (data.companies) {
                    data.companies = data.companies.map((c: any) => ({
                        ...c,
                        id: c.id || Math.random().toString(36).substring(7)
                    }))
                }
                
                if (data.branding && !data.branding.id) {
                    data.branding.id = "default"
                }

                setSettings(data)
            }
        } catch (error) {
            console.error("Failed to load settings", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSetDefault = async (company: any) => {
        const updatedCompany = { ...company, isDefault: true }
        await handleSaveCompany(updatedCompany)
    }

    const handleSaveCompany = async (companyData: any) => {
        try {
            // Use current settings or empty defaults
            const currentCompanies = settings?.companies || []
            let updatedCompanies = [...currentCompanies]
            
            // If this entity is marked as default, unset isDefault for all other entities
            if (companyData.isDefault) {
                updatedCompanies = updatedCompanies.map((c: any) => ({
                    ...c,
                    isDefault: false
                }))
            }

            const index = updatedCompanies.findIndex(c => c.id === companyData.id)

            if (index >= 0) {
                updatedCompanies[index] = companyData
            } else {
                updatedCompanies.push(companyData)
            }

            // Also update the global branding field if this is marked as default 
            // OR if it's the very first company being added
            let updatedBranding = settings?.branding || {}
            if (companyData.isDefault || updatedCompanies.length === 1 || !settings?.branding?.companyName) {
                updatedBranding = { ...companyData }
            }

            const payload = {
                currency: settings?.currency || { baseCurrency: "INR", rates: {}, isManual: false },
                branding: updatedBranding,
                companies: updatedCompanies
            }

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to save")

            await fetchSettings()
            setShowBrandSettings(false)
            setEditingCompany(null)
            
            toast({
                title: "Success",
                description: "Entity details saved successfully."
            })
        } catch (error) {
            console.error("Error saving company", error)
            toast({
                title: "Error",
                description: "Failed to save entity details.",
                variant: "destructive"
            })
        }
    }

    const handleDeleteCompany = async (id: string) => {
        if (!confirm("Are you sure you want to delete this entity?")) return

        try {
            const updatedCompanies = settings.companies.filter((c: any) => c.id !== id)
            const payload = {
                ...settings,
                companies: updatedCompanies
            }

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to delete")

            await fetchSettings()
            toast({
                title: "Deleted",
                description: "Entity details deleted successfully."
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete entity.",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
            <TopHeader />
            <main className="flex-1 overflow-auto animate-fade-in p-6 space-y-8">
                {currentView === "main" ? (
                    <>
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
                                        Entity Details
                                    </CardTitle>
                                    <CardDescription>
                                        Manage multiple entity profiles and brandings.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button 
                                        onClick={() => setCurrentView("entities")} 
                                        className="w-full"
                                    >
                                        Manage Entities
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
                    </>
                ) : (
                    /* Entity Details View */
                    <div className="space-y-8 max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
                            <div className="flex items-center gap-4">
                                <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => setCurrentView("main")}
                                    className="h-10 w-10 rounded-full border-neutral-200 hover:bg-neutral-50 shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-900">Entity Details</h1>
                                    <p className="text-neutral-500">Manage your business profiles and branding assets.</p>
                                </div>
                                </div>
                                <Button 
                                onClick={() => {
                                    setEditingCompany(null)
                                    setShowBrandSettings(true)
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95"
                                >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Entity
                                </Button>
                                </div>


                        {/* Saved Entities List Section (at the bottom/center) */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-neutral-400" />
                                    Registered Profiles
                                </h3>
                                <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
                                    {settings?.companies?.length || 0} Saved
                                </span>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {settings?.companies?.map((company: any) => (
                                    <Card key={company.id} className="relative group overflow-hidden border-neutral-200 hover:border-brand-primary/50 transition-all hover:shadow-lg bg-white">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col gap-2">
                                                    <div className="h-14 w-28 bg-neutral-50 rounded-lg flex items-center justify-center border border-neutral-100 p-2 group-hover:bg-white transition-colors">
                                                        {company.logo ? (
                                                            <img src={company.logo} alt={company.companyName} className="max-h-full max-w-full object-contain" />
                                                        ) : (
                                                            <Building2 className="h-6 w-6 text-neutral-300" />
                                                        )}
                                                    </div>
                                                    {company.isDefault && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 w-fit">
                                                            Primary Default
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-4px] group-hover:translate-y-0 duration-200">
                                                    {!company.isDefault && (
                                                        <Button 
                                                            variant="secondary" 
                                                            size="icon" 
                                                            className="h-8 w-8 bg-white shadow-sm border border-neutral-100 hover:text-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => handleSetDefault(company)}
                                                            title="Set as Global Default"
                                                        >
                                                            <Star className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        variant="secondary" 
                                                        size="icon" 
                                                        className="h-8 w-8 bg-white shadow-sm border border-neutral-100 hover:text-blue-600 hover:bg-blue-50"
                                                        onClick={() => {
                                                            setEditingCompany(company)
                                                            setShowBrandSettings(true)
                                                        }}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button 
                                                        variant="secondary" 
                                                        size="icon" 
                                                        className="h-8 w-8 bg-white shadow-sm border border-neutral-100 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDeleteCompany(company.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg mt-4 font-bold text-neutral-900">{company.companyName}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 pt-2 text-sm text-neutral-600">
                                            <div className="grid gap-2.5">
                                                {company.contactEmail && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-7 w-7 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                                                            <Mail className="h-3.5 w-3.5 text-neutral-400" />
                                                        </div>
                                                        <span className="truncate text-neutral-700">{company.contactEmail}</span>
                                                    </div>
                                                )}
                                                {company.contactPhone && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-7 w-7 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                                                            <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                                        </div>
                                                        <span className="text-neutral-700">{company.contactPhone}</span>
                                                    </div>
                                                )}
                                                {company.address && (
                                                    <div className="flex items-start gap-3 pt-1">
                                                        <div className="h-7 w-7 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100 flex-shrink-0">
                                                            <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                                                        </div>
                                                        <span className="line-clamp-2 text-neutral-600 leading-snug">{company.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {(!settings?.companies || settings.companies.length === 0) && !loading && (
                                    <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-white/50">
                                        <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                            <Building2 className="h-10 w-10 text-neutral-300" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-neutral-900">No entity details yet</h4>
                                        <p className="text-neutral-500 max-w-xs mx-auto mb-6">Start by adding your first entity profile to manage your brandings.</p>
                                        <Button 
                                            onClick={() => {
                                                setEditingCompany(null)
                                                setShowBrandSettings(true)
                                            }}
                                            className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Your First Entity
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <PriceSettingsDialog
                open={showPriceSettings}
                onOpenChange={setShowPriceSettings}
            />

            <BrandSettingsDialog
                open={showBrandSettings}
                onOpenChange={setShowBrandSettings}
                initialData={editingCompany}
                onSave={handleSaveCompany}
            />
        </div>
    )
}
