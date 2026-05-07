"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IItinerary } from "@/models/Itinerary"
import { Upload, X, Building2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ItineraryDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    guestDetails: IItinerary['guestDetails']
    agencyDetails: IItinerary['agencyDetails']
    headerFooter: IItinerary['headerFooter']
    onSave: (
        guestDetails: IItinerary['guestDetails'], 
        agencyDetails: IItinerary['agencyDetails'],
        headerFooter: IItinerary['headerFooter'],
        entityId?: string
    ) => void
}

export function ItineraryDetailsModal({
    isOpen,
    onClose,
    guestDetails,
    agencyDetails,
    headerFooter,
    onSave,
}: ItineraryDetailsModalProps) {
    const [activeTab, setActiveTab] = useState("guest")
    const [allCompanies, setAllCompanies] = useState<any[]>([])
    const [selectedEntityId, setSelectedEntityId] = useState<string>("")

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

    // Header/Footer State
    const [headerFooterData, setHeaderFooterData] = useState({
        headerImage: "",
        footerImage: "",
        contactInfo: "",
        showOnAllPages: true,
    })

    // Load companies
    useEffect(() => {
        if (isOpen) {
            fetchCompanies()
        }
    }, [isOpen])

    const fetchCompanies = async () => {
        try {
            const res = await fetch("/api/settings")
            if (res.ok) {
                const data = await res.json()
                let companies = data.companies || []
                
                // Ensure global branding is in the list
                if (data.branding?.companyName) {
                    const defaultExists = companies.some((c: any) => c.id === "default" || c.companyName === data.branding.companyName)
                    if (!defaultExists) {
                        companies = [{ ...data.branding, id: data.branding.id || "default", isDefaultBrand: true }, ...companies]
                    }
                }
                
                setAllCompanies(companies)
            }
        } catch (error) {
            console.error("Failed to fetch companies", error)
        }
    }

    const handleEntitySelect = (entityId: string) => {
        setSelectedEntityId(entityId)
        const selected = allCompanies.find(c => c.id === entityId)
        if (selected) {
            setAgencyData({
                logo: selected.logo || "",
                name: selected.companyName || "",
                address: selected.address || "",
                phone: selected.contactPhone || "",
                email: selected.contactEmail || "",
                gst: selected.gst || "",
            })

            // Also optionally update header/footer if they are provided in the entity
            if (selected.headerImage || selected.footerImage || selected.footerText) {
                setHeaderFooterData(prev => ({
                    ...prev,
                    headerImage: selected.headerImage || prev.headerImage,
                    footerImage: selected.footerImage || prev.footerImage,
                    contactInfo: selected.footerText || prev.contactInfo,
                }))
            }
        }
    }

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

            setHeaderFooterData({
                headerImage: headerFooter?.headerImage || "",
                footerImage: headerFooter?.footerImage || "",
                contactInfo: headerFooter?.contactInfo || "",
                showOnAllPages: headerFooter?.showOnAllPages !== false,
            })

            // If agency name matches one of the companies, pre-select it
            if (agencyDetails?.name && allCompanies.length > 0) {
                const match = allCompanies.find(c => c.companyName === agencyDetails.name)
                if (match) setSelectedEntityId(match.id)
            }
        }
    }, [isOpen, guestDetails, agencyDetails, headerFooter, allCompanies])

    const handleSave = () => {
        onSave(guestData, agencyData, headerFooterData, selectedEntityId)
        onClose()
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'headerImage' | 'footerImage') => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (field === 'logo') {
                    setAgencyData(prev => ({ ...prev, logo: reader.result as string }))
                } else {
                    setHeaderFooterData(prev => ({ ...prev, [field]: reader.result as string }))
                }
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Itinerary Details</DialogTitle>
                    <DialogDescription>
                        Enter the details for guests, agency, and custom branding.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="guest">Guest</TabsTrigger>
                        <TabsTrigger value="agency">Agency</TabsTrigger>
                        <TabsTrigger value="headerfooter">Header/Footer</TabsTrigger>
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
                        {/* Entity Selection */}
                        {allCompanies.length > 0 && (
                            <div className="space-y-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                <div className="flex items-center space-x-2">
                                    <Building2 className="h-4 w-4 text-emerald-500" />
                                    <Label className="text-sm font-semibold">Quick Select Entity Profile</Label>
                                </div>
                                <Select value={selectedEntityId} onValueChange={handleEntitySelect}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Choose an entity to auto-fill details..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCompanies.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-neutral-500 italic">Selecting an entity will automatically fill the fields below.</p>
                            </div>
                        )}

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
                                    onChange={(e) => handleImageUpload(e, 'logo')}
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

                    <TabsContent value="headerfooter" className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Header Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative h-16 w-full max-w-[200px] rounded-md border border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                                        {headerFooterData.headerImage ? (
                                            <>
                                                <img src={headerFooterData.headerImage} alt="Header" className="h-full w-full object-contain" />
                                                <button
                                                    onClick={() => setHeaderFooterData(prev => ({ ...prev, headerImage: "" }))}
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
                                        <Label htmlFor="header-image" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 py-2">
                                            Upload Header
                                        </Label>
                                        <Input
                                            id="header-image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, 'headerImage')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Footer Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative h-16 w-full max-w-[200px] rounded-md border border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                                        {headerFooterData.footerImage ? (
                                            <>
                                                <img src={headerFooterData.footerImage} alt="Footer" className="h-full w-full object-contain" />
                                                <button
                                                    onClick={() => setHeaderFooterData(prev => ({ ...prev, footerImage: "" }))}
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
                                        <Label htmlFor="footer-image" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 py-2">
                                            Upload Footer
                                        </Label>
                                        <Input
                                            id="footer-image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, 'footerImage')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact-info">Footer Contact Info</Label>
                                <Textarea
                                    id="contact-info"
                                    value={headerFooterData.contactInfo}
                                    onChange={(e) => setHeaderFooterData(prev => ({ ...prev, contactInfo: e.target.value }))}
                                    placeholder="Enter contact details for the footer..."
                                    rows={3}
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
