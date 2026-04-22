"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IItinerary } from "@/models/Itinerary"
import { Upload, X } from "lucide-react"

interface ItineraryDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    guestDetails: IItinerary['guestDetails']
    agencyDetails: IItinerary['agencyDetails']
    onSave: (guestDetails: IItinerary['guestDetails'], agencyDetails: IItinerary['agencyDetails']) => void
}

export function ItineraryDetailsModal({
    isOpen,
    onClose,
    guestDetails,
    agencyDetails,
    onSave,
}: ItineraryDetailsModalProps) {
    const [activeTab, setActiveTab] = useState("guest")

    // Guest State
    const [guestData, setGuestData] = useState({
        name: "",
        leadReferenceCode: "",
        email: "",
        mobile: "",
    })

    // Agency State
    const [agencyData, setAgencyData] = useState({
        logo: "",
        name: "",
        address: "",
        phone: "",
        email: "",
        gst: "",
    })

    // Load data when modal opens
    useEffect(() => {
        if (isOpen) {
            setGuestData({
                name: guestDetails?.name || "",
                leadReferenceCode: guestDetails?.leadReferenceCode || "",
                email: guestDetails?.email || "",
                mobile: guestDetails?.mobile || "",
            })

            setAgencyData({
                logo: agencyDetails?.logo || "",
                name: agencyDetails?.name || "",
                address: agencyDetails?.address || "",
                phone: agencyDetails?.phone || "",
                email: agencyDetails?.email || "",
                gst: agencyDetails?.gst || "",
            })
        }
    }, [isOpen, guestDetails, agencyDetails])

    const handleSave = () => {
        onSave(guestData, agencyData)
        onClose()
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // In a real app, you'd upload to S3/Cloudinary here.
            // For now, we'll use a local object URL or base64 placeholder if needed.
            // Ideally, the parent should handle the actual upload logic or we use a pre-signed URL.
            // Simulating a "uploaded" URL for now or just using a data URL for preview.
            const reader = new FileReader()
            reader.onloadend = () => {
                setAgencyData(prev => ({ ...prev, logo: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Itinerary Details</DialogTitle>
                    <DialogDescription>
                        Enter the details for the guests and the agency handling this itinerary.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="guest">Guest Details</TabsTrigger>
                        <TabsTrigger value="agency">Agency Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="guest" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="guest-name">Lead Guest Name</Label>
                                <Input
                                    id="guest-name"
                                    value={guestData.name}
                                    onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lead-ref">Lead Reference No.</Label>
                                <Input
                                    id="lead-ref"
                                    value={guestData.leadReferenceCode}
                                    onChange={(e) => setGuestData({ ...guestData, leadReferenceCode: e.target.value })}
                                    placeholder="e.g. REF-12345"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guest-phone">Phone No.</Label>
                                <Input
                                    id="guest-phone"
                                    value={guestData.mobile}
                                    onChange={(e) => setGuestData({ ...guestData, mobile: e.target.value })}
                                    placeholder="e.g. +91 9876543210"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guest-email">Email ID</Label>
                                <Input
                                    id="guest-email"
                                    value={guestData.email}
                                    onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                                    placeholder="e.g. john@example.com"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="agency" className="space-y-4 py-4">
                        {/* Logo Upload */}
                        <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 rounded-md border border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                                {agencyData.logo ? (
                                    <>
                                        <img src={agencyData.logo} alt="Agency Logo" className="h-full w-full object-contain" />
                                        <button
                                            onClick={() => setAgencyData({ ...agencyData, logo: "" })}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl hover:bg-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <Upload className="h-6 w-6 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="agency-logo" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                    Upload Logo
                                </Label>
                                <Input
                                    id="agency-logo"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />
                                <p className="text-xs text-gray-500 mt-1">Recommended: Square PNG or JPG, max 2MB</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="agency-name">Agency Name</Label>
                                <Input
                                    id="agency-name"
                                    value={agencyData.name}
                                    onChange={(e) => setAgencyData({ ...agencyData, name: e.target.value })}
                                    placeholder="e.g. Dream Travels"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="agency-address">Address</Label>
                                <Input
                                    id="agency-address"
                                    value={agencyData.address}
                                    onChange={(e) => setAgencyData({ ...agencyData, address: e.target.value })}
                                    placeholder="Full agency address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agency-phone">Phone No.</Label>
                                <Input
                                    id="agency-phone"
                                    value={agencyData.phone}
                                    onChange={(e) => setAgencyData({ ...agencyData, phone: e.target.value })}
                                    placeholder="Contact number"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agency-email">Email ID</Label>
                                <Input
                                    id="agency-email"
                                    value={agencyData.email}
                                    onChange={(e) => setAgencyData({ ...agencyData, email: e.target.value })}
                                    placeholder="Agency email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agency-gst">GST No.</Label>
                                <Input
                                    id="agency-gst"
                                    value={agencyData.gst}
                                    onChange={(e) => setAgencyData({ ...agencyData, gst: e.target.value })}
                                    placeholder="GST Identification Number"
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Details</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
