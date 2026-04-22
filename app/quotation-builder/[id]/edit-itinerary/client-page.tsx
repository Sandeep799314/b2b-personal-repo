"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { FixedGroupTourBuilder } from "@/components/fixed-group-tour-builder"
import { CartComboBuilder } from "@/components/cart-combo-builder"

import { HtmlEditorBuilder } from "@/components/html-editor-builder"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, RefreshCw } from "lucide-react"
import type { ItineraryType } from "@/components/itinerary-setup-modal"

interface QuotationResponse {
  _id: string
  itineraryId: string
  title: string
  pricingOptions: {
    markupType: "percentage" | "fixed"
    markupValue: number
    originalTotalPrice?: number
    finalTotalPrice?: number
  }
  isLocked?: boolean
}

interface ItineraryResponse {
  _id: string
  title: string
  type?: ItineraryType
}

interface QuotationItineraryEditPageProps {
  quotationId: string
}

export function QuotationItineraryEditPage({ quotationId }: QuotationItineraryEditPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [quotation, setQuotation] = useState<QuotationResponse | null>(null)
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const lastSyncRequest = useRef<number>(0)

  const itineraryType: ItineraryType = useMemo(() => {
    return itinerary?.type || "customized-package"
  }, [itinerary])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const quotationRes = await fetch(`/api/quotations/${quotationId}`)
        if (!quotationRes.ok) {
          throw new Error("Failed to load quotation")
        }
        const quotationData = (await quotationRes.json()) as QuotationResponse
        setQuotation(quotationData)

        if (quotationData.isLocked) {
          toast({
            title: "Quotation is locked",
            description: "Unlock the latest version before editing itinerary components.",
            variant: "destructive",
          })
          router.push(`/quotation-builder/${quotationId}`)
          return
        }

        if (!quotationData.itineraryId) {
          throw new Error("Linked itinerary was not found")
        }

        const itineraryRes = await fetch(`/api/itineraries/${quotationData.itineraryId}`)
        if (!itineraryRes.ok) {
          throw new Error("Failed to load itinerary data")
        }
        const itineraryData = (await itineraryRes.json()) as ItineraryResponse
        setItinerary(itineraryData)
      } catch (error) {
        console.error("Failed to load quotation itinerary editor:", error)
        toast({
          title: "Unable to open itinerary editor",
          description: error instanceof Error ? error.message : "Unexpected error occurred.",
          variant: "destructive",
        })
        router.push(`/quotation-builder/${quotationId}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [quotationId, router, toast])

  const handleSyncFromItinerary = useCallback(
    async (force = false): Promise<boolean> => {
      if (!quotation) return false

      const now = Date.now()
      if (!force && now - lastSyncRequest.current < 5000) {
        return true
      }
      lastSyncRequest.current = now

      setIsSyncing(true)
      try {
        const response = await fetch(
          `/api/quotations/${quotation._id}/sync-from-itinerary`,
          {
            method: "POST",
          },
        )

        if (!response.ok) {
          throw new Error("Sync request failed")
        }

        const payload = await response.json()
        if (payload?.quotation) {
          setQuotation(payload.quotation)
        }
        setLastSyncedAt(new Date())

        if (force) {
          toast({
            title: "Quotation updated",
            description: "Changes from the itinerary have been applied.",
          })
        }
        return true
      } catch (error) {
        console.error("Failed to sync quotation with itinerary:", error)
        toast({
          title: "Sync failed",
          description: "We could not update the quotation with the latest itinerary changes.",
          variant: "destructive",
        })
        return false
      } finally {
        setIsSyncing(false)
      }
    },
    [quotation, toast],
  )

  const handleReturnToQuotation = useCallback(async () => {
    const success = await handleSyncFromItinerary(true)
    if (success) {
      router.push(`/quotation-builder/${quotationId}`)
    }
  }, [handleSyncFromItinerary, quotationId, router])

  const handleCancel = useCallback(() => {
    router.push(`/quotation-builder/${quotationId}`)
  }, [quotationId, router])

  const renderBuilder = () => {
    if (!quotation?.itineraryId) {
      return (
        <Card className="mx-auto mt-20 max-w-xl">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              This quotation is not linked to an editable itinerary.
            </p>
            <Button className="mt-4" onClick={handleCancel}>
              Return to quotation
            </Button>
          </CardContent>
        </Card>
      )
    }

    const builderProps = {
      itineraryId: quotation.itineraryId,
      onBack: handleReturnToQuotation,
      onSave: async () => { await handleSyncFromItinerary(false) },
    }

    switch (itineraryType) {
      case "fixed-group-tour":
        return <FixedGroupTourBuilder {...builderProps} />
      case "cart-combo":
        return <CartComboBuilder {...builderProps} />
      case "html-editor":
        return <HtmlEditorBuilder {...builderProps} />
      case "customized-package":
      default:
        return <ItineraryBuilder {...builderProps} />
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Preparing the itinerary editor...
          </p>
        </div>
      </div>
    )
  }

  if (!quotation || !itinerary) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCancel}
                    disabled={isSyncing}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-xl font-semibold">Edit Itinerary Components</h1>
                    <p className="text-sm text-muted-foreground">
                      {`${itinerary.title || "Quotation itinerary"} - ${itineraryType.replace("-", " ")}`}
                    </p>
                  </div>
                </div>
                {lastSyncedAt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Last synced with quotation at {lastSyncedAt.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSyncFromItinerary(true)}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync changes"}
                </Button>
                <Button onClick={handleReturnToQuotation} disabled={isSyncing}>
                  Save & Return
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">{renderBuilder()}</div>
          </div>
        </main>
      </div>
    </div>
  )
}








