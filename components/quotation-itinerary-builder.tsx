"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { FixedGroupTourBuilder } from "@/components/fixed-group-tour-builder"
import { CartComboBuilder } from "@/components/cart-combo-builder"
import { HtmlEditorBuilder } from "@/components/html-editor-builder"
import { useItineraries } from "@/hooks/use-itineraries"
import { useQuotations } from "@/hooks/use-quotations"
import { useToast } from "@/hooks/use-toast"
import type { ItinerarySetupResult } from "@/components/itinerary-setup-modal"

interface QuotationItineraryBuilderProps {
  leadData: {
    name: string
    leadDate?: string
    leadReferenceNo?: string
    remarks: string
    contactDetails?: string
  }
  onBack: () => void
  setupConfig: ItinerarySetupResult
}

export function QuotationItineraryBuilder({ leadData, onBack, setupConfig }: QuotationItineraryBuilderProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createdItineraryId, setCreatedItineraryId] = useState<string | null>(null)
  const { createItinerary } = useItineraries()
  const { convertItineraryToQuotation } = useQuotations()
  const { toast } = useToast()
  const router = useRouter()

  // Handle when user completes building the itinerary
  const handleCompleteAndCreateQuotation = async () => {
    if (!createdItineraryId) {
      toast({
        title: "Error",
        description: "Please save your itinerary first before creating quotation.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      // Convert the itinerary to a quotation
      const quotationId = await convertItineraryToQuotation(
        createdItineraryId,
        {
          name: leadData.name,
          email: leadData.contactDetails || "",
          phone: "",
          referenceNo: leadData.leadReferenceNo || "",
          notes: leadData.remarks || "",
        }
      )

      if (quotationId) {
        toast({
          title: "Success",
          description: "Itinerary converted to quotation successfully!",
        })
        router.push(`/quotation-builder/${quotationId}`)
      }
    } catch (error) {
      console.error("Error converting itinerary to quotation:", error)
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} disabled={isCreating}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">Create Itinerary for Quotation</h1>
            <p className="text-sm text-gray-500">
              Build an itinerary for {leadData.name} that will be converted to a quotation
            </p>
          </div>
        </div>
        
        {createdItineraryId && (
          <Button 
            onClick={handleCompleteAndCreateQuotation}
            disabled={isCreating}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? "Creating Quotation..." : "Complete & Create Quotation"}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
      <QuotationItineraryBuilderContent
        leadData={leadData}
        setupConfig={setupConfig}
        onItineraryCreated={setCreatedItineraryId}
        onSaveRequested={async () => {
          // This will be called when the itinerary is saved
          console.log("[DEBUG] Itinerary saved, ready for quotation conversion")
        }}
        />
      </div>
    </div>
  )
}

type QuotationLeadData = QuotationItineraryBuilderProps["leadData"]

// Internal component that uses the full ItineraryBuilder with quotation-specific setup
function QuotationItineraryBuilderContent({ 
  leadData,
  setupConfig,
  onItineraryCreated,
  onSaveRequested
}: { 
  leadData: QuotationLeadData
  setupConfig: ItinerarySetupResult
  onItineraryCreated: (id: string) => void
  onSaveRequested?: () => Promise<void>
}) {
  const [tempItineraryId, setTempItineraryId] = useState<string | null>(null)
  const { createItinerary } = useItineraries()
  const { toast } = useToast()

  const initialItineraryData = useMemo(() => {
    const toISODate = (date: Date) => date.toISOString().split("T")[0]

    const createDayEntries = (count: number, startDate?: string) => {
      const baseDate = startDate ? new Date(startDate) : new Date()

      return Array.from({ length: count }, (_, index) => {
        const currentDate = new Date(baseDate)
        currentDate.setDate(baseDate.getDate() + index)

        return {
          day: index + 1,
          date: toISODate(currentDate),
          title: `Day ${index + 1}`,
          description: "",
          detailedDescription: "",
          events: [],
          nights: index < count - 1 ? 1 : 0,
          meals: {
            breakfast: false,
            lunch: false,
            dinner: false,
          },
        }
      })
    }

    const trimmedName = setupConfig.name.trim()
    const trimmedDescription = setupConfig.description?.trim()
    const trimmedDestination = setupConfig.destination?.trim()
    const defaultDestination = (() => {
      switch (setupConfig.itineraryType) {
        case "cart-combo":
          return "Multiple Destinations"
        case "html-editor":
          return "Custom"
        default:
          return "Enter destination"
      }
    })()

    const baseItinerary: Record<string, any> = {
      productId: setupConfig.productId,
      title: trimmedName || `${leadData.name}'s Itinerary`,
      description: trimmedDescription || leadData.remarks || "Itinerary created for quotation",
      destination: trimmedDestination || defaultDestination,
      duration: "1 Day",
      currency: "USD",
      totalPrice: 0,

      type: setupConfig.itineraryType,
      createdBy: "agent-user",
      countries: [],
      days: [] as any[],
      highlights: [],
      images: [],
      gallery: [],
      isQuotationOnly: true,
      quotationLead: leadData,
    }

    switch (setupConfig.itineraryType) {
      case "fixed-group-tour": {
        const startDate = setupConfig.startDate || toISODate(new Date())
        const endDate = setupConfig.endDate || startDate
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffMs = end.getTime() - start.getTime()
        const calculatedDays = isNaN(diffMs) ? 0 : Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const dayCount = Math.max(1, calculatedDays + 1)

        baseItinerary.duration = `${dayCount} day${dayCount > 1 ? "s" : ""}`
        baseItinerary.days = createDayEntries(dayCount, startDate)
        baseItinerary.fixedDates = {
          startDate,
          endDate,
          availableDates: [],
          currentBookings: 0,
          ...(setupConfig.maxParticipants && setupConfig.maxParticipants > 0
            ? { maxParticipants: setupConfig.maxParticipants }
            : {}),
        }
        break
      }
      case "cart-combo": {
        baseItinerary.destination = trimmedDestination || "Multiple Destinations"
        baseItinerary.duration = "Variable"
        baseItinerary.days = []
        baseItinerary.cartItems = []
        break
      }
      case "html-editor": {
        const durationLabel =
          setupConfig.days && setupConfig.days > 0 ? `${setupConfig.days} day${setupConfig.days > 1 ? "s" : ""}` : "Variable"
        baseItinerary.destination = trimmedDestination || "Custom"
        baseItinerary.duration = durationLabel
        baseItinerary.days = []
        baseItinerary.htmlBlocks = []
        baseItinerary.htmlContent = ""
        break
      }
      case "customized-package":
      default: {
        const dayCount = setupConfig.days && setupConfig.days > 0 ? setupConfig.days : 1
        baseItinerary.duration = `${dayCount} day${dayCount > 1 ? "s" : ""}`
        baseItinerary.days = createDayEntries(dayCount)
        break
      }
    }

    return baseItinerary
  }, [leadData, setupConfig])

  // Create a temporary itinerary for the builder to work with
  useEffect(() => {
    console.log("[DEBUG] QuotationItineraryBuilderContent useEffect triggered")
    const initializeItinerary = async () => {
      try {
        console.log("[DEBUG] Initializing temporary itinerary for quotation")
        const initialData = initialItineraryData

        const result = await createItinerary(initialData)
        if (result && result._id) {
          console.log("[DEBUG] Temporary itinerary created with ID:", result._id)
          setTempItineraryId(result._id)
          onItineraryCreated(result._id)
        }
      } catch (error) {
        console.error("Error creating temporary itinerary:", error)
        toast({
          title: "Error",
          description: "Failed to initialize itinerary builder",
          variant: "destructive",
        })
      }
    }

    if (!tempItineraryId) {
      initializeItinerary()
    }
  }, [createItinerary, initialItineraryData, onItineraryCreated, tempItineraryId, toast])

  // Custom onBack handler that doesn't navigate away
  const handleBack = () => {
    // Don't navigate back from here - the parent component handles this
    return
  }

  if (!tempItineraryId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Initializing Itinerary Builder...</p>
          <p className="text-sm text-gray-500">Setting up your workspace</p>
        </div>
      </div>
    )
  }

  const renderBuilderByType = () => {
    switch (setupConfig.itineraryType) {
      case "fixed-group-tour":
        return (
          <FixedGroupTourBuilder
            itineraryId={tempItineraryId}
            onBack={handleBack}
          />
        )
      case "cart-combo":
        return (
          <CartComboBuilder
            itineraryId={tempItineraryId}
            onBack={handleBack}
          />
        )
      case "html-editor":
        return (
          <HtmlEditorBuilder
            itineraryId={tempItineraryId}
            onBack={handleBack}
          />
        )
      case "customized-package":
      default:
        return (
          <ItineraryBuilder 
            itineraryId={tempItineraryId}
            onBack={handleBack}
            onSave={onSaveRequested}
          />
        )
    }
  }

  return (
    <div className="h-full">
      {renderBuilderByType()}
    </div>
  )
}
