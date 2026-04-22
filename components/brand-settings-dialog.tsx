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
import { Upload, Save, Building2, Facebook, Instagram, Twitter, Youtube, Globe, Phone, Loader2 } from "lucide-react"

interface BrandSettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface BrandingSettings {
    logo?: string
    companyName?: string
    contactEmail?: string
    contactPhone?: string
    address?: string
    socialLinks: {
        instagram?: string
        whatsapp?: string
        facebook?: string
        twitter?: string
        youtube?: string
        website?: string
    }
}

export function BrandSettingsDialog({ open, onOpenChange }: BrandSettingsDialogProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [branding, setBranding] = useState<BrandingSettings>({
        socialLinks: {}
    })

    useEffect(() => {
        if (open) {
            fetchSettings()
        }
    }, [open])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/settings")
            if (res.ok) {
                const data = await res.json()
                if (data.branding) {
                    // Merge with defaults to ensure socialLinks structure exists
                    setBranding({
                        ...data.branding,
                        socialLinks: data.branding.socialLinks || {}
                    })
                }
            }
        } catch (error) {
            console.error("Failed to load branding settings", error)
        } finally {
            setLoading(false)
        }
    }

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
        // In real app, upload to storage/S3 and get URL
        // For now, using object URL or base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            handleUpdate("logo", result);
        };
        reader.readAsDataURL(file);
    }

    const handleSave = async () => {
        try {
            setLoading(true)
            // We need to preserve other settings (currency), so we might want to fetch first or just PATCH if API supported it.
            // Current API implementation expects full object or partial? Mongoose update using $set allows partial.
            // But my POST route implementation does: currency: data.currency, branding: data.branding.
            // Use $set, so if I only send branding, currency should be untouched?
            // Wait, let's verify POST implementation.
            // POST logic: type: "global", $set: { currency: data.currency, branding: data.branding }
            // If data.currency is undefined, $set might unset it or ignore it??
            // Mongoose: if property is undefined in object passed to $set, it's NOT ignored, it likely sets it to undefined?
            // No, JSON.stringify removes undefined keys.
            // FETCHING current settings first is safer to prevent overwriting currency with null if we only send branding.

            const currentRes = await fetch("/api/settings")
            const currentData = await currentRes.json()

            const payload = {
                currency: currentData.currency, // Keep existing currency settings
                branding: branding
            }

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to save")

            toast({
                title: "Settings saved",
                description: "Brand settings have been updated successfully.",
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
                    <DialogTitle>Brand Settings</DialogTitle>
                    <DialogDescription>
                        Configure your company details and branding used in itineraries.
                    </DialogDescription>
                </DialogHeader>

                {loading && !branding.companyName ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="grid gap-6 py-4">
                        {/* Company Details */}
                        <div className="space-y-4">
                            <h4 className="font-medium flex items-center gap-2 text-sm text-gray-500">
                                <Building2 className="h-4 w-4" />
                                Company Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Logo Upload */}
                                <div className="md:col-span-2">
                                    <Label>Company Logo</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                        {branding.logo ? (
                                            <div className="relative group">
                                                <img
                                                    src={branding.logo}
                                                    alt="Company Logo"
                                                    className="h-16 w-auto object-contain border p-2 rounded-lg bg-gray-50"
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
                                        ) : null}

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
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        value={branding.companyName || ""}
                                        onChange={(e) => handleUpdate("companyName", e.target.value)}
                                        placeholder="e.g. Acme Travel"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Contact Email</Label>
                                    <Input
                                        id="contactEmail"
                                        value={branding.contactEmail || ""}
                                        onChange={(e) => handleUpdate("contactEmail", e.target.value)}
                                        placeholder="contact@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contactPhone">Contact Phone</Label>
                                    <Input
                                        id="contactPhone"
                                        value={branding.contactPhone || ""}
                                        onChange={(e) => handleUpdate("contactPhone", e.target.value)}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={branding.address || ""}
                                        onChange={(e) => handleUpdate("address", e.target.value)}
                                        placeholder="Full office address..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-medium flex items-center gap-2 text-sm text-gray-500">
                                <Globe className="h-4 w-4" />
                                Social Media Links
                            </h4>

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
                        </div>
                    </div>
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
