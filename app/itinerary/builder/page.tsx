"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { CartComboBuilder } from "@/components/cart-combo-builder"
import { HtmlEditorBuilder } from "@/components/html-editor-builder"
import { FixedGroupTourBuilder } from "@/components/fixed-group-tour-builder"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function ItineraryBuilderContent() {
  const [mounted, setMounted] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const builderRef = useRef<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const itineraryType = searchParams.get('type') || 'customized-package'
  const itineraryId = searchParams.get('id')

  useEffect(() => {
    setMounted(true)
  }, [])

  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

  // Handle browser tab closing or refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = "" // Standard way to show browser confirmation
      }
    }

    if (typeof window !== 'undefined') {
      (window as any).itineraryBuilderHasChanges = hasChanges
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    
    // Intercept custom navigation events from sidebar/header
    const handleNavigationAttempt = (e: any) => {
      if (hasChanges) {
        e.preventDefault()
        setPendingUrl(e.detail.url)
        setShowExitConfirm(true)
      }
    }
    window.addEventListener("itinerary-navigation-attempt", handleNavigationAttempt)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("itinerary-navigation-attempt", handleNavigationAttempt)
      if (typeof window !== 'undefined') {
        (window as any).itineraryBuilderHasChanges = false
      }
    }
  }, [hasChanges])

  const handleBack = () => {
    if (hasChanges) {
      setPendingUrl('/itinerary')
      setShowExitConfirm(true)
    } else {
      router.push('/itinerary')
    }
  }

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    setHasChanges(false)
    if (typeof window !== 'undefined') {
      (window as any).itineraryBuilderHasChanges = false
    }
    // Small delay to ensure state updates before navigation
    setTimeout(() => {
      router.push(pendingUrl || '/itinerary')
    }, 100)
  }

  const handleSaveAndExit = async () => {
    if (builderRef.current) {
      setIsSaving(true)
      try {
        await builderRef.current.save()
        setHasChanges(false)
        if (typeof window !== 'undefined') {
          (window as any).itineraryBuilderHasChanges = false
        }
        setShowExitConfirm(false)
        router.push(pendingUrl || '/itinerary')
      } catch (error) {
        console.error("Failed to save before exit:", error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Loading builder...</p>
          <p className="text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }

  // Route to appropriate builder based on type
  const renderContent = () => {
    switch (itineraryType) {
      case 'fixed-group-tour':
        return (
          <div className="flex-1 flex flex-col">
            <FixedGroupTourBuilder 
              itineraryId={itineraryId || undefined} 
              onBack={handleBack} 
              onHasChangesChange={setHasChanges}
            />
          </div>
        )

      case 'cart-combo':
        return (
          <div className="flex-1 flex flex-col">
            <CartComboBuilder itineraryId={itineraryId || undefined} onBack={handleBack} />
          </div>
        )

      case 'html-editor':
        return (
          <div className="flex-1 flex flex-col">
            <HtmlEditorBuilder itineraryId={itineraryId || undefined} onBack={handleBack} />
          </div>
        )

      case 'customized-package':
      default:
        return (
          <div className="flex-1 flex flex-col">
            <ItineraryBuilder 
              ref={builderRef}
              itineraryId={itineraryId || undefined} 
              onBack={handleBack} 
              onHasChangesChange={setHasChanges}
            />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Itineraries
          </button>
        </div>
      </div>
      {renderContent()}

      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-[450px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Unsaved Changes</DialogTitle>
            <DialogDescription className="text-base mt-2">
              You have unsaved changes in your itinerary. Do you want to save before leaving?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleSaveAndExit} 
              disabled={isSaving}
              className="w-full bg-[#2D7CEA] hover:bg-[#1e63c7] text-white py-6 text-lg font-semibold h-auto whitespace-normal"
            >
              {isSaving ? "Saving..." : "Save Itinerary & Exit"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleConfirmExit} 
              disabled={isSaving}
              className="w-full py-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-auto whitespace-normal"
            >
              Discard changes & Exit
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowExitConfirm(false)
                setPendingUrl(null)
              }} 
              disabled={isSaving}
              className="w-full py-2 text-gray-500"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ItineraryBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Loading builder...</p>
          <p className="text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    }>
      <ItineraryBuilderContent />
    </Suspense>
  )
}
