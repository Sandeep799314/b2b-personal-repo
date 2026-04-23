"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Save, 
  Calendar as CalendarIcon, 
  Users, 
  MapPin,
  Clock,
  Plus,
  Trash2,
  X,
  Loader2,
  Check
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ItineraryBuilder } from "./itinerary-builder"
import { GalleryUpload } from "./itinerary-builder/gallery-upload"
import type { IGalleryItem } from "@/models/Itinerary"
import { getAuthHeaders } from "@/lib/client-auth"

interface FixedGroupTourBuilderProps {
  itineraryId?: string
  onBack: () => void
  onHasChangesChange?: (hasChanges: boolean) => void
}

export function FixedGroupTourBuilder({ itineraryId, onBack, onHasChangesChange }: FixedGroupTourBuilderProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("New Fixed Group Tour")
  const [description, setDescription] = useState("")
  const [productId, setProductId] = useState(`FGT-${Date.now().toString(36).toUpperCase()}`)
  const [destination, setDestination] = useState("")
  const [duration, setDuration] = useState("")
  
  // Fixed Group Tour specific fields
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [maxParticipants, setMaxParticipants] = useState<number>(0)
  const [currentBookings, setCurrentBookings] = useState<number>(0)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [newAvailableDate, setNewAvailableDate] = useState("")
  
  // Itinerary content
  const [showItineraryBuilder, setShowItineraryBuilder] = useState(false)
  const [basePrice, setBasePrice] = useState<number>(0)

  // Gallery state
  const [gallery, setGallery] = useState<IGalleryItem[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const isInitialLoad = useRef(true)

  // Load existing data if editing
  useEffect(() => {
    if (itineraryId) {
      loadTourData().then(() => {
        setTimeout(() => {
          isInitialLoad.current = false
          setHasChanges(false)
        }, 500)
      })
    } else {
      initializeFromParams()
      setTimeout(() => {
        isInitialLoad.current = false
        setHasChanges(false)
      }, 500)
    }
  }, [itineraryId])

  // Track changes
  useEffect(() => {
    if (isInitialLoad.current) return
    if (!hasChanges) {
      setHasChanges(true)
    }
  }, [title, description, destination, duration, startDate, endDate, maxParticipants, currentBookings, availableDates, basePrice, gallery])

  useEffect(() => {
    if (onHasChangesChange) {
      onHasChangesChange(hasChanges)
    }
  }, [hasChanges, onHasChangesChange])

  const loadTourData = async () => {
    try {
      const authHeaders = await getAuthHeaders()
      const response = await fetch(`/api/itineraries/${itineraryId}`, {
        headers: authHeaders,
      })
      if (response.ok) {
        const data = await response.json()
        setTitle(data.title || "Fixed Group Tour")
        setDescription(data.description || "")
        setProductId(data.productId || productId)
        setDestination(data.destination || "")
        setDuration(data.duration || "")
        setBasePrice(data.totalPrice || 0)
        
        if (data.fixedDates) {
          setStartDate(data.fixedDates.startDate || "")
          setEndDate(data.fixedDates.endDate || "")
          setMaxParticipants(data.fixedDates.maxParticipants || 0)
          setCurrentBookings(data.fixedDates.currentBookings || 0)
          setAvailableDates(data.fixedDates.availableDates || [])
        }

        // Load gallery data
        setGallery(data.gallery || [])
      }
    } catch (error) {
      console.error("Failed to load tour data:", error)
      toast({
        title: "Error",
        description: "Failed to load tour data",
        variant: "destructive",
      })
    }
  }

  const initializeFromParams = () => {
    const params = new URLSearchParams(window.location.search)
    setTitle(params.get("name") || "New Fixed Group Tour")
    setDescription(params.get("description") || "")
    setProductId(params.get("productId") || productId)
    setDestination(params.get("destination") || "")
    setStartDate(params.get("startDate") || "")
    setEndDate(params.get("endDate") || "")
    setMaxParticipants(parseInt(params.get("maxParticipants") || "0"))
    
    // Calculate duration from dates
    if (params.get("startDate") && params.get("endDate")) {
      const start = new Date(params.get("startDate")!)
      const end = new Date(params.get("endDate")!)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setDuration(`${diffDays} Days`)
    }
  }

  const handleAddAvailableDate = () => {
    if (!newAvailableDate) {
      toast({
        title: "Validation Error",
        description: "Please select a date",
        variant: "destructive",
      })
      return
    }

    if (availableDates.includes(newAvailableDate)) {
      toast({
        title: "Validation Error",
        description: "This date is already added",
        variant: "destructive",
      })
      return
    }

    setAvailableDates([...availableDates, newAvailableDate].sort())
    setNewAvailableDate("")
    
    toast({
      title: "Success",
      description: "Available date added",
    })
  }

  const handleRemoveAvailableDate = (dateToRemove: string) => {
    setAvailableDates(availableDates.filter(date => date !== dateToRemove))
    toast({
      title: "Success",
      description: "Available date removed",
    })
  }

  const handleSave = async () => {
    // Validation
    if (!title || !startDate || !endDate || !maxParticipants) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const itineraryData = {
        productId,
        title,
        description,
        destination: destination || "To be announced",
        duration,
        totalPrice: basePrice,
        currency: "USD",

        type: "fixed-group-tour",
        createdBy: "agent-user",
        lastUpdatedBy: "agent-user",
        countries: destination ? [destination] : [],
        days: [],
        highlights: [],
        images: [],
        fixedDates: {
          startDate,
          endDate,
          maxParticipants,
          currentBookings,
          availableDates,
        },
        gallery,
      }

      const url = itineraryId ? `/api/itineraries/${itineraryId}` : "/api/itineraries"
      const method = itineraryId ? "PUT" : "POST"

      const authHeaders = await getAuthHeaders()
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          ...authHeaders
        },
        body: JSON.stringify(itineraryData),
      })

      if (response.ok) {
        const savedData = await response.json()
        toast({
          title: "Success",
          description: `Fixed Group Tour ${itineraryId ? "updated" : "created"} successfully`,
        })
        setHasChanges(false)
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 2000)
        // Update itineraryId for future saves
        if (!itineraryId && savedData._id) {
          // Could update URL or handle navigation here
        }
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save fixed group tour",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAvailabilityStatus = () => {
    if (maxParticipants === 0) return { status: "unlimited", color: "bg-green-100 text-green-800" }
    
    const availableSpots = maxParticipants - currentBookings
    const percentageBooked = (currentBookings / maxParticipants) * 100
    
    if (availableSpots === 0) return { status: "fully booked", color: "bg-red-100 text-red-800" }
    if (percentageBooked >= 80) return { status: "filling fast", color: "bg-orange-100 text-orange-800" }
    if (percentageBooked >= 50) return { status: "half full", color: "bg-yellow-100 text-yellow-800" }
    return { status: "available", color: "bg-green-100 text-green-800" }
  }

  if (showItineraryBuilder) {
    return (
      <ItineraryBuilder 
        itineraryId={itineraryId} 
        onBack={() => setShowItineraryBuilder(false)} 
      />
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Fixed Group Tour</h1>
            <p className="text-sm text-gray-500">Create tours with fixed dates and group sizes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowItineraryBuilder(true)}
            disabled={!itineraryId}
          >
            Edit Itinerary
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className={`${showSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-[#2D7CEA] hover:bg-[#1e63c7]'} text-white shadow-md transition-all duration-300`}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : showSaved ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : showSaved ? "Saved" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tour Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tour Name *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter tour name"
                />
              </div>
              <div>
                <Label>Product ID *</Label>
                <Input
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Enter product ID"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter tour description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Destination</Label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter destination"
                  />
                </div>
                <div>
                  <Label>Base Price (USD)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fixed Dates & Group Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Fixed Dates & Group Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tour Start Date *</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      // Recalculate duration if both dates are set
                      if (endDate && e.target.value) {
                        const start = new Date(e.target.value)
                        const end = new Date(endDate)
                        const diffTime = Math.abs(end.getTime() - start.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                        setDuration(`${diffDays} Days`)
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Tour End Date *</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      // Recalculate duration if both dates are set
                      if (startDate && e.target.value) {
                        const start = new Date(startDate)
                        const end = new Date(e.target.value)
                        const diffTime = Math.abs(end.getTime() - start.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                        setDuration(`${diffDays} Days`)
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Maximum Participants *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 0)}
                    placeholder="Enter max participants"
                  />
                </div>
                <div>
                  <Label>Current Bookings</Label>
                  <Input
                    type="number"
                    min="0"
                    max={maxParticipants}
                    value={currentBookings}
                    onChange={(e) => setCurrentBookings(parseInt(e.target.value) || 0)}
                    placeholder="Current bookings"
                  />
                </div>
              </div>

              <div>
                <Label>Duration</Label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Auto-calculated or enter manually"
                />
              </div>
            </CardContent>
          </Card>

          {/* Alternative Available Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Alternative Available Dates</CardTitle>
              <p className="text-sm text-gray-500">
                Add additional dates when this tour is available (optional)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newAvailableDate}
                  onChange={(e) => setNewAvailableDate(e.target.value)}
                  placeholder="Select alternative date"
                />
                <Button onClick={handleAddAvailableDate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Date
                </Button>
              </div>
              
              {availableDates.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Available Dates:</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableDates.map((date) => (
                      <Badge 
                        key={date} 
                        variant="secondary" 
                        className="flex items-center gap-1"
                      >
                        {formatDate(date)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-100"
                          onClick={() => handleRemoveAvailableDate(date)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gallery Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
              <p className="text-sm text-gray-500">
                Upload images for this tour (optional)
              </p>
            </CardHeader>
            <CardContent>
              <GalleryUpload
                gallery={gallery}
                onGalleryUpdate={setGallery}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tour Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tour Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {startDate && endDate && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <CalendarIcon className="h-4 w-4" />
                    Tour Dates
                  </div>
                  <div className="text-sm">
                    <div><strong>Start:</strong> {formatDate(startDate)}</div>
                    <div><strong>End:</strong> {formatDate(endDate)}</div>
                    <div><strong>Duration:</strong> {duration}</div>
                  </div>
                </div>
              )}
              
              {maxParticipants > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Users className="h-4 w-4" />
                    Group Size
                  </div>
                  <div className="text-sm">
                    <div><strong>Max:</strong> {maxParticipants} people</div>
                    <div><strong>Booked:</strong> {currentBookings} people</div>
                    <div><strong>Available:</strong> {maxParticipants - currentBookings} spots</div>
                  </div>
                </div>
              )}

              {destination && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    Destination
                  </div>
                  <div className="text-sm">{destination}</div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="h-4 w-4" />
                  Availability Status
                </div>
                <Badge className={getAvailabilityStatus().color}>
                  {getAvailabilityStatus().status}
                </Badge>
              </div>

              {basePrice > 0 && (
                <div className="border-t pt-4">
                  <div className="text-lg font-bold">${basePrice} per person</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Information */}
          {maxParticipants > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Booking Progress:</span>
                    <span>{Math.round((currentBookings / maxParticipants) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(currentBookings / maxParticipants) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentBookings} of {maxParticipants} spots filled
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alternative Dates Summary */}
          {availableDates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alternative Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {availableDates.length} additional date{availableDates.length !== 1 ? 's' : ''} available
                </div>
                <div className="mt-2 space-y-1">
                  {availableDates.slice(0, 3).map((date) => (
                    <div key={date} className="text-xs text-gray-500">
                      {formatDate(date)}
                    </div>
                  ))}
                  {availableDates.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{availableDates.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
