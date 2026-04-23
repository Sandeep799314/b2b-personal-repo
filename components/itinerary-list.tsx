"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, MapPin, Clock, Edit, Package, ShoppingCart, FileText, Users, DollarSign, Share2, Copy, FileDigit, Loader2, Trash2 } from "lucide-react"
import { IItinerary } from "@/models/Itinerary"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useQuotations } from "@/hooks/use-quotations"
import { getAuthHeaders } from "@/lib/client-auth"

interface ItineraryListProps {
  onCreateNew: () => void
  onViewItinerary: (id: string) => void
  onEditItinerary: (id: string) => void
  onShareItinerary?: (id: string) => void
  viewLoadingId?: string | null
}

const TYPE_CONFIG = {
  "fixed-group-tour": {
    label: "Fixed Group Tour",
    icon: Calendar,
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
  "customized-package": {
    label: "Customized Package",
    icon: Package,
    color: "bg-green-50 border-green-200 text-green-800",
  },
  "cart-combo": {
    label: "Cart/Combo",
    icon: ShoppingCart,
    color: "bg-purple-50 border-purple-200 text-purple-800",
  },
  "html-editor": {
    label: "HTML Editor",
    icon: FileText,
    color: "bg-orange-50 border-orange-200 text-orange-800",
  },
}

export function ItineraryList({ onCreateNew, onViewItinerary, onEditItinerary, onShareItinerary, viewLoadingId }: ItineraryListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [itineraries, setItineraries] = useState<IItinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItinerary, setSelectedItinerary] = useState<IItinerary | null>(null)
  const [clientInfo, setClientInfo] = useState({ name: "", email: "", phone: "", referenceNo: "", notes: "" })
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itineraryToDelete, setItineraryToDelete] = useState<IItinerary | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectForQuotation = searchParams.get("selectForQuotation") === "true"
  const { convertItineraryToQuotation, isLoading: isConverting } = useQuotations()

  // Load itineraries
  useEffect(() => {
    const loadItineraries = async () => {
      try {
        const authHeaders = await getAuthHeaders()
        const res = await fetch("/api/itineraries", {
          headers: authHeaders,
        })
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        if (Array.isArray(data?.data)) {
          setItineraries(data.data)
        } else if (Array.isArray(data)) {
          setItineraries(data)
        } else {
          console.error("Unexpected data format:", data)
          setItineraries([])
        }
      } catch (err) {
        console.error("Failed to fetch itineraries:", err)
        setItineraries([])
      } finally {
        setLoading(false)
      }
    }

    loadItineraries()
  }, [])

  const createQuickShare = async (itinerary: IItinerary) => {
    try {
      const response = await fetch("/api/shares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: `${itinerary.title} - Public Share`,
          description: itinerary.description,
          shareType: "individual",
          itineraryId: itinerary._id,
          settings: {
            allowComments: false,
            showPricing: true,
            showContactInfo: true
          }
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create share")
      }

      const result = await response.json()
      const shareUrl = result.publicUrl

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)

      toast({
        title: "Share Link Created",
        description: "Public share link copied to clipboard!"
      })
    } catch (err) {
      console.error("Error creating quick share:", err)
      toast({
        title: "Share Failed",
        description: "Failed to create share link. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleItinerarySelect = (itinerary: IItinerary) => {
    if (selectForQuotation) {
      setSelectedItinerary(itinerary)
      setConvertDialogOpen(true)
    } else {
      onViewItinerary(itinerary._id!)
    }
  }

  const handleClientInfoChange = (field: string, value: string) => {
    setClientInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleConvertToQuotation = async () => {
    if (!selectedItinerary || !selectedItinerary._id) return

    try {
      const quotationId = await convertItineraryToQuotation(
        selectedItinerary._id,
        clientInfo
      )

      if (quotationId) {
        setConvertDialogOpen(false)
        setSelectedItinerary(null)
        router.push(`/quotation-builder/${quotationId}`)
      }
    } catch (error) {
      console.error("Failed to convert itinerary to quotation:", error)
      toast({
        title: "Conversion Failed",
        description: "Could not convert itinerary to quotation.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteClick = (itinerary: IItinerary) => {
    setItineraryToDelete(itinerary)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itineraryToDelete || !itineraryToDelete._id) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/itineraries/${itineraryToDelete._id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete itinerary")
      }

      // Update the itineraries list by removing the deleted item
      setItineraries(prevItineraries =>
        prevItineraries.filter(item => item._id !== itineraryToDelete._id)
      )

      toast({
        title: "Itinerary Deleted",
        description: `"${itineraryToDelete.title}" has been deleted successfully.`
      })

      setDeleteDialogOpen(false)
      setItineraryToDelete(null)
    } catch (error) {
      console.error("Error deleting itinerary:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete itinerary. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredItineraries = itineraries.filter(itinerary =>
    itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    itinerary.destination.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium">Loading itineraries...</p>
          <p className="text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{selectForQuotation ? "Select Itinerary for Quotation" : "Itineraries"}</h2>
          <p className="text-sm text-gray-500">
            {selectForQuotation
              ? "Select an itinerary to convert to a quotation"
              : "Create and manage your travel itineraries"}
          </p>
        </div>
        {!selectForQuotation ? (
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Itinerary
          </Button>
        ) : (
          <Button variant="outline" onClick={() => router.push("/quotation-builder")}>
            Cancel
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search itineraries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItineraries.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium">No itineraries found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first itinerary
            </p>
            <Button onClick={onCreateNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create New Itinerary
            </Button>
          </div>
        ) : (
          filteredItineraries.map((itinerary) => {
            const itineraryType = itinerary.type || "customized-package"
            const typeConfig = TYPE_CONFIG[itineraryType as keyof typeof TYPE_CONFIG] || TYPE_CONFIG["customized-package"]
            const TypeIcon = typeConfig.icon
            const isViewing = itinerary._id ? viewLoadingId === itinerary._id : false

            // Find first image
            const firstImage = itinerary.gallery && itinerary.gallery.find(item => item.type === "image")

            return (
              <Card
                key={itinerary._id}
                className="hover:shadow-md transition-shadow h-full flex flex-col overflow-hidden group border-neutral-200"
              >
                {/* Preview Photo or Placeholder */}
                <div className="h-32 w-full bg-gray-100 relative overflow-hidden shrink-0">
                  {firstImage ? (
                    <img
                      src={firstImage.url}
                      alt={firstImage.altText || itinerary.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${typeConfig.color} bg-opacity-20`}>
                      <TypeIcon className="h-10 w-10 opacity-20" />
                    </div>
                  )}
                  {/* Overlay Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className={`${typeConfig.color} shadow-sm border text-[10px] px-1.5 py-0`}>
                      <TypeIcon className="h-2.5 w-2.5 mr-1" />
                      {typeConfig.label}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-3 pb-0">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-semibold line-clamp-1" title={itinerary.title}>
                      {itinerary.title}
                    </CardTitle>
                    <CardDescription className="flex items-center text-[11px] text-gray-500">
                      <MapPin className="mr-1 h-2.5 w-2.5 shrink-0" />
                      <span className="line-clamp-1">{itinerary.destination || "Multiple Destinations"}</span>
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-3 pt-2">
                  <div className="space-y-2 flex-1">
                    {/* Duration and Price */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        <Clock className="mr-1 h-3 w-3" />
                        {itinerary.duration}
                      </div>
                      {itinerary.totalPrice > 0 && (
                        <div className="flex items-center text-brand-700 font-bold bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: itinerary.currency || 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(itinerary.totalPrice)}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                      {itinerary.description || "No description available."}
                    </p>

                    {/* Metadata Section */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto text-[10px] text-gray-400">
                      {itinerary.productReferenceCode ? (
                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[9px]">{itinerary.productReferenceCode}</span>
                      ) : (
                        <span></span>
                      )}
                      <span>
                        {new Date(itinerary.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-gray-100">
                    {selectForQuotation ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium"
                        onClick={() => handleItinerarySelect(itinerary)}
                      >
                        <FileDigit className="h-3 w-3 mr-1.5" />
                        Select
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-[11px] hover:bg-brand-50"
                          onClick={() => onViewItinerary(itinerary._id!)}
                          disabled={isViewing}
                        >
                          {isViewing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "View"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-[11px] hover:bg-blue-50"
                          onClick={() => onEditItinerary(itinerary._id!)}
                        >
                          Edit
                        </Button>
                        <div className="flex gap-0.5 border-l border-gray-100 pl-1 ml-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-brand-600"
                            onClick={() => createQuickShare(itinerary)}
                            title="Share"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-red-600"
                            onClick={() => handleDeleteClick(itinerary)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Quotation from Itinerary</DialogTitle>
            <DialogDescription>
              Enter client information to create a quotation from the selected itinerary.
              You'll be able to adjust pricing options on the next screen.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={clientInfo.name}
                onChange={(e) => handleClientInfoChange("name", e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={clientInfo.email}
                onChange={(e) => handleClientInfoChange("email", e.target.value)}
                placeholder="client@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                value={clientInfo.phone}
                onChange={(e) => handleClientInfoChange("phone", e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="referenceNo">Reference No. (Optional)</Label>
              <Input
                id="referenceNo"
                value={clientInfo.referenceNo}
                onChange={(e) => handleClientInfoChange("referenceNo", e.target.value)}
                placeholder="QT-12345"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={clientInfo.notes}
                onChange={(e) => handleClientInfoChange("notes", e.target.value)}
                placeholder="Any special requirements or notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConvertToQuotation}
              disabled={!clientInfo.name || isConverting}
            >
              {isConverting ? "Converting..." : "Create Quotation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Itinerary</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itineraryToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
