"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Share2,
  Eye,
  Copy,
  Trash2,
  Edit,
  Calendar,
  Lock,
  Unlock,
  ExternalLink,
  Plus,
  Loader2,
  Settings,
  Percent,
  Upload
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IPublicShare } from "@/models/PublicShare"
import { IItinerary } from "@/models/Itinerary"

interface ShareWithItineraries extends IPublicShare {
  itinerary?: IItinerary
  itineraries?: IItinerary[]
}

interface CreateShareModalProps {
  isOpen: boolean
  onClose: () => void
  onShareCreated: (share: ShareWithItineraries) => void
  onShareUpdated?: (share: ShareWithItineraries) => void
  availableItineraries: IItinerary[]
  initialShare?: ShareWithItineraries | null
}

function CreateShareModal({ isOpen, onClose, onShareCreated, onShareUpdated, availableItineraries, initialShare }: CreateShareModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shareType: "individual" as "individual" | "collection",
    itineraryId: "",
    itineraryIds: [] as string[],
    expiresAt: "",
    expiryMessage: "", // Custom message when link expires
    passwordProtected: false,
    password: "",
    settings: {
      allowComments: false,
      showPricing: true,
      showContactInfo: true,
      customBranding: {
        companyName: "",
        contactEmail: "",
        contactPhone: "",
        primaryColor: "#000000",
        logo: "",
        heroImage: "",
        instagram: "",
        whatsapp: "",
        facebook: "",
        youtube: "",
        website: "",
        twitter: ""
      }
    },
    // Global pricing markup options (used for individual shares)
    pricingOptions: {
      markupType: "percentage" as "percentage" | "fixed",
      markupValue: 0,
      showOriginalPrice: false,
      strikethroughMarkupType: "percentage" as "percentage" | "fixed",
      strikethroughMarkupValue: 0,
      showIndividualPricing: true,
      pricingCurrency: "INR"
    },
    // Per-itinerary pricing for collection shares
    perItineraryPricing: [] as Array<{
      itineraryId: string
      markupType: "percentage" | "fixed"
      markupValue: number
      showOriginalPrice: boolean
      strikethroughMarkupType: "percentage" | "fixed"
      strikethroughMarkupValue: number
    }>,
    globalEnquireLink: "",
    perItinerarySettings: [] as Array<{
      itineraryId: string
      enquireLink: string
    }>
  })
  const [creating, setCreating] = useState(false)
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const heroImageInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingHero(true)
    const file = files[0]

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Validate file size (7MB limit)
      if (file.size > 7 * 1024 * 1024) {
        throw new Error('Image is too large. Maximum size is 7MB')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()

      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          customBranding: {
            ...prev.settings.customBranding,
            heroImage: result.url
          }
        }
      }))

      toast({
        title: "Image Uploaded",
        description: "Hero image uploaded successfully",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploadingHero(false)
      if (heroImageInputRef.current) {
        heroImageInputRef.current.value = ''
      }
    }
  }

  // Populate form when editing
  useEffect(() => {
    if (initialShare) {
      console.log('Loading initial share data:', initialShare)
      console.log('Social media from initial share:', initialShare.settings?.customBranding)

      setFormData({
        title: initialShare.title,
        description: initialShare.description || "",
        shareType: initialShare.shareType,
        itineraryId: initialShare.shareType === "individual" ? ((initialShare.itineraryId as any)?._id || initialShare.itineraryId || (initialShare.itinerary as any)?._id || "") : "",
        itineraryIds: initialShare.shareType === "collection" ? ((initialShare.itineraryIds as any[])?.map((i: any) => i._id || i) || (initialShare.itineraries as any[])?.map((i: any) => i._id || i) || []) : [],
        expiresAt: initialShare.expiresAt ? new Date(initialShare.expiresAt).toISOString().slice(0, 16) : "",
        expiryMessage: initialShare.expiryMessage || "",
        passwordProtected: initialShare.passwordProtected || false,
        password: initialShare.password || "",
        settings: {
          allowComments: initialShare.settings?.allowComments || false,
          showPricing: initialShare.settings?.showPricing ?? true,
          showContactInfo: initialShare.settings?.showContactInfo ?? true,
          customBranding: {
            companyName: initialShare.settings?.customBranding?.companyName || "",
            contactEmail: initialShare.settings?.customBranding?.contactEmail || "",
            contactPhone: initialShare.settings?.customBranding?.contactPhone || "",
            primaryColor: initialShare.settings?.customBranding?.primaryColor || "#000000",
            logo: initialShare.settings?.customBranding?.logo || "",
            heroImage: initialShare.settings?.customBranding?.heroImage || "",
            instagram: initialShare.settings?.customBranding?.instagram || "",
            whatsapp: initialShare.settings?.customBranding?.whatsapp || "",
            facebook: initialShare.settings?.customBranding?.facebook || "",
            youtube: initialShare.settings?.customBranding?.youtube || "",
            website: initialShare.settings?.customBranding?.website || "",
            twitter: initialShare.settings?.customBranding?.twitter || ""
          }
        },
        pricingOptions: {
          markupType: initialShare.pricingOptions?.markupType || "percentage",
          markupValue: initialShare.pricingOptions?.markupValue || 0,
          showOriginalPrice: initialShare.pricingOptions?.showOriginalPrice || false,
          strikethroughMarkupType: initialShare.pricingOptions?.strikethroughMarkupType || "percentage",
          strikethroughMarkupValue: initialShare.pricingOptions?.strikethroughMarkupValue || 0,
          showIndividualPricing: initialShare.pricingOptions?.showIndividualPricing ?? true,
          pricingCurrency: initialShare.pricingOptions?.pricingCurrency || "INR"
        },
        perItineraryPricing: initialShare.perItineraryPricing?.map(p => ({
          ...p,
          strikethroughMarkupType: p.strikethroughMarkupType || "percentage",
          strikethroughMarkupValue: p.strikethroughMarkupValue || 0
        })) || [],
        globalEnquireLink: initialShare.globalEnquireLink || "",
        perItinerarySettings: initialShare.shareType === "collection"
          ? ((initialShare.itineraryIds || initialShare.itineraries) as any[])?.map((i: any) => {
            const id = i._id || i
            const existing = initialShare.perItinerarySettings?.find(s => (s.itineraryId as any)?._id === id || s.itineraryId === id)
            return {
              itineraryId: id,
              enquireLink: existing?.enquireLink || ""
            }
          }) || []
          : []
      })
    }
  }, [initialShare])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your share",
        variant: "destructive"
      })
      return
    }

    if (formData.shareType === "individual" && !formData.itineraryId) {
      toast({
        title: "Itinerary Required",
        description: "Please select an itinerary to share",
        variant: "destructive"
      })
      return
    }

    if (formData.shareType === "collection" && formData.itineraryIds.length === 0) {
      toast({
        title: "Itineraries Required",
        description: "Please select at least one itinerary for the collection",
        variant: "destructive"
      })
      return
    }

    try {
      setCreating(true)

      const isEditing = !!initialShare
      const url = isEditing ? `/api/shares/${initialShare.shareId}` : "/api/shares"
      const method = isEditing ? "PUT" : "POST"

      console.log('Submitting form data:', formData)
      console.log('Social media being sent:', formData.settings.customBranding)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${isEditing ? 'update' : 'create'} share`)
      }

      const result = await response.json()

      if (isEditing && onShareUpdated) {
        onShareUpdated(result.share)
      } else {
        onShareCreated(result.share)
      }

      onClose()

      toast({
        title: isEditing ? "Weblink Updated" : "Weblink Created",
        description: `Your ${formData.shareType} share has been ${isEditing ? 'updated' : 'created'} successfully!`
      })

      // Reset form only if creating (not editing)
      if (!isEditing) {
        setFormData({
          title: "",
          description: "",
          shareType: "individual",
          itineraryId: "",
          itineraryIds: [],
          expiresAt: "",
          expiryMessage: "",
          passwordProtected: false,
          password: "",
          settings: {
            allowComments: false,
            showPricing: true,
            showContactInfo: true,
            customBranding: {
              companyName: "",
              contactEmail: "",
              contactPhone: "",
              primaryColor: "",
              logo: "",
              heroImage: "",
              instagram: "",
              whatsapp: "",
              facebook: "",
              youtube: "",
              website: "",
              twitter: ""
            }
          },
          pricingOptions: {
            markupType: "percentage",
            markupValue: 0,
            showOriginalPrice: false,
            strikethroughMarkupType: "percentage",
            strikethroughMarkupValue: 0,
            showIndividualPricing: true,
            pricingCurrency: "INR"
          },
          perItineraryPricing: [],
          globalEnquireLink: "",
          perItinerarySettings: []
        })
      }
    } catch (err) {
      console.error(`Error ${initialShare ? 'updating' : 'creating'} share:`, err)
      toast({
        title: initialShare ? "Update Failed" : "Creation Failed",
        description: err instanceof Error ? err.message : `Failed to ${initialShare ? 'update' : 'create'} share`,
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleItineraryToggle = (itineraryId: string, checked: boolean) => {
    setFormData(prev => {
      // Prevent duplicates in itineraryIds
      const newItineraryIds = checked
        ? prev.itineraryIds.includes(itineraryId)
          ? prev.itineraryIds
          : [...prev.itineraryIds, itineraryId]
        : prev.itineraryIds.filter(id => id !== itineraryId)

      // Also update perItineraryPricing - check for existing entry to prevent duplicates
      const alreadyExists = prev.perItineraryPricing.some(p => p.itineraryId === itineraryId)
      const newPerItineraryPricing = checked
        ? alreadyExists
          ? prev.perItineraryPricing
          : [...prev.perItineraryPricing, {
            itineraryId,
            markupType: "percentage" as "percentage" | "fixed",
            markupValue: 0,
            showOriginalPrice: false,
            strikethroughMarkupType: "percentage" as "percentage" | "fixed",
            strikethroughMarkupValue: 0
          }]
        : prev.perItineraryPricing.filter(p => p.itineraryId !== itineraryId)

      // Also update perItinerarySettings
      const alreadyExistsSettings = prev.perItinerarySettings.some(s => s.itineraryId === itineraryId)
      const newPerItinerarySettings = checked
        ? alreadyExistsSettings
          ? prev.perItinerarySettings
          : [...prev.perItinerarySettings, {
            itineraryId,
            enquireLink: ""
          }]
        : prev.perItinerarySettings.filter(s => s.itineraryId !== itineraryId)

      return {
        ...prev,
        itineraryIds: newItineraryIds,
        perItineraryPricing: newPerItineraryPricing,
        perItinerarySettings: newPerItinerarySettings
      }
    })
  }

  // Update per-itinerary pricing
  const updatePerItineraryPricing = (itineraryId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      perItineraryPricing: prev.perItineraryPricing.map(p =>
        p.itineraryId === itineraryId ? { ...p, [field]: value } : p
      )
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialShare ? 'Edit Weblink' : 'Create Weblink'}</DialogTitle>
          <DialogDescription className="sr-only">
            Configure options for sharing itineraries
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter share title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for your share"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="shareType">Share Type</Label>
              <Select
                value={formData.shareType}
                onValueChange={(value: "individual" | "collection") =>
                  setFormData(prev => ({ ...prev, shareType: value, itineraryId: "", itineraryIds: [] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Itinerary</SelectItem>
                  <SelectItem value="collection">Collection of Itineraries</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Itinerary Selection */}
          <div className="space-y-4">
            {formData.shareType === "individual" ? (
              <div>
                <Label htmlFor="itinerary">Select Itinerary *</Label>
                <Select
                  value={formData.itineraryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, itineraryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an itinerary" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItineraries.map((itinerary) => (
                      <SelectItem key={itinerary._id} value={itinerary._id!}>
                        {itinerary.title} ({itinerary.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Select Itineraries for Collection *</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {availableItineraries.map((itinerary) => (
                    <div key={itinerary._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={itinerary._id}
                        checked={formData.itineraryIds.includes(itinerary._id!)}
                        onCheckedChange={(checked) =>
                          handleItineraryToggle(itinerary._id!, checked as boolean)
                        }
                      />
                      <label htmlFor={itinerary._id} className="text-sm flex-1 cursor-pointer">
                        {itinerary.title} ({itinerary.type})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security & Expiration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="password-protected"
                checked={formData.passwordProtected}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, passwordProtected: checked, password: checked ? prev.password : "" }))
                }
              />
              <Label htmlFor="password-protected">Password Protected</Label>
            </div>

            {formData.passwordProtected && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
            )}

            <div>
              <Label htmlFor="expires">Expiration Date (Optional)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>

            {formData.expiresAt && (
              <div>
                <Label htmlFor="expiry-message">Expiry Message (Optional)</Label>
                <Textarea
                  id="expiry-message"
                  value={formData.expiryMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryMessage: e.target.value }))}
                  placeholder="Custom message to show when this weblink expires (e.g., 'This offer has expired. Please contact us for updated pricing.')"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be displayed when someone tries to access an expired weblink
                </p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Share Settings</h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-pricing"
                  checked={formData.settings.showPricing}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showPricing: checked }
                    }))
                  }
                />
                <Label htmlFor="show-pricing">Show Pricing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-contact"
                  checked={formData.settings.showContactInfo}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, showContactInfo: checked }
                    }))
                  }
                />
                <Label htmlFor="show-contact">Show Contact Information</Label>
              </div>
            </div>

            {/* Markup Options - Only show if pricing is enabled AND not a collection share with itineraries selected */}
            {formData.settings.showPricing && !(formData.shareType === "collection" && formData.itineraryIds.length > 0) && (
              <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-amber-600" />
                  <h5 className="font-medium text-sm text-amber-800">Price Markup Options</h5>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="markup-type" className="text-sm">Markup Type</Label>
                    <Select
                      value={formData.pricingOptions.markupType}
                      onValueChange={(value: "percentage" | "fixed") =>
                        setFormData(prev => ({
                          ...prev,
                          pricingOptions: { ...prev.pricingOptions, markupType: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="markup-value" className="text-sm">
                      {formData.pricingOptions.markupType === "percentage" ? "Markup %" : "Fixed Amount"}
                    </Label>
                    <Input
                      id="markup-value"
                      type="number"
                      min="0"
                      step={formData.pricingOptions.markupType === "percentage" ? "0.1" : "1"}
                      value={formData.pricingOptions.markupValue}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          pricingOptions: { ...prev.pricingOptions, markupValue: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      placeholder={formData.pricingOptions.markupType === "percentage" ? "e.g., 10" : "e.g., 500"}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-original-price"
                    checked={formData.pricingOptions.showOriginalPrice}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        pricingOptions: { ...prev.pricingOptions, showOriginalPrice: checked }
                      }))
                    }
                  />
                  <Label htmlFor="show-original-price" className="text-sm">
                    Show strikethrough price (higher than selling price)
                  </Label>
                </div>

                {/* Strikethrough Markup - only show when showOriginalPrice is enabled */}
                {formData.pricingOptions.showOriginalPrice && (
                  <div className="ml-6 p-3 bg-amber-100 rounded border border-amber-300 space-y-3">
                    <p className="text-xs text-amber-700">
                      Set an additional markup to create a higher &quot;was&quot; price. This is applied on top of the selling price.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Strikethrough Markup Type</Label>
                        <Select
                          value={formData.pricingOptions.strikethroughMarkupType}
                          onValueChange={(value: "percentage" | "fixed") =>
                            setFormData(prev => ({
                              ...prev,
                              pricingOptions: { ...prev.pricingOptions, strikethroughMarkupType: value }
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">
                          {formData.pricingOptions.strikethroughMarkupType === "percentage" ? "%" : "Amount"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step={formData.pricingOptions.strikethroughMarkupType === "percentage" ? "0.1" : "1"}
                          value={formData.pricingOptions.strikethroughMarkupValue}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              pricingOptions: { ...prev.pricingOptions, strikethroughMarkupValue: parseFloat(e.target.value) || 0 }
                            }))
                          }
                          className="h-8 text-xs"
                          placeholder={formData.pricingOptions.strikethroughMarkupType === "percentage" ? "e.g., 20" : "e.g., 2000"}
                        />
                      </div>
                    </div>
                    {formData.pricingOptions.strikethroughMarkupValue > 0 && (
                      <p className="text-xs text-amber-800 italic">
                        Example: If selling price is ₹11,000, strikethrough will show{" "}
                        {formData.pricingOptions.strikethroughMarkupType === "percentage"
                          ? `₹${(11000 * (1 + formData.pricingOptions.strikethroughMarkupValue / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : `₹${(11000 + formData.pricingOptions.strikethroughMarkupValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        }
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-individual-pricing"
                    checked={formData.pricingOptions.showIndividualPricing}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        pricingOptions: { ...prev.pricingOptions, showIndividualPricing: checked }
                      }))
                    }
                  />
                  <Label htmlFor="show-individual-pricing" className="text-sm">
                    Show individual event prices
                  </Label>
                </div>

                <div>
                  <Label htmlFor="pricing-currency" className="text-sm">Display Currency</Label>
                  <Select
                    value={formData.pricingOptions.pricingCurrency}
                    onValueChange={(value) =>
                      setFormData(prev => ({
                        ...prev,
                        pricingOptions: { ...prev.pricingOptions, pricingCurrency: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                      <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                      <SelectItem value="GBP">£ GBP (British Pound)</SelectItem>
                      <SelectItem value="AED">د.إ AED (UAE Dirham)</SelectItem>
                      <SelectItem value="SGD">S$ SGD (Singapore Dollar)</SelectItem>
                      <SelectItem value="AUD">A$ AUD (Australian Dollar)</SelectItem>
                      <SelectItem value="CAD">C$ CAD (Canadian Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.pricingOptions.markupValue > 0 && (
                  <p className="text-xs text-amber-700">
                    {formData.pricingOptions.markupType === "percentage"
                      ? `Prices will be increased by ${formData.pricingOptions.markupValue}%`
                      : `A fixed amount will be added to the total price`}
                  </p>
                )}
              </div>
            )}

            {/* Per-Itinerary Markup - Only for collection shares with pricing enabled */}
            {formData.settings.showPricing && formData.shareType === "collection" && formData.itineraryIds.length > 0 && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  <h5 className="font-medium text-sm text-blue-800">Per-Itinerary Markup</h5>
                </div>
                <p className="text-xs text-blue-600 mb-3">
                  Set different markup for each itinerary in the collection. This overrides the global markup above.
                </p>

                <div className="space-y-4">
                  {formData.perItineraryPricing.map((pricing) => {
                    const itinerary = availableItineraries.find(i => i._id === pricing.itineraryId)
                    if (!itinerary) return null
                    return (
                      <div key={pricing.itineraryId} className="p-3 bg-white rounded border border-blue-100">
                        <p className="font-medium text-sm mb-2">{itinerary.title}</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Markup Type</Label>
                            <Select
                              value={pricing.markupType}
                              onValueChange={(value: "percentage" | "fixed") =>
                                updatePerItineraryPricing(pricing.itineraryId, "markupType", value)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">
                              {pricing.markupType === "percentage" ? "%" : "Amount"}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step={pricing.markupType === "percentage" ? "0.1" : "1"}
                              value={pricing.markupValue}
                              onChange={(e) =>
                                updatePerItineraryPricing(pricing.itineraryId, "markupValue", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center space-x-1">
                              <Switch
                                id={`show-original-${pricing.itineraryId}`}
                                checked={pricing.showOriginalPrice}
                                onCheckedChange={(checked) =>
                                  updatePerItineraryPricing(pricing.itineraryId, "showOriginalPrice", checked)
                                }
                              />
                              <Label htmlFor={`show-original-${pricing.itineraryId}`} className="text-xs">
                                Strikethrough
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Strikethrough Markup for this itinerary */}
                        {pricing.showOriginalPrice && (
                          <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200 space-y-2">
                            <p className="text-xs text-amber-700">
                              Strikethrough markup (applied on top of selling price):
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Type</Label>
                                <Select
                                  value={pricing.strikethroughMarkupType || "percentage"}
                                  onValueChange={(value: "percentage" | "fixed") =>
                                    updatePerItineraryPricing(pricing.itineraryId, "strikethroughMarkupType", value)
                                  }
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">%</SelectItem>
                                    <SelectItem value="fixed">Fixed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Value</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step={(pricing.strikethroughMarkupType || "percentage") === "percentage" ? "0.1" : "1"}
                                  value={pricing.strikethroughMarkupValue || 0}
                                  onChange={(e) =>
                                    updatePerItineraryPricing(pricing.itineraryId, "strikethroughMarkupValue", parseFloat(e.target.value) || 0)
                                  }
                                  className="h-7 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Custom Branding */}
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Custom Branding (Optional)</h5>

              {/* Hero Image Upload */}
              <div className="space-y-2">
                <Label>Hero Image (Optional)</Label>
                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                  <input
                    ref={heroImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className="hidden"
                  />

                  {formData.settings.customBranding.heroImage ? (
                    <div className="relative aspect-video w-full max-w-sm mx-auto rounded-md overflow-hidden bg-gray-100 group">
                      <img
                        src={formData.settings.customBranding.heroImage}
                        alt="Hero"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => heroImageInputRef.current?.click()}
                        >
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <Upload className="h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Click to upload hero image</p>
                      <p className="text-xs text-gray-500 mb-3">Recommended size: 1920x1080px (Max 7MB)</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => heroImageInputRef.current?.click()}
                        disabled={isUploadingHero}
                      >
                        {isUploadingHero ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Select Image"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="company-name" className="text-sm">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.settings.customBranding.companyName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        customBranding: {
                          ...prev.settings.customBranding,
                          companyName: e.target.value
                        }
                      }
                    }))}
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
                  <Input
                    id="primary-color"
                    type="color"
                    value={formData.settings.customBranding.primaryColor}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        customBranding: {
                          ...prev.settings.customBranding,
                          primaryColor: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact-email" className="text-sm">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.settings.customBranding.contactEmail}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      customBranding: {
                        ...prev.settings.customBranding,
                        contactEmail: e.target.value
                      }
                    }
                  }))}
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <Label htmlFor="contact-phone" className="text-sm">Contact Phone</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={formData.settings.customBranding.contactPhone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      customBranding: {
                        ...prev.settings.customBranding,
                        contactPhone: e.target.value
                      }
                    }
                  }))}
                  placeholder="+1 234 567 8900"
                />
              </div>

              {/* Social Media Links */}
              <div className="col-span-2 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-sm mb-3 text-gray-700">Social Media Links (Optional)</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="instagram" className="text-xs flex items-center gap-1">
                      <span className="text-pink-600">●</span> Instagram
                    </Label>
                    <Input
                      id="instagram"
                      type="url"
                      value={formData.settings.customBranding.instagram || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          customBranding: {
                            ...prev.settings.customBranding,
                            instagram: e.target.value
                          }
                        }
                      }))}
                      placeholder="https://instagram.com/yourcompany"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp" className="text-xs flex items-center gap-1">
                      <span className="text-green-600">●</span> WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={formData.settings.customBranding.whatsapp || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          customBranding: {
                            ...prev.settings.customBranding,
                            whatsapp: e.target.value
                          }
                        }
                      }))}
                      placeholder="+1234567890"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="facebook" className="text-xs flex items-center gap-1">
                      <span className="text-blue-600">●</span> Facebook
                    </Label>
                    <Input
                      id="facebook"
                      type="url"
                      value={formData.settings.customBranding.facebook || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          customBranding: {
                            ...prev.settings.customBranding,
                            facebook: e.target.value
                          }
                        }
                      }))}
                      placeholder="https://facebook.com/yourcompany"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter" className="text-xs flex items-center gap-1">
                      <span className="text-gray-900">●</span> X (Twitter)
                    </Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={formData.settings.customBranding.twitter || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          customBranding: {
                            ...prev.settings.customBranding,
                            twitter: e.target.value
                          }
                        }
                      }))}
                      placeholder="https://x.com/yourcompany"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="youtube" className="text-xs flex items-center gap-1">
                      <span className="text-red-600">●</span> YouTube
                    </Label>
                    <Input
                      id="youtube"
                      type="url"
                      value={formData.settings.customBranding.youtube || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          customBranding: {
                            ...prev.settings.customBranding,
                            youtube: e.target.value
                          }
                        }
                      }))}
                      placeholder="https://youtube.com/@yourcompany"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-xs flex items-center gap-1">
                      <span className="text-indigo-600">●</span> Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.settings.customBranding.website || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          customBranding: {
                            ...prev.settings.customBranding,
                            website: e.target.value
                          }
                        }
                      }))}
                      placeholder="https://yourcompany.com"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enquire Now Link Configuration */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium">Enquiry Options</h4>
            <div>
              <Label htmlFor="global-enquire">Global Enquire Link (Optional)</Label>
              <Input
                id="global-enquire"
                value={formData.globalEnquireLink}
                onChange={(e) => setFormData(prev => ({ ...prev, globalEnquireLink: e.target.value }))}
                placeholder="e.g., https://wa.me/1234567890 or https://forms.google.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Adds an "Enquire Now" button to the top right of the weblink
              </p>
            </div>

            {/* Per-Itinerary Links - Only for collection shares with itineraries selected */}
            {formData.shareType === "collection" && formData.itineraryIds.length > 0 && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h5 className="font-medium text-sm">Itinerary Specific Enquiry Links</h5>
                <p className="text-xs text-gray-600 mb-3">
                  Add specific enquiry links for each itinerary. If left empty, no button will be shown on the itinerary card.
                </p>

                <div className="space-y-4">
                  {formData.perItinerarySettings.map((setting) => {
                    const itinerary = availableItineraries.find(i => i._id === setting.itineraryId)
                    if (!itinerary) return null
                    return (
                      <div key={setting.itineraryId}>
                        <Label className="text-xs mb-1 block">{itinerary.title}</Label>
                        <Input
                          value={setting.enquireLink}
                          onChange={(e) => {
                            // Update per-itinerary settings inline since helper might not be available or clean to use inside map callback in this context if not defined
                            const newVal = e.target.value
                            setFormData(prev => ({
                              ...prev,
                              perItinerarySettings: prev.perItinerarySettings.map(s =>
                                s.itineraryId === setting.itineraryId ? { ...s, enquireLink: newVal } : s
                              )
                            }))
                          }}
                          placeholder="Specific enquiry form link..."
                          className="text-sm"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {initialShare ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {initialShare ? "Update Weblink" : "Create Weblink"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ShareManagementProps {
  availableItineraries: IItinerary[]
}

export default function ShareManagement({ availableItineraries }: ShareManagementProps) {
  const [shares, setShares] = useState<ShareWithItineraries[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingShare, setEditingShare] = useState<ShareWithItineraries | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchShares()
  }, [])

  const fetchShares = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/shares?createdBy=current-user") // TODO: Get from auth

      if (!response.ok) {
        throw new Error("Failed to fetch shares")
      }

      const data = await response.json()
      setShares(data.shares || [])
    } catch (err) {
      console.error("Error fetching shares:", err)
      toast({
        title: "Failed to Load",
        description: "Could not load your shares. Please refresh and try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper to generate URL-friendly slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Get share URL (use slug if available, otherwise generate from title)
  const getShareUrl = (share: any) => {
    const slug = share.slug || generateSlug(share.title)
    return `${window.location.origin}/weblinks/${slug}`
  }

  const copyShareLink = async (share: any) => {
    const url = getShareUrl(share)
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard!"
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive"
      })
    }
  }

  const deleteShare = async (shareId: string) => {
    if (!confirm("Are you sure you want to delete this share? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/shares/${shareId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete share")
      }

      setShares(prev => prev.filter(share => share.shareId !== shareId))
      toast({
        title: "Share Deleted",
        description: "Share has been successfully deleted."
      })
    } catch (err) {
      console.error("Error deleting share:", err)
      toast({
        title: "Delete Failed",
        description: "Failed to delete share. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toggleShareStatus = async (shareId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/shares/${shareId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) {
        throw new Error("Failed to update share")
      }

      setShares(prev => prev.map(share =>
        share.shareId === shareId
          ? { ...share, isActive: !isActive }
          : share
      ))

      toast({
        title: "Share Updated",
        description: `Share has been ${!isActive ? 'activated' : 'deactivated'}.`
      })
    } catch (err) {
      console.error("Error updating share:", err)
      toast({
        title: "Update Failed",
        description: "Failed to update share status.",
        variant: "destructive"
      })
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString()
  }

  const getTypeColor = (type: string) => {
    const colors = {
      "fixed-group-tour": "bg-blue-100 text-blue-800",
      "customized-package": "bg-green-100 text-green-800",
      "cart-combo": "bg-purple-100 text-purple-800",
      "html-editor": "bg-orange-100 text-orange-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Share Management</h2>
          <p className="text-gray-600">Create and manage public links for your itineraries</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Weblink
        </Button>
      </div>

      {/* Shares List */}
      {shares.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No shares created yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first public share to start sharing your itineraries with the world.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Share
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {shares.map((share) => (
            <Card key={share.shareId} className={`${!share.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{share.title}</h3>
                      <Badge variant={share.shareType === "individual" ? "default" : "secondary"}>
                        {share.shareType}
                      </Badge>
                      {share.passwordProtected && (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          Protected
                        </Badge>
                      )}
                      {!share.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                      {/* Markup Badge */}
                      {share.pricingOptions && share.pricingOptions.markupValue > 0 && (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          <Percent className="h-3 w-3 mr-1" />
                          {share.pricingOptions.markupType === "percentage"
                            ? `+${share.pricingOptions.markupValue}%`
                            : `+${share.pricingOptions.markupValue} fixed`}
                        </Badge>
                      )}
                    </div>

                    {share.description && (
                      <p className="text-gray-600 mb-3">{share.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {share.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {formatDate(share.createdAt)}
                      </span>
                      {share.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Expires {formatDate(share.expiresAt)}
                        </span>
                      )}
                    </div>

                    {/* Itinerary Preview */}
                    <div className="space-y-2">
                      {share.shareType === "individual" && share.itinerary ? (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{share.itinerary.title}</span>
                          <Badge className={getTypeColor(share.itinerary.type)} variant="secondary">
                            {share.itinerary.type}
                          </Badge>
                        </div>
                      ) : share.shareType === "collection" && share.itineraries ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Collection of {share.itineraries.length} itineraries:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {share.itineraries.slice(0, 3).map((itinerary, idx) => (
                              <Badge key={idx} className={getTypeColor(itinerary.type)} variant="outline">
                                {itinerary.title}
                              </Badge>
                            ))}
                            {share.itineraries.length > 3 && (
                              <Badge variant="outline">
                                +{share.itineraries.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyShareLink(share)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingShare(share)}
                      title="Edit share"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const slug = share.slug || (share.title?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim())
                        window.open(`/weblinks/${slug}`, '_blank')
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShareStatus(share.shareId, share.isActive)}
                    >
                      {share.isActive ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteShare(share.shareId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Share Modal */}
      <CreateShareModal
        isOpen={showCreateModal || !!editingShare}
        onClose={() => {
          setShowCreateModal(false)
          setEditingShare(null)
        }}
        onShareCreated={(newShare) => {
          setShares(prev => [newShare, ...prev])
        }}
        onShareUpdated={(updatedShare) => {
          setShares(prev => prev.map(share =>
            share.shareId === updatedShare.shareId ? updatedShare : share
          ))
        }}
        availableItineraries={availableItineraries}
        initialShare={editingShare}
      />
    </div>
  )
}
