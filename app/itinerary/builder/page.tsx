"use client"

import { useEffect, useState, Suspense } from "react"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { CartComboBuilder } from "@/components/cart-combo-builder"
import { HtmlEditorBuilder } from "@/components/html-editor-builder"
import { FixedGroupTourBuilder } from "@/components/fixed-group-tour-builder"
import { useRouter, useSearchParams } from "next/navigation"

function ItineraryBuilderContent() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const itineraryType = searchParams.get('type') || 'customized-package'
  const itineraryId = searchParams.get('id')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleBack = () => {
    router.push('/itinerary')
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
            <FixedGroupTourBuilder itineraryId={itineraryId || undefined} onBack={handleBack} />
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
            <ItineraryBuilder itineraryId={itineraryId || undefined} onBack={handleBack} />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/itinerary')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Itineraries
          </button>
        </div>
      </div>
      {renderContent()}
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
