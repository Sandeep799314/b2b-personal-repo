"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, MapPin, Clock, Edit, Package, ShoppingCart, FileText, Users, DollarSign, Share2, Copy, FileDigit, Loader2, Trash2, MoreVertical, Eye, Sun, Moon, History, X } from "lucide-react"
import { IItinerary } from "@/models/Itinerary"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useQuotations } from "@/hooks/use-quotations"
import { getAuthHeaders } from "@/lib/client-auth"
import { getDefaultImageByString } from "@/lib/constants"

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
  const [menuView, setMenuView] = useState<Record<string, 'options' | 'logs'>>({})
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectForQuotation = searchParams.get("selectForQuotation") === "true"
  const { convertItineraryToQuotation, isLoading: isConverting } = useQuotations()

  const formatLogDate = (dateInput: Date | string) => {
    const d = new Date(dateInput)
    const day = d.getDate().toString().padStart(2, "0")
    const month = d.toLocaleString("en-US", { month: "short" })
    const year = d.getFullYear()
    const hours = d.getHours().toString().padStart(2, "0")
    const minutes = d.getMinutes().toString().padStart(2, "0")
    return `${day}-${month}-${year} : ${hours}:${minutes} hrs`
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
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
            const displayImage = firstImage?.url || getDefaultImageByString(itinerary._id || "")
            const currentMenuView = menuView[itinerary._id!] || 'options'
            const isExpanded = expandedDescriptions[itinerary._id!] || false

            const daysCount = itinerary.days?.length || (parseInt(itinerary.duration) || 0)
            const nightsCount = (itinerary.days?.reduce((acc, day) => acc + (day.nights || 0), 0)) || 
                               Math.max(0, (itinerary.days?.length || (parseInt(itinerary.duration) || 1)) - 1)

            return (
              <Card
                key={itinerary._id}
                className="hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group border-neutral-200 hover:border-brand-200"
              >
                {/* Image Section */}
                <div className="h-36 w-full bg-neutral-100 relative overflow-hidden shrink-0">
                  <img
                    src={displayImage}
                    alt={firstImage?.altText || itinerary.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className={`${typeConfig.color} shadow-sm border-none text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-md bg-opacity-90`}>
                      <TypeIcon className="h-3 w-3 mr-1.5" />
                      {typeConfig.label}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <CardTitle className="text-base font-bold text-neutral-900 line-clamp-1 group-hover:text-brand-700 transition-colors" title={itinerary.title}>
                        {itinerary.title}
                      </CardTitle>
                      <div className="flex items-center text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                        <MapPin className="mr-1 h-3 w-3" />
                        {itinerary.destination || "Multiple Destinations"}
                      </div>
                    </div>
                    {!selectForQuotation && (
                      <DropdownMenu onOpenChange={(open) => {
                        if (!open) {
                          // Small delay to prevent layout shift during animation
                          setTimeout(() => setMenuView(prev => ({ ...prev, [itinerary._id!]: 'options' })), 200)
                        }
                      }}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-neutral-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={currentMenuView === 'logs' ? "w-64 p-3" : "w-48"}>
                          {currentMenuView === 'options' ? (
                            <>
                              <DropdownMenuItem onClick={() => onViewItinerary(itinerary._id!)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Itinerary
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEditItinerary(itinerary._id!)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Itinerary
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => createQuickShare(itinerary)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Link
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={(e) => {
                                e.preventDefault()
                                setMenuView(prev => ({ ...prev, [itinerary._id!]: 'logs' }))
                              }}>
                                <History className="mr-2 h-4 w-4" />
                                Logs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(itinerary)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-xs font-bold flex items-center gap-1.5 text-neutral-900">
                                  <History className="h-3.5 w-3.5 text-brand-600" />
                                  Audit Logs
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setMenuView(prev => ({ ...prev, [itinerary._id!]: 'options' }))
                                  }}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              
                              <div className="space-y-3 text-[11px]">
                                <div className="space-y-1">
                                  <p className="font-semibold text-neutral-700">Created</p>
                                  <div className="flex flex-col text-neutral-500">
                                    <span className="truncate">By: {itinerary.createdByUser || "System"}</span>
                                    <span className="text-neutral-400">
                                      {formatLogDate(itinerary.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-semibold text-neutral-700">Last Updated</p>
                                  <div className="flex flex-col text-neutral-500">
                                    <span className="truncate">By: {itinerary.lastUpdatedBy || itinerary.createdByUser || "System"}</span>
                                    <span className="text-neutral-400">
                                      {formatLogDate(itinerary.updatedAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-4 pt-0">
                  <div className="space-y-3 flex-1 flex flex-col">
                    {/* Metadata Row */}
                    <div className="flex items-center justify-between min-h-[24px]">
                      <div className="flex items-center gap-2">
                        {itinerary.productReferenceCode && (
                          <div className="text-[9px] font-bold text-brand-600 bg-brand-50/50 px-1.5 py-0.5 rounded border border-brand-100/50 uppercase tracking-wide w-fit">
                            {itinerary.productReferenceCode}
                          </div>
                        )}

                        <div className="flex items-center gap-1 bg-neutral-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-neutral-700 w-fit">
                          <Sun className="h-2.5 w-2.5 text-amber-500" />
                          <span>{daysCount}D</span>
                          <span className="text-neutral-300">|</span>
                          <Moon className="h-2.5 w-2.5 text-blue-500" />
                          <span>{nightsCount}N</span>
                        </div>
                      </div>

                      {/* Highlights/Tags */}
                      <div className="flex items-center gap-1 overflow-hidden">
                        {itinerary.highlights?.slice(0, 2).map((highlight, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="text-[8px] px-1.5 py-0 h-4 bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase tracking-tight whitespace-nowrap"
                          >
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Description and Price Row */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className={`${isExpanded ? "min-h-0" : "h-[40px]"} overflow-hidden transition-all duration-300`}>
                          <p className={`text-[12px] text-neutral-600 leading-[1.6] font-medium ${isExpanded ? "" : "line-clamp-2"}`}>
                            {itinerary.description || "Experience a meticulously planned journey featuring handpicked accommodations and exclusive activities."}
                          </p>
                        </div>
                        {(itinerary.description?.length || 0) > 100 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedDescriptions(prev => ({ ...prev, [itinerary._id!]: !isExpanded }));
                            }}
                            className="text-[11px] font-bold text-brand-600 hover:text-brand-700 mt-1 flex items-center gap-0.5 group/btn"
                          >
                            <span>{isExpanded ? "See less" : "See more"}</span>
                            <div className={`h-1 w-1 rounded-full bg-brand-400 transition-transform ${isExpanded ? "scale-150" : "group-hover/btn:scale-150"}`} />
                          </button>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-end">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-[0.1em] mb-0.5">Total Cost</span>
                        <div className="text-2xl font-black text-neutral-900 tracking-tighter leading-none">
                          {itinerary.totalPrice > 0 ? (
                            new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: itinerary.currency || 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(itinerary.totalPrice)
                          ) : (
                            <span className="text-neutral-300 font-medium text-base">On Request</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions and Footer */}
                    <div className="mt-auto pt-3 border-t border-neutral-100">
                      {selectForQuotation ? (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm transition-all active:scale-[0.98]"
                          onClick={() => handleItinerarySelect(itinerary)}
                        >
                          Create Quotation
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-brand-600 h-9 transition-colors"
                              onClick={() => onViewItinerary(itinerary._id!)}
                              disabled={isViewing}
                              title="View Itinerary"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-brand-600 h-9 transition-colors"
                              onClick={() => onEditItinerary(itinerary._id!)}
                              title="Edit Itinerary"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-brand-600 h-9 transition-colors"
                              onClick={() => createQuickShare(itinerary)}
                              title="Quick Share"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-[9px] text-neutral-400 font-medium flex items-center justify-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            Updated {formatLogDate(itinerary.updatedAt)}
                          </div>
                        </div>
                      )}
                    </div>
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
