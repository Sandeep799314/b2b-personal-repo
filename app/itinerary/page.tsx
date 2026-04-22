"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { ItineraryList } from "@/components/itinerary-list"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { TopHeader } from "@/components/top-header"
import { ItinerarySetupModal } from "@/components/itinerary-setup-modal"
import { PreviewConfigModal, PreviewConfig } from "@/components/preview-config-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { IItinerary } from "@/models/Itinerary"

type ItineraryWithExtras = IItinerary & {
  additionalSections?: Record<string, string>
}

const formatGeneratedAt = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0")
  const month = date.toLocaleString("default", { month: "short" })
  const year = date.getFullYear().toString().slice(-2)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${day} ${month}' ${year} ${hours}:${minutes}`
}

function ItineraryPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const itineraryId = searchParams.get('id')
  const mode = searchParams.get('mode')
  const [currentView, setCurrentView] = useState<'list' | 'builder'>(
    mode === 'create' || mode === 'edit' ? 'builder' : 'list'
  )
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [previewItinerary, setPreviewItinerary] = useState<ItineraryWithExtras | null>(null)
  const [isPreviewConfigOpen, setIsPreviewConfigOpen] = useState(false)
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null)
  const [lastPreviewedId, setLastPreviewedId] = useState<string | null>(null)

  const handleCreateNew = () => {
    setShowSetupModal(true)
  }

  const launchPreviewForItinerary = useCallback(
    async (id: string) => {
      if (!id) {
        return
      }

      setPreviewLoadingId(id)
      try {
        const response = await fetch(`/api/itineraries/${id}`)
        if (!response.ok) {
          throw new Error(`Failed to load itinerary (${response.status})`)
        }

        const itineraryData = (await response.json()) as ItineraryWithExtras
        setPreviewItinerary(itineraryData)
        setIsPreviewConfigOpen(true)
      } catch (error) {
        console.error('Failed to load itinerary for preview:', error)
        toast({
          title: 'Preview unavailable',
          description: 'Could not load itinerary details. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setPreviewLoadingId(null)
        setLastPreviewedId(id)
      }
    },
    [toast],
  )

  const handleViewItinerary = async (id: string) => {
    // First, check what type of itinerary this is
    try {
      const response = await fetch(`/api/itineraries/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to load itinerary (${response.status})`)
      }

      const itineraryData = (await response.json()) as ItineraryWithExtras

      // If it's a cart/combo, open it in builder mode with preview shown
      if (itineraryData.type === 'cart-combo') {
        router.push(`/itinerary/builder?id=${id}&mode=view&type=cart-combo`)
        return
      }

      // Otherwise, use regular preview
      launchPreviewForItinerary(id)
    } catch (error) {
      console.error('Failed to load itinerary for preview:', error)
      // Fallback to regular preview if error
      launchPreviewForItinerary(id)
    }
  }

  const handleEditItinerary = (id: string) => {
    setCurrentView('builder')
    fetch(`/api/itineraries/${id}`)
      .then((res) => res.json())
      .then((itinerary) => {
        const type = itinerary.type || 'customized-package'
        router.push(`/itinerary/builder?id=${id}&mode=edit&type=${type}`)
      })
      .catch((err) => {
        console.error('Failed to fetch itinerary type:', err)
        router.push(`/itinerary/builder?id=${id}&mode=edit&type=customized-package`)
      })
  }

  const handleBack = () => {
    setCurrentView('list')
    router.push('/itinerary')
  }

  const handlePreviewClose = () => {
    setIsPreviewConfigOpen(false)
    setPreviewItinerary(null)
    setPreviewLoadingId(null)
    router.replace('/itinerary')
  }

  const handlePreviewConfirm = (config: PreviewConfig) => {
    if (!previewItinerary) {
      toast({
        title: 'Preview unavailable',
        description: 'No itinerary data available for preview.',
        variant: 'destructive',
      })
      return
    }

    try {
      const days = previewItinerary.days || []
      const totalPriceFromEvents = days.reduce((sum, day) => {
        const dayEvents = day.events || []
        const dayTotal = dayEvents.reduce((eventSum, event) => eventSum + (event.price || 0), 0)
        return sum + dayTotal
      }, 0)
      const totalNights = days.reduce((sum, day) => sum + (day.nights || 0), 0)

      if (previewItinerary._id) {
        const idString = previewItinerary._id.toString()
        localStorage.setItem("last-preview-itinerary-id", idString)
        localStorage.setItem("last-preview-itinerary-type", previewItinerary.type || "customized-package")
      }

      const previewData = {
        title: previewItinerary.title || 'Untitled Itinerary',
        description: previewItinerary.description || '',
        productId: previewItinerary.productId || '',
        country:
          previewItinerary.countries?.[0] ||
          previewItinerary.destination ||
          'Multiple Destinations',
        days,
        nights: totalNights,
        branding: previewItinerary.branding || {},
        totalPrice: totalPriceFromEvents || previewItinerary.totalPrice || 0,
        generatedAt: formatGeneratedAt(new Date()),
        additionalSections: previewItinerary.additionalSections || {},
        gallery: previewItinerary.gallery || [],
        previewConfig: config,
        itineraryId: previewItinerary._id ? previewItinerary._id.toString() : null,
        _id: previewItinerary._id ? previewItinerary._id.toString() : undefined,
        itineraryType: previewItinerary.type || 'customized-package',
      }

      localStorage.setItem('itinerary-preview', JSON.stringify(previewData))

      const previewWindow = window.open('/itinerary/preview', '_blank', 'noopener')
      if (!previewWindow) {
        router.push('/itinerary/preview')
      } else {
        previewWindow.focus()
      }

      toast({
        title: 'Preview Ready',
        description: 'Opening itinerary preview in a new tab.',
      })
    } catch (error) {
      console.error('Failed to generate preview:', error)
      toast({
        title: 'Preview failed',
        description: 'Could not generate the itinerary preview. Please try again.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    if (!itineraryId) {
      setLastPreviewedId(null)
      return
    }

    if (mode === 'edit' || mode === 'create') {
      return
    }

    if (previewLoadingId) {
      return
    }

    if (itineraryId !== lastPreviewedId) {
      launchPreviewForItinerary(itineraryId)
    }
  }, [itineraryId, mode, previewLoadingId, lastPreviewedId, launchPreviewForItinerary])

  const renderContent = () => {
    if (currentView === 'builder') {
      return <ItineraryBuilder itineraryId={itineraryId || undefined} onBack={handleBack} />
    }

    return (
      <ItineraryList
        onCreateNew={handleCreateNew}
        onViewItinerary={handleViewItinerary}
        onEditItinerary={handleEditItinerary}
        viewLoadingId={previewLoadingId}
      />
    )
  }

  const handleSetupModalClose = () => {
    setShowSetupModal(false)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-neutral-50 to-brand-primary-50/30 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />

        {/* Back to libraries when navigated from library */}
        {searchParams.get('from') === 'library' && (
          <div className="px-6 py-3 bg-white border-b">
            <Button variant="ghost" onClick={() => router.push('/library')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Libraries
            </Button>
          </div>
        )}

        <main className="flex-1 overflow-auto animate-fade-in">{renderContent()}</main>
      </div>
      <PreviewConfigModal
        isOpen={isPreviewConfigOpen}
        onClose={handlePreviewClose}
        onConfirm={handlePreviewConfirm}
      />
      <ItinerarySetupModal
        isOpen={showSetupModal}
        onClose={handleSetupModalClose}
      />
    </div>
  )
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ItineraryPageContent />
    </Suspense>
  )
}

