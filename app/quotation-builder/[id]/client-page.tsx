"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { saveQuotationVersion } from "@/hooks/use-save-quotation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"
import { QuotationPricingControls } from "@/components/quotation-pricing-controls"
import { QuotationClientEditor, ClientInfo } from "@/components/quotation-client-editor"
import { QuotationSettings, QuotationSettingsData } from "@/components/quotation-settings"
import { useQuotations, QuotationData } from "@/hooks/use-quotations"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Send, Printer, Download, Eye, EyeOff, Calculator, Percent, DollarSign, Lock, Pencil, History } from "lucide-react"
import { recalculateQuotationTotals } from "@/lib/pricing-utils"
import { convertCurrency, convertQuotationPrices, formatCurrencyWithSymbol } from "@/lib/currency-utils"
import { CurrencyConversion } from "@/components/currency-conversion"
import { VersionControl } from "@/components/version-control"
import { QuotationPricingOptions } from "@/models/Quotation"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ItineraryBuilder } from "@/components/itinerary-builder"
import { QuotationStatusStepper } from "@/components/quotation-status-stepper"
import { UserWallet } from "@/components/user-wallet"
import { Badge } from "@/components/ui/badge"

// Define interfaces for type safety
interface DayEvent {
  id: string
  time?: string
  category: string
  title: string
  description: string
  location?: string
  price?: number
  nights?: number
  [key: string]: any
}

interface Day {
  day: number
  title: string
  description?: string
  events: DayEvent[]
  [key: string]: any
}

