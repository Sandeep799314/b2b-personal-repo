"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/client-auth"

export interface QuotationPricingOptions {
  showIndividualPrices: boolean
  showSubtotals: boolean
  showTotal: boolean
  markupType: "percentage" | "fixed"
  markupValue: number
  originalTotalPrice: number
  finalTotalPrice: number
}

export interface QuotationClientInfo {
  name: string
  email?: string
  phone?: string
  referenceNo?: string
  notes?: string
}

export interface QuotationData {
  _id?: string
  itineraryId: string
  quotationNumber?: string
  title: string
  description: string
  destination: string
  totalPrice: number
  currency: string
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  queryStatus: "pending" | "completed" | "closed" | "cancelled" | "awaiting_feedback" | "confirmed"
  pricingOptions: QuotationPricingOptions
  client: QuotationClientInfo
  generatedDate: Date
  validUntil?: Date
  [key: string]: any // For other itinerary properties
}

export function useQuotations() {
  const [quotations, setQuotations] = useState<QuotationData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch all quotations
  const fetchQuotations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/quotations", { headers })
      if (!response.ok) {
        throw new Error("Failed to fetch quotations")
      }

      const data = await response.json()
      setQuotations(data)
      return data
    } catch (error) {
      console.error("Error fetching quotations:", error)
      setError("Failed to fetch quotations")
      toast({
        title: "Error",
        description: "Failed to fetch quotations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Fetch a single quotation by ID
  const fetchQuotation = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/quotations/${id}`, { headers })
      if (!response.ok) {
        throw new Error("Failed to fetch quotation")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching quotation:", error)
      setError("Failed to fetch quotation")
      toast({
        title: "Error",
        description: "Failed to fetch quotation",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Convert itinerary to quotation
  const convertItineraryToQuotation = useCallback(async (
    itineraryId: string,
    clientInfo: QuotationClientInfo,
    pricingOptions?: Partial<QuotationPricingOptions>
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get auth headers
      const headers = await getAuthHeaders();

      const response = await fetch("/api/quotations/convert-from-itinerary", {
        method: "POST",
        headers,
        body: JSON.stringify({
          itineraryId,
          clientInfo,
          pricingOptions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to convert itinerary to quotation")
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: "Itinerary successfully converted to quotation",
      })
      return data.quotationId
    } catch (error) {
      console.error("Error converting itinerary to quotation:", error)
      setError("Failed to convert itinerary to quotation")
      toast({
        title: "Error",
        description: "Failed to convert itinerary to quotation",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Update quotation
  const updateQuotation = useCallback(async (id: string, data: Partial<QuotationData>) => {
    setIsLoading(true)
    setError(null)

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/quotations/${id}`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update quotation")
      }

      const updatedQuotation = await response.json()

      // Update local state with robust matching and merging
      setQuotations((prev) =>
        prev.map((q) => {
          const match = q._id === id || (q._id && id && q._id.toString() === id.toString());
          if (match) {
            return { ...q, ...updatedQuotation };
          }
          return q;
        })
      )

      toast({
        title: "Success",
        description: "Quotation updated successfully",
      })

      return updatedQuotation
    } catch (error: any) {
      console.error("Error updating quotation:", error)
      setError(error.message || "Failed to update quotation")
      toast({
        title: "Error",
        description: error.message || "Failed to update quotation",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Delete quotation
  const deleteQuotation = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/quotations/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete quotation")
      }

      // Update local state
      setQuotations((prev) => prev.filter((q) => q._id !== id))

      toast({
        title: "Success",
        description: "Quotation deleted successfully",
      })

      return true
    } catch (error: any) {
      console.error("Error deleting quotation:", error)
      setError(error.message || "Failed to delete quotation")
      toast({
        title: "Error",
        description: error.message || "Failed to delete quotation",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Load quotations on initial mount
  useEffect(() => {
    fetchQuotations()
  }, [fetchQuotations])

  return {
    quotations,
    isLoading,
    error,
    fetchQuotations,
    fetchQuotation,
    convertItineraryToQuotation,
    updateQuotation,
    deleteQuotation,
  }
}