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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Save, Building2, Facebook, Instagram, Twitter, Youtube, Globe, Phone, Loader2, Image as ImageIcon, FileText, Mail, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BrandSettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: BrandingSettings | null
    onSave?: (data: BrandingSettings) => void
}

interface BrandingSettings {
    id: string
    logo?: string
    companyName?: string
    contactEmail?: string
    contactPhone?: string
    address?: string
    gst?: string
    isDefault?: boolean
    headerImage?: string
    footerImage?: string
    headerText?: string
    footerText?: string
    socialLinks: {
        instagram?: string
        whatsapp?: string
        facebook?: string
        twitter?: string
        youtube?: string
        website?: string
    }
}

export function BrandSettingsDialog({ open, onOpenChange, initialData, onSave }: BrandSettingsDialogProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [branding, setBranding] = useState<BrandingSettings>({
        id: "",
        socialLinks: {}
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                setBranding({
                    ...initialData,
                    socialLinks: initialData.socialLinks || {}
                })
            } else {
                setBranding({
                    id: Math.random().toString(36).substring(7),
                    socialLinks: {}
                })
            }
        }
    }, [open, initialData])

    const handleUpdate = (field: keyof BrandingSettings, value: any) => {
        setBranding(prev => ({ ...prev, [field]: value }))
    }

    const handleSocialUpdate = (platform: string, value: string) => {
        setBranding(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value
            }
        }))
    }

    const handleLogoUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            handleUpdate("logo", result);
        };
        reader.readAsDataURL(file);
    }

    const handleHeaderUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            handleUpdate("headerImage", result);
        };
        reader.readAsDataURL(file);
    }

    const handleFooterUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            handleUpdate("footerImage", result);
        };
        reader.readAsDataURL(file);
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            
            if (onSave) {
                await onSave(branding)
            } else {
                // Legacy support
                const currentRes = await fetch("/api/settings")
                const currentData = await currentRes.json()

                const payload = {
                    currency: currentData.currency,
                    branding: branding
                }

                const res = await fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })

                if (!res.ok) throw new Error("Failed to save")
            }

            toast({
                title: "Settings saved",
                description: "Entity details have been updated successfully.",
            })
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Entity Settings</DialogTitle>
                    <DialogDescription>
                        Configure your entity details and branding used in itineraries.
                    </DialogDescription>
                </DialogHeader>

                {loading && !branding.companyName ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <Tabs defaultValue="identity" className="w-full mt-4">
                        <TabsList className="grid w-full grid-cols-4 mb-6">
                            <TabsTrigger value="identity" className="text-xs">Overview</TabsTrigger>
                            <TabsTrigger value="contact" className="text-xs">Contact</TabsTrigger>
                            <TabsTrigger value="brand" className="text-xs">Brand Details</TabsTrigger>
                            <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
                        </TabsList>

                        <div className="min-h-[400px]">
                            {/* Overview Section */}
                            <TabsContent value="identity" className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label>Entity Logo</Label>
                                            <div className="mt-2 flex items-center gap-4">
                                                {branding.logo ? (
                                                    <div className="relative group">
                                                        <img
                                                            src={branding.logo}
                                                            alt="Entity Logo"
                                                            className="h-20 w-auto object-contain border p-2 rounded-lg bg-gray-50"
                                                        />
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleUpdate("logo", undefined)}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="h-20 w-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 text-gray-400">
                                                        <Building2 className="h-8 w-8" />
                                                    </div>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        const input = document.createElement("input")
                                                        input.type = "file"
                                                        input.accept = "image/*"
                                                        input.onchange = (e) => {
                                                            const file = (e.target as HTMLInputElement).files?.[0]
                                                            if (file) handleLogoUpload(file)
                                                        }
                                                        input.click()
                                                    }}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {branding.logo ? "Change Logo" : "Upload Logo"}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">Entity Name</Label>
                                            <Input
                                                id="companyName"
                                                value={branding.companyName || ""}
                                                onChange={(e) => handleUpdate("companyName", e.target.value)}
                                                placeholder="e.g. Acme Travel"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="isDefault"
                                                checked={branding.isDefault || false}
                                                onChange={(e) => handleUpdate("isDefault", e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                            />
                                            <Label htmlFor="isDefault" className="cursor-pointer font-semibold text-emerald-700">Set as Global Website Default</Label>
                                        </div>
                                        <p className="text-[10px] text-gray-400 -mt-1 ml-6">When selected, this entity's details (logo, contact, social) will be used throughout the website by default.</p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Contact Section */}
                            <TabsContent value="contact" className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactEmail">Contact Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="contactEmail"
                                                value={branding.contactEmail || ""}
                                                onChange={(e) => handleUpdate("contactEmail", e.target.value)}
                                                placeholder="contact@example.com"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactPhone">Contact Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="contactPhone"
                                                value={branding.contactPhone || ""}
                                                onChange={(e) => handleUpdate("contactPhone", e.target.value)}
                                                placeholder="+1 234 567 890"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Textarea
                                                id="address"
                                                value={branding.address || ""}
                                                onChange={(e) => handleUpdate("address", e.target.value)}
                                                placeholder="Full office address..."
                                                rows={4}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gst">GST Number (Optional)</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="gst"
                                                value={branding.gst || ""}
                                                onChange={(e) => handleUpdate("gst", e.target.value)}
                                                placeholder="Enter GST number"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Brand Details Section */}
                            <TabsContent value="brand" className="space-y-8">
                                <div className="grid grid-cols-1 gap-8">
                                    {/* Header Asset */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <ImageIcon className="h-4 w-4" />
                                            Header Details
                                        </div>
                                        <div className="grid gap-4 p-4 border rounded-xl bg-gray-50/50">
                                            <div className="space-y-2">
                                                <Label>Header Image (Banner)</Label>
                                                <div className="flex items-center gap-4">
                                                    {branding.headerImage && (
                                                        <img src={branding.headerImage} alt="Header" className="h-12 w-32 object-cover border rounded" />
                                                    )}
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const input = document.createElement("input")
                                                        input.type = "file"
                                                        input.accept = "image/*"
                                                        input.onchange = (e) => {
                                                            const file = (e.target as HTMLInputElement).files?.[0]
                                                            if (file) handleHeaderUpload(file)
                                                        }
                                                        input.click()
                                                    }}>
                                                        <Upload className="h-3 w-3 mr-2" />
                                                        Upload Header
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="headerText">Header Text / Slogan</Label>
                                                <Input
                                                    id="headerText"
                                                    value={branding.headerText || ""}
                                                    onChange={(e) => handleUpdate("headerText", e.target.value)}
                                                    placeholder="e.g. Your Journey, Our Passion"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Asset */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <FileText className="h-4 w-4" />
                                            Footer Details
                                        </div>
                                        <div className="grid gap-4 p-4 border rounded-xl bg-gray-50/50">
                                            <div className="space-y-2">
                                                <Label>Footer Image / Logo</Label>
                                                <div className="flex items-center gap-4">
                                                    {branding.footerImage && (
                                                        <img src={branding.footerImage} alt="Footer" className="h-12 w-32 object-contain border rounded" />
                                                    )}
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        const input = document.createElement("input")
                                                        input.type = "file"
                                                        input.accept = "image/*"
                                                        input.onchange = (e) => {
                                                            const file = (e.target as HTMLInputElement).files?.[0]
                                                            if (file) handleFooterUpload(file)
                                                        }
                                                        input.click()
                                                    }}>
                                                        <Upload className="h-3 w-3 mr-2" />
                                                        Upload Footer
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="footerText">Footer Notes / Legal</Label>
                                                <Textarea
                                                    id="footerText"
                                                    value={branding.footerText || ""}
                                                    onChange={(e) => handleUpdate("footerText", e.target.value)}
                                                    placeholder="e.g. Terms & Conditions apply"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Social Section */}
                            <TabsContent value="social" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-pink-600" />
                                        <Input
                                            value={branding.socialLinks?.instagram || ""}
                                            onChange={(e) => handleSocialUpdate("instagram", e.target.value)}
                                            placeholder="Instagram URL"
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-green-600" />
                                        <Input
                                            value={branding.socialLinks?.whatsapp || ""}
                                            onChange={(e) => handleSocialUpdate("whatsapp", e.target.value)}
                                            placeholder="WhatsApp Number"
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-blue-600" />
                                        <Input
                                            value={branding.socialLinks?.facebook || ""}
                                            onChange={(e) => handleSocialUpdate("facebook", e.target.value)}
                                            placeholder="Facebook URL"
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-black" />
                                        <Input
                                            value={branding.socialLinks?.twitter || ""}
                                            onChange={(e) => handleSocialUpdate("twitter", e.target.value)}
                                            placeholder="X (Twitter) URL"
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-red-600" />
                                        <Input
                                            value={branding.socialLinks?.youtube || ""}
                                            onChange={(e) => handleSocialUpdate("youtube", e.target.value)}
                                            placeholder="YouTube URL"
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
                                        <Input
                                            value={branding.socialLinks?.website || ""}
                                            onChange={(e) => handleSocialUpdate("website", e.target.value)}
                                            placeholder="Website URL"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