// This is now a pure client component that receives the id directly
export function QuotationDetail({ id }: { id: string }) {
  const [quotation, setQuotation] = useState<QuotationData | null>(null)
  const [activeTab, setActiveTab] = useState("preview")
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false)
  const [showPrices, setShowPrices] = useState(true)
  const [displayCurrency, setDisplayCurrency] = useState<string>("")
  const [versionLocked, setVersionLocked] = useState<boolean>(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [displayData, setDisplayData] = useState<any>(null)

  const previewRef = useRef<HTMLDivElement | null>(null)

  const router = useRouter()
  const { fetchQuotation, updateQuotation, isLoading } = useQuotations()
  const { toast } = useToast()

  const syncQuotationState = (updated: QuotationData | null) => {
    if (!updated) {
      return null
    }
    setQuotation(updated)
    setVersionLocked(updated.isLocked || false)
    
    // Reset to latest version when synced
    setSelectedVersion(updated.currentVersion || 1)
    setIsReadOnly(false)
    setDisplayData(null) // Use main quotation data
    
    return updated
  }

  // Calculate total prices
  const recalculateTotals = (quotationData: QuotationData) => {
    // Calculate original total price from all events
    let originalTotal = 0;
    let hasEventPrices = false;

    // 1. Check days and events
    if (quotationData.days && quotationData.days.length > 0) {
      quotationData.days.forEach((day: Day) => {
        day.events.forEach((event: DayEvent) => {
          if (event.price) {
            originalTotal += parseFloat(event.price.toString());
            hasEventPrices = true;
          }
        });
      });
    }

    // 2. Check cartItems (for cart-combo type)
    if (quotationData.cartItems && quotationData.cartItems.length > 0) {
      quotationData.cartItems.forEach((item: any) => {
        if (item.price) {
          originalTotal += (parseFloat(item.price.toString()) * (item.quantity || 1));
          hasEventPrices = true;
        }
      });
    }

    // 3. Fallback to existing subtotal or originalTotalPrice if no individual prices found
    if (!hasEventPrices) {
      originalTotal = quotationData.subtotal || 
                      quotationData.pricingOptions?.originalTotalPrice || 
                      quotationData.totalPrice || 0;
    }

    // Create a quotation object with the calculated subtotal
    const quotationWithSubtotal = {
      ...quotationData,
      subtotal: originalTotal,
      pricingOptions: {
        ...quotationData.pricingOptions,
        originalTotalPrice: originalTotal
      }
    };

    // Use the shared utility to calculate all totals
    return recalculateQuotationTotals(quotationWithSubtotal);
  };

  // Fetch quotation data
  useEffect(() => {
    const loadQuotation = async () => {
      if (!id) return
      const data = await fetchQuotation(id)
      if (data) {
        // Calculate totals when loading the quotation
        const updatedData = recalculateTotals(data);
        setQuotation(updatedData)
        setShowPrices(updatedData.pricingOptions.showIndividualPrices)
        setSelectedVersion(updatedData.currentVersion || 1)
        setIsReadOnly(false)

        // Set initial display currency to the quotation's base currency
        setDisplayCurrency(updatedData.currency || "USD")

        // Check if the latest version is locked
        if (updatedData.versionHistory && updatedData.versionHistory.length > 0) {
          const latestVersion = updatedData.versionHistory[updatedData.versionHistory.length - 1]
          setVersionLocked(latestVersion.isLocked || false)
        } else {
          setVersionLocked(false)
        }

        // Also check the global lock status
        setVersionLocked(updatedData.isLocked || false)
      }
    }

    loadQuotation()
  }, [id, fetchQuotation])

  const handleVersionChange = (versionNumber: string) => {
    const v = parseInt(versionNumber)
    setSelectedVersion(v)
    
    if (v === quotation?.currentVersion) {
      setIsReadOnly(false)
      setDisplayData(null)
    } else {
      const version = quotation?.versionHistory?.find(vh => vh.versionNumber === v)
      if (version && version.state) {
        setIsReadOnly(true)
        setDisplayData(version.state)
      }
    }
  }

  // Use either displayData (from old version) or current quotation data
  const currentDays = displayData?.days || quotation?.days || []
  const currentPricing = displayData?.pricingOptions || quotation?.pricingOptions
  const currentSubtotal = displayData?.subtotal || quotation?.subtotal
  const currentTotal = displayData?.total || quotation?.total
  const currentTitle = displayData?.title || quotation?.title
  const currentDescription = displayData?.description || quotation?.description
  const currentCountries = displayData?.countries || quotation?.countries
  const currentProductReferenceCode = displayData?.productReferenceCode || quotation?.productReferenceCode
  const currentBranding = displayData?.branding || quotation?.branding
  const currentGallery = displayData?.gallery || quotation?.gallery
  const currentOverviewEvents = displayData?.overviewEvents || quotation?.overviewEvents
  const currentServiceSlots = displayData?.serviceSlots || quotation?.serviceSlots
  const currentNotes = displayData?.notes || quotation?.notes
  const currentHighlights = displayData?.highlights || quotation?.highlights
  const currentImages = displayData?.images || quotation?.images
  const currentType = displayData?.type || quotation?.type
  const currentCartItems = displayData?.cartItems || quotation?.cartItems
  const currentHtmlContent = displayData?.htmlContent || quotation?.htmlContent
  const currentHtmlBlocks = displayData?.htmlBlocks || quotation?.htmlBlocks
  const currentProductId = displayData?.productId || quotation?.productId

  const handleEditItinerary = () => {
    if (!quotation) return
    router.push(`/quotation-builder/${quotation._id}/edit-itinerary`)
  }

  // Handle pricing options change
  const handlePricingOptionsChange = async (options: any) => {
    if (!quotation) return

    try {
      const updatedQuotation = await updateQuotation(quotation._id!, {
        pricingOptions: {
          ...quotation.pricingOptions,
          ...options
        }
      })

      if (updatedQuotation) {
        const syncedQuotation = syncQuotationState(updatedQuotation)
        if (syncedQuotation) {
          setShowPrices(syncedQuotation.pricingOptions.showIndividualPrices)
        }
        toast({
          title: "Success",
          description: "Pricing options updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating pricing options:", error)
      toast({
        title: "Error",
        description: "Failed to update pricing options",
        variant: "destructive",
      })
    }
  }

  // Handle client info change
  const handleClientInfoChange = async (clientInfo: ClientInfo) => {
    if (!quotation) return

    try {
      const updatedQuotation = await updateQuotation(quotation._id!, {
        client: clientInfo
      })

      const syncedQuotation = syncQuotationState(updatedQuotation)
      if (syncedQuotation) {
        toast({
          title: "Success",
          description: "Client information updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating client info:", error)
      toast({
        title: "Error",
        description: "Failed to update client information",
        variant: "destructive",
      })
    }
  }

  // Handle settings change
  const handleSettingsChange = async (settings: QuotationSettingsData) => {
    if (!quotation) return

    try {
      const updatedQuotation = await updateQuotation(quotation._id!, {
        ...settings
      })

      const syncedQuotation = syncQuotationState(updatedQuotation)
      if (syncedQuotation) {
        toast({
          title: "Success",
          description: "Quotation settings updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating quotation settings:", error)
      toast({
        title: "Error",
        description: "Failed to update quotation settings",
        variant: "destructive",
      })
    }
  }

  // Handle go back
  const handleGoBack = () => {
    router.push('/dashboard')
  }

  // Handle PDF download
  const handleDownloadPdf = async () => {
    if (!quotation) return
    if (!previewRef.current) {
      toast({
        title: "Error",
        description: "Nothing to export yet. Please try again after the preview loads.",
        variant: "destructive"
      })
      return
    }
    if (!versionLocked) {
      toast({
        title: "Version Locked Required",
        description: "Lock the current version before generating a PDF.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGeneratingPdf(true)
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST")
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST")
        heightLeft -= pageHeight
      }

      const safeTitle =
        (quotation.title || "quotation")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "quotation"
      const versionLabel = quotation.currentVersion ? `-v${quotation.currentVersion}` : ""

      pdf.save(`${safeTitle}${versionLabel}.pdf`)

      toast({
        title: "PDF Ready",
        description: "Quotation downloaded successfully."
      })
    } catch (error) {
      console.error("Error generating quotation PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate quotation PDF",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Toggle price visibility
  const togglePriceVisibility = async () => {
    if (!quotation) return

    try {
      await handlePricingOptionsChange({
        showIndividualPrices: !showPrices
      })
    } catch (error) {
      console.error("Error toggling price visibility:", error)
    }
  }

  // Handle currency conversion settings change
  const handleCurrencyChange = async (currencySettings: any) => {
    if (!quotation) return

    try {
      const updatedQuotation = await updateQuotation(quotation._id!, {
        currencySettings
      })

      const syncedQuotation = syncQuotationState(updatedQuotation)
      if (syncedQuotation) {
        toast({
          title: "Success",
          description: "Currency settings updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating currency settings:", error)
      toast({
        title: "Error",
        description: "Failed to update currency settings",
        variant: "destructive",
      })
    }
  }

  // Handle display currency change
  const handleDisplayCurrencyChange = (currency: string) => {
    setDisplayCurrency(currency)
  }

  // Handle version control
  const handleCreateVersion = async (versionData: { notes: string }) => {
    if (!quotation) return

    try {
      // Create a new version with the current state - convert notes to description
      const response = await fetch(`/api/quotations/${quotation._id}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: versionData.notes }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create new version')
      }

      const updatedQuotation = await response.json()
      syncQuotationState(updatedQuotation)
      // Reset version lock since this is a new version
      setVersionLocked(false)
      toast({
        title: "Success",
        description: "New version created successfully",
      })
    } catch (error) {
      console.error("Error creating version:", error)
      toast({
        title: "Error",
        description: "Failed to create new version",
        variant: "destructive",
      })
    }
  }

  // Handle version locking
  const handleLockVersion = async (versionId: string) => {
    if (!quotation) return

    const parsedVersion = Number(versionId)
    if (Number.isNaN(parsedVersion)) {
      toast({
        title: "Error",
        description: "Invalid version number",
        variant: "destructive"
      })
      return
    }

    try {
      // Lock the specified version
      const response = await fetch(`/api/quotations/${quotation._id}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          versionNumber: parsedVersion,
          userName: quotation.lastUpdatedBy
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to lock version')
      }

      const updatedQuotation = await response.json()
      syncQuotationState(updatedQuotation)
      setVersionLocked(true)
      toast({
        title: "Success",
        description: "Version locked successfully",
      })
    } catch (error) {
      console.error("Error locking version:", error)
      toast({
        title: "Error",
        description: "Failed to lock version",
        variant: "destructive",
      })
    }
  }

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!quotation) return
    try {
      const updatedQuotation = await updateQuotation(quotation._id!, { status: newStatus as any })
      if (updatedQuotation) {
        syncQuotationState(updatedQuotation)
        toast({
          title: "Status Updated",
          description: `Quotation marked as ${newStatus}`,
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  // Render loading state
  if (isLoading || !quotation) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopHeader />
        <div className="flex flex-1">
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-5xl">
              <Card>
                <CardContent className="p-8 text-center">
                  <p>Loading quotation details, please wait...</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Render using ItineraryBuilder in quotation mode
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader showWallet={false} />
        <main className="flex-1 overflow-hidden flex flex-col">
          {quotation && (
            <>
              <div className="px-6 pt-4 pb-2 bg-white border-b flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => router.push('/quotation-builder')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="h-6 w-px bg-neutral-200" />
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                      {quotation.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-neutral-500">Version:</span>
                      <Select value={selectedVersion?.toString()} onValueChange={handleVersionChange}>
                        <SelectTrigger className="h-7 w-[100px] text-xs">
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                        <SelectContent>
                          {quotation.versionHistory?.map((v) => (
                            <SelectItem key={v.versionNumber} value={v.versionNumber.toString()}>
                              V{v.versionNumber} {v.versionNumber === quotation.currentVersion ? '(Current)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isReadOnly && <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">Read Only</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-px bg-neutral-200" />
                  <QuotationStatusStepper
                    currentStatus={quotation.status}
                    onStatusChange={handleStatusChange}
                    disabled={isReadOnly || (versionLocked && quotation.status !== 'draft')}
                  />
                </div>
              </div>
              <ItineraryBuilder
                itineraryId={quotation.itineraryId}
                quotationId={quotation._id}
                mode="quotation"
                readOnly={isReadOnly}
                initialDays={currentDays}
                initialPricingOptions={currentPricing}
                initialTitle={currentTitle}
                initialDescription={currentDescription}
                initialCountries={currentCountries}
                initialProductReferenceCode={currentProductReferenceCode}
                initialBranding={currentBranding}
                initialGallery={currentGallery}
                initialOverviewEvents={currentOverviewEvents}
                initialServiceSlots={currentServiceSlots}
                initialNotes={currentNotes}
                initialHighlights={currentHighlights}
                initialImages={currentImages}
                initialType={currentType}
                initialCartItems={currentCartItems}
                initialHtmlContent={currentHtmlContent}
                initialHtmlBlocks={currentHtmlBlocks}
                hideWallet={true}
                onBack={() => router.push('/dashboard')}
                onSave={async (data?: any) => {
                  console.log('[QUOTATION SAVE] onSave triggered with data:', data);

                  if (data && data.quotationOptions && data.days) {
                    try {
                      // Construct a temporary quotation to recalculate totals
                      const tempQuotation = {
                        ...quotation,
                        ...data,
                        pricingOptions: data.quotationOptions
                      };

                      const recalculated = recalculateTotals(tempQuotation);

                      // Construct the payload with ALL fields from data
                      const payload = {
                        ...data,
                        pricingOptions: recalculated.pricingOptions,
                        subtotal: recalculated.subtotal,
                        markup: recalculated.markup,
                        total: recalculated.total,
                        client: quotation.client,
                        currencySettings: quotation.currencySettings,
                        notes: data.notes || quotation.notes,
                        title: data.title || quotation.title,
                        description: data.description || quotation.description,
                        validUntil: quotation.validUntil,
                        totalPrice: recalculated.price || recalculated.total
                      };

                      const updatedQuotation = await saveQuotationVersion(quotation._id!, payload);
                      syncQuotationState(updatedQuotation);

                      toast({
                        title: "Success",
                        description: "New version created successfully"
                      });
                    } catch (error) {
                      console.error('[QUOTATION SAVE] Error during save:', error);
                      toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : "Failed to save quotation",
                        variant: "destructive"
                      });
                    }
                  }
                }}
                extraActions={
                  <Button variant="outline" size="icon" onClick={() => setIsVersionHistoryOpen(true)} title="Version History">
                    <History className="h-4 w-4" />
                  </Button>
                }
              />
              <Dialog open={isVersionHistoryOpen} onOpenChange={setIsVersionHistoryOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  {quotation && (
                    <VersionControl
                      versionHistory={quotation.versionHistory || []}
                      currentVersion={quotation.currentVersion || 1}
                      isLocked={versionLocked}
                      isDraft={quotation.isDraft || false}
                      onCreateVersion={(desc) => handleCreateVersion({ notes: desc })}
                      onLockVersion={() => {
                        if (quotation.versionHistory && quotation.versionHistory.length > 0) {
                          const latest = quotation.versionHistory[quotation.versionHistory.length - 1];
                          return handleLockVersion(latest.versionNumber.toString());
                        }
                        return Promise.resolve();
                      }}
                      onSaveVersion={async () => {
                        toast({ title: "Info", description: "Please use the main Save button in the builder to save changes." });
                        return Promise.resolve();
                      }}
                      onViewVersion={async (versionNumber) => {
                        try {
                          setIsVersionHistoryOpen(false);

                          // Call API to restore the version
                          const response = await fetch(`/api/quotations/${id}/versions/${versionNumber}`, {
                            method: 'PUT'
                          });

                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || 'Failed to restore version');
                          }

                          const restoredQuotation = await response.json();

                          // Update local state with restored data
                          const updatedData = recalculateTotals(restoredQuotation);
                          setQuotation(updatedData);
                          setShowPrices(updatedData.pricingOptions.showIndividualPrices);
                          setDisplayCurrency(updatedData.currency || "USD");

                          // Update version lock status
                          setVersionLocked(restoredQuotation.isLocked || false);

                          toast({
                            title: "Success",
                            description: `Restored to version ${versionNumber}. Quotation is now in draft mode.`
                          });

                          // Reload the page to show restored data in ItineraryBuilder
                          window.location.reload();
                        } catch (error) {
                          console.error('Error restoring version:', error);
                          toast({
                            title: "Error",
                            description: error instanceof Error ? error.message : "Failed to restore version",
                            variant: "destructive"
                          });
                        }
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
