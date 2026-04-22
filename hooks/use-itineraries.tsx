"use client"

import { useState, useEffect } from "react"
import type { IItinerary } from "@/models/Itinerary"
import { errorHandler } from "@/lib/error-handler"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/client-auth"

export function useItineraries() {
  const [itineraries, setItineraries] = useState<IItinerary[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchItineraries = async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/itineraries", {
        headers: {
          ...authHeaders,
          "x-request-id": `fetch-${Date.now()}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setItineraries(result.data || result) // Handle both new and old response formats
    } catch (error) {
      await errorHandler.handleApiError(error, "fetch itineraries")
    } finally {
      setLoading(false)
    }
  }

  const createItinerary = async (itinerary: Partial<IItinerary>, retryCount = 0) => {
    const maxRetries = 3

    try {
      console.log("[v0] Creating itinerary with data:", itinerary)

      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: {
          ...authHeaders,
          "x-request-id": `create-${Date.now()}`,
        },
        body: JSON.stringify(itinerary),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle specific error types
        if (response.status === 400 && errorData.code === "MISSING_REQUIRED_FIELDS") {
          toast({
            title: "Missing Information",
            description: errorData.message,
            variant: "destructive",
          })
          throw new Error(errorData.message)
        }

        if (response.status === 409 && errorData.code === "DUPLICATE_KEY_ERROR") {
          toast({
            title: "Duplicate Entry",
            description: errorData.message,
            variant: "destructive",
          })
          throw new Error(errorData.message)
        }

        // Check if error is retryable
        const retryableStatuses = [408, 429, 500, 502, 503, 504]
        if (retryableStatuses.includes(response.status) && retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)

          toast({
            title: "Retrying...",
            description: `Attempt ${retryCount + 1}/${maxRetries} failed. Retrying in ${delay / 1000}s...`,
          })

          await new Promise((resolve) => setTimeout(resolve, delay))
          return createItinerary(itinerary, retryCount + 1)
        }

        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const newItinerary = result.data || result

      console.log("[v0] Successfully created itinerary:", newItinerary)

      setItineraries((prev) => [newItinerary, ...prev])

      toast({
        title: "Success",
        description: "Itinerary created successfully!",
      })

      return newItinerary
    } catch (error) {
      console.error("[v0] Failed to create itinerary:", error)

      // Don't show error toast if we're going to retry
      if (retryCount < maxRetries && error instanceof Error && error.message.includes("50")) {
        // Let the retry logic handle it
        throw error
      }

      errorHandler.logError(error as Error, {
        operation: "create_itinerary",
        retryCount,
        itineraryData: itinerary,
      })

      throw error
    }
  }

  const updateItinerary = async (id: string, updates: Partial<IItinerary>) => {
    // Optimistic update
    const originalItineraries = [...itineraries]
    setItineraries((prev) => prev.map((item) => (item._id === id ? { ...item, ...updates } : item)))

    try {
      console.log("[v0] Updating itinerary with data:", updates)

      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/itineraries/${id}`, {
        method: "PUT",
        headers: {
          ...authHeaders,
          "x-request-id": `update-${Date.now()}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        // Rollback optimistic update
        setItineraries(originalItineraries)

        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const updatedItinerary = result.data || result

      console.log("[v0] Successfully updated itinerary:", updatedItinerary)

      // Update with server response
      setItineraries((prev) => prev.map((item) => (item._id === id ? updatedItinerary : item)))

      toast({
        title: "Success",
        description: "Itinerary updated successfully!",
      })

      return updatedItinerary
    } catch (error) {
      console.error("[v0] Failed to update itinerary:", error)

      // Rollback was already done above
      await errorHandler.handleApiError(error, "update itinerary")
      throw error
    }
  }

  const deleteItinerary = async (id: string) => {
    const itemToDelete = itineraries.find((item) => item._id === id)
    if (!itemToDelete) return

    // Optimistic delete
    setItineraries((prev) => prev.filter((item) => item._id !== id))

    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/itineraries/${id}`, {
        method: "DELETE",
        headers: {
          ...authHeaders,
          "x-request-id": `delete-${Date.now()}`,
        },
      })

      if (!response.ok) {
        // Rollback optimistic delete
        setItineraries((prev) => [...prev, itemToDelete])

        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Show success with undo option
      toast({
        title: "Deleted",
        description: "Itinerary deleted successfully.",
        action: (
          <button
            onClick={() => {
              setItineraries((prev) => [...prev, itemToDelete])
              toast({
                title: "Restored",
                description: "Itinerary has been restored.",
              })
            }}
            className="text-sm underline"
          >
            Undo
          </button>
        ),
      })
    } catch (error) {
      console.error("[v0] Failed to delete itinerary:", error)
      await errorHandler.handleApiError(error, "delete itinerary")
    }
  }

  useEffect(() => {
    fetchItineraries()
  }, [])

  return {
    itineraries,
    loading,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    refetch: fetchItineraries,
  }
}
