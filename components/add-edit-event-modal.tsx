"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Upload, MapPin, Hotel, Plane, Car, Ship, Info, X, Plus, Package, Utensils, Tag, FileText } from "lucide-react"
import { useLibrary } from "@/hooks/use-library"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ExtraFields {
  location?: string
  area?: string
  [key: string]: string | undefined
}

interface FormData {
  id?: string
  title: string
  description: string
  price: string
  currency: string
  tags: string[]
  media_urls: string[]
  category?: string
  sub_category?: string
  lodging_type?: string
  flight_type?: string
  transport_type?: string
  cruise_type?: string
  info_type?: string
  availability_status?: string
  listItems?: string[]
  difficulty?: string
  capacity?: string
  [key: string]: string | string[] | undefined
}

interface AddEditEventModalProps {
  isOpen: boolean
  onClose: () => void
  item?: Partial<FormData>
  day?: number
  isLibraryMode?: boolean
}

export function AddEditEventModal({ isOpen, onClose, item, day, isLibraryMode = false }: AddEditEventModalProps) {
  const [extraFields, setExtraFields] = useState<ExtraFields>({})
  const [selectedCategory, setSelectedCategory] = useState<string>(item?.category || "Activity")
  const [formData, setFormData] = useState({
    title: item?.title || "",
    description: item?.description || "",
    // Pricing section
    price: item?.price?.toString() || "",
    currency: item?.currency || "USD",
    // Details section
    provider: item?.provider || "",
    confirmation_number: item?.confirmation_number || "",
    // Availability section
    available_from: item?.available_from || "",
    available_to: item?.available_to || "",
    availability_status: item?.availability_status || "available",
    max_capacity: item?.max_capacity?.toString() || "",
    current_bookings: item?.current_bookings?.toString() || "0",
    tags: item?.tags || [],
    // Category specific fields
    sub_category: item?.sub_category || "",
    start_time: item?.start_time || "",
    duration: item?.duration?.toString() || "",
    lodging_type: item?.lodging_type || "",
    check_in_time: item?.check_in_time || "",
    room_type: item?.room_type || "",
    flight_type: item?.flight_type || "",
    airline: item?.airline || "",
    flight_time: item?.flight_time || "",
    transport_type: item?.transport_type || "",
    carrier: item?.carrier || "",
    vehicle_number: item?.vehicle_number || "",
    cruise_type: item?.cruise_type || "",
    cruise_carrier: item?.cruise_carrier || "",
    cabin_type: item?.cabin_type || "",
    info_type: item?.info_type || "",
    // Meal specific fields
    meals: item?.meals || { breakfast: false, lunch: false, dinner: false },
    // Hotel specific fields
    checkIn: item?.checkIn || "",
    checkOut: item?.checkOut || "",
    listItems: item?.listItems || [""],
    difficulty: item?.difficulty || "Easy",
    capacity: item?.capacity?.toString() || "",
  })
  const [saving, setSaving] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(item?.media_urls || [])
  const [uploading, setUploading] = useState(false)
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldValue, setNewFieldValue] = useState("")
  const [newTag, setNewTag] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { createItem, updateItem } = useLibrary()

  useEffect(() => {
    if (item) {
      setSelectedCategory(item.category)
      setFormData({
        title: item.title || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        currency: item.currency || "USD",
        provider: item.provider || "",
        confirmation_number: item.confirmation_number || "",
        available_from: item.available_from || "",
        available_to: item.available_to || "",
        availability_status: item.availability_status || "available",
        max_capacity: item.max_capacity?.toString() || "",
        current_bookings: item.current_bookings?.toString() || "0",
        tags: Array.isArray(item.tags) ? item.tags : [],
        sub_category: item.sub_category || "",
        start_time: item.start_time || "",
        duration: item.duration?.toString() || "",
        lodging_type: item.lodging_type || "",
        check_in_time: item.check_in_time || "",
        room_type: item.room_type || "",
        flight_type: item.flight_type || "",
        airline: item.airline || "",
        flight_time: item.flight_time || "",
        transport_type: item.transport_type || "",
        carrier: item.carrier || "",
        vehicle_number: item.vehicle_number || "",
        cruise_type: item.cruise_type || "",
        cruise_carrier: item.cruise_carrier || "",
        cabin_type: item.cabin_type || "",
        info_type: item.info_type || "",
        meals: item.meals || { breakfast: false, lunch: false, dinner: false },
        checkIn: item.checkIn || "",
        checkOut: item.checkOut || "",
        location: item.location || "",
        listItems: item.listItems || [""],
        difficulty: item.difficulty || "Easy",
        capacity: item.capacity?.toString() || "",
      })
      console.log("Loaded tags from item:", Array.isArray(item.tags) ? item.tags : [])
      setExtraFields(item.extra_fields || {})
      setUploadedFiles(item.media_urls || [])
    } else {
      // Initialize with empty values for new items
      setFormData((prev) => ({
        ...prev,
        tags: [], // Ensure tags is initialized as an empty array
      }))
      setExtraFields({})
      setUploadedFiles([])
    }
  }, [item])

  const categories = [
    { id: "Activity", label: "Activity & Experiences", icon: MapPin, color: "text-success-600" },
    { id: "Lodging", label: "Lodging", icon: Hotel, color: "text-brand-primary-600" },
    { id: "Flight", label: "Flight", icon: Plane, color: "text-brand-accent-600" },
    { id: "Transportation", label: "Transportation", icon: Car, color: "text-brand-secondary-600" },
    { id: "Cruise", label: "Cruise", icon: Ship, color: "text-warning-600" },
    { id: "Info", label: "Info", icon: Info, color: "text-neutral-600" },
    { id: "Package", label: "Package", icon: Package, color: "text-brand-primary-700" },
    { id: "Meal", label: "Meal", icon: Utensils, color: "text-orange-600" },
    { id: "Heading", label: "Heading", icon: FileText, color: "text-gray-600" },
    { id: "Paragraph", label: "Paragraph", icon: FileText, color: "text-gray-600" },
    { id: "List", label: "List", icon: FileText, color: "text-gray-600" },
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addExtraField = () => {
    if (newFieldName.trim() && newFieldValue.trim()) {
      setExtraFields((prev) => ({ ...prev, [newFieldName.trim()]: newFieldValue.trim() }))
      setNewFieldName("")
      setNewFieldValue("")
    }
  }

  const removeExtraField = (fieldName: string) => {
    setExtraFields((prev) => {
      const updated = { ...prev }
      delete updated[fieldName]
      return updated
    })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      const updatedTags = [...(formData.tags || []), newTag.trim()]
      handleInputChange("tags", updatedTags)
      console.log("Added tag:", newTag.trim(), "Updated tags:", updatedTags)
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    const updatedTags = formData.tags.filter((t: string) => t !== tag)
    handleInputChange("tags", updatedTags)
    console.log("Removed tag:", tag, "Updated tags:", updatedTags)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = Array.from(e.target.files || [])

    console.log("Files selected:", files.length)

    if (files.length === 0) {
      return
    }

    if (uploadedFiles.length + files.length > 7) {
      toast.error("Maximum 7 files allowed")
      e.target.value = ""
      return
    }

    setUploading(true)
    try {
      // Filter out large files and show message
      const validFiles = []
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is larger than 10MB and was not uploaded`)
          continue
        }
        const fileName = file.name.toLowerCase()
        const isValidFile =
          fileName.endsWith(".jpg") ||
          fileName.endsWith(".jpeg") ||
          fileName.endsWith(".png") ||
          fileName.endsWith(".gif") ||
          fileName.endsWith(".webp") ||
          fileName.endsWith(".mp4") ||
          fileName.endsWith(".mov") ||
          fileName.endsWith(".pdf")

        if (!isValidFile) {
          toast.error(`File ${file.name} has unsupported format`)
          continue
        }
        validFiles.push(file)
      }

      if (validFiles.length === 0) {
        setUploading(false)
        e.target.value = ""
        return
      }

      // Upload valid files
      // TODO: Implement MongoDB-based media upload
      const urls: string[] = []
      for (const file of validFiles) {
        try {
          // For now, we'll use a placeholder URL
          const url = URL.createObjectURL(file)
          urls.push(url)
          toast.success(`File "${file.name}" ready for preview`)
        } catch (error) {
          console.error(`Failed to handle ${file.name}:`, error)
          toast.error(`Failed to handle ${file.name}`)
        }
      }

      if (urls.length > 0) {
        setUploadedFiles((prev) => [...prev, ...urls])
        toast.success(`${urls.length} file(s) uploaded successfully`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Upload failed - please try again"
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }

    setSaving(true)
    try {
      const {
        title,
        description,
        price,
        currency,
        provider,
        confirmation_number,
        available_from,
        available_to,
        availability_status,
        max_capacity,
        current_bookings,
        tags,
        ...categoryData
      } = formData

      const itemData = {
        title,
        category: selectedCategory,
        description,
        price: price ? Number.parseFloat(price.toString()) : undefined,
        currency: currency || "USD",
        provider,
        confirmation_number,
        available_from: available_from || null,
        available_to: available_to || null,
        availability_status,
        max_capacity: max_capacity ? Number.parseInt(max_capacity.toString()) : null,
        current_bookings: current_bookings || 0,
        extra_fields: extraFields,
        tags: Array.isArray(tags) ? tags : [],
        media_urls: uploadedFiles,
        data: categoryData,
      }

      if (item) {
        await updateItem(item.id, itemData)
        toast.success("Item updated successfully")
      } else {
        await createItem(itemData)
        toast.success("Item created successfully")
      }

      onClose()
    } catch (error) {
      toast.error(item ? "Failed to update item" : "Failed to create item")
    } finally {
      setSaving(false)
    }
  }

  const renderCategorySpecificFields = () => {
    switch (selectedCategory) {
      case "Activity":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="subCategory" className="text-label-md">
                Sub-category
              </Label>
              <Select value={formData.sub_category} onValueChange={(value) => handleInputChange("sub_category", value)}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tickets">Tickets</SelectItem>
                  <SelectItem value="tours">Tours</SelectItem>
                  <SelectItem value="experiences">Experiences</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime" className="text-label-md">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange("start_time", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-label-md">
                  Duration (hours)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="2.5"
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty" className="text-label-md">
                  Difficulty Level
                </Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity" className="text-label-md">
                  Max Capacity (people)
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  placeholder="20"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )

      case "Lodging":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="lodgingType" className="text-label-md">
                Type
              </Label>
              <Select value={formData.lodging_type} onValueChange={(value) => handleInputChange("lodging_type", value)}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="homestay-villa">Homestay & Villa</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInTime" className="text-label-md">
                  Check-in Time
                </Label>
                <Input
                  id="checkInTime"
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => handleInputChange("checkIn", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="checkOutTime" className="text-label-md">
                  Check-out Time
                </Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => handleInputChange("checkOut", e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="roomType" className="text-label-md">
                Room/Bed Type
              </Label>
              <Input
                id="roomType"
                value={formData.room_type}
                onChange={(e) => handleInputChange("room_type", e.target.value)}
                placeholder="Deluxe King Room"
                className="input-field"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-label-md">Meal Inclusions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hotel-breakfast"
                    checked={formData.meals?.breakfast || false}
                    onChange={(e) =>
                      handleInputChange("meals", {
                        ...formData.meals,
                        breakfast: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label htmlFor="hotel-breakfast" className="text-sm">
                    Breakfast Included
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hotel-lunch"
                    checked={formData.meals?.lunch || false}
                    onChange={(e) =>
                      handleInputChange("meals", {
                        ...formData.meals,
                        lunch: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label htmlFor="hotel-lunch" className="text-sm">
                    Lunch Included
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hotel-dinner"
                    checked={formData.meals?.dinner || false}
                    onChange={(e) =>
                      handleInputChange("meals", {
                        ...formData.meals,
                        dinner: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label htmlFor="hotel-dinner" className="text-sm">
                    Dinner Included
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case "Flight":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="flightType" className="text-label-md">
                Type
              </Label>
              <Select value={formData.flight_type} onValueChange={(value) => handleInputChange("flight_type", value)}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departure">Departure</SelectItem>
                  <SelectItem value="arrival">Arrival</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="airline" className="text-label-md">
                  Airline
                </Label>
                <Input
                  id="airline"
                  value={formData.airline}
                  onChange={(e) => handleInputChange("airline", e.target.value)}
                  placeholder="Singapore Airlines"
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="flightTime" className="text-label-md">
                  Departure Time
                </Label>
                <Input
                  id="flightTime"
                  type="time"
                  value={formData.flight_time}
                  onChange={(e) => handleInputChange("flight_time", e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )

      case "Transportation":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="transportType" className="text-label-md">
                Sub-category
              </Label>
              <Select
                value={formData.transport_type}
                onValueChange={(value) => handleInputChange("transport_type", value)}
              >
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="car-rental">Car Rental</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carrier" className="text-label-md">
                  Carrier
                </Label>
                <Input
                  id="carrier"
                  value={formData.carrier}
                  onChange={(e) => handleInputChange("carrier", e.target.value)}
                  placeholder="Grab, Uber, etc."
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="vehicleNumber" className="text-label-md">
                  Train/Vehicle Number
                </Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicle_number}
                  onChange={(e) => handleInputChange("vehicle_number", e.target.value)}
                  placeholder="Optional"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )

      case "Cruise":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cruiseType" className="text-label-md">
                Type
              </Label>
              <Select value={formData.cruise_type} onValueChange={(value) => handleInputChange("cruise_type", value)}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departure">Departure</SelectItem>
                  <SelectItem value="arrival">Arrival</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cruiseCarrier" className="text-label-md">
                  Carrier
                </Label>
                <Input
                  id="cruiseCarrier"
                  value={formData.cruise_carrier}
                  onChange={(e) => handleInputChange("cruise_carrier", e.target.value)}
                  placeholder="Royal Caribbean"
                  className="input-field"
                />
              </div>
              <div>
                <Label htmlFor="cabinType" className="text-label-md">
                  Cabin Type/Number
                </Label>
                <Input
                  id="cabinType"
                  value={formData.cabin_type}
                  onChange={(e) => handleInputChange("cabin_type", e.target.value)}
                  placeholder="Balcony Suite 1234"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )

      case "Info":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="infoType" className="text-label-md">
                Sub-category
              </Label>
              <Select value={formData.info_type} onValueChange={(value) => handleInputChange("info_type", value)}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="city-guide">City Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "Package":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="packageType" className="text-label-md">
                Package Type
              </Label>
              <Select value={formData.sub_category} onValueChange={(value) => handleInputChange("sub_category", value)}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select package type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed-departure">Fixed Departure</SelectItem>
                  <SelectItem value="customisable">Customisable Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "Meal":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mealType" className="text-label-md">
                Meal Type
              </Label>
              <Select value={formData.sub_category} onValueChange={(value) => handleInputChange("sub_category", value)}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast (B)</SelectItem>
                  <SelectItem value="lunch">Lunch (L)</SelectItem>
                  <SelectItem value="dinner">Dinner (D)</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-label-md">Meal Inclusions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="breakfast"
                    checked={formData.meals?.breakfast || false}
                    onChange={(e) =>
                      handleInputChange("meals", {
                        ...formData.meals,
                        breakfast: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label htmlFor="breakfast" className="text-sm">
                    Breakfast Included
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lunch"
                    checked={formData.meals?.lunch || false}
                    onChange={(e) =>
                      handleInputChange("meals", {
                        ...formData.meals,
                        lunch: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label htmlFor="lunch" className="text-sm">
                    Lunch Included
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dinner"
                    checked={formData.meals?.dinner || false}
                    onChange={(e) =>
                      handleInputChange("meals", {
                        ...formData.meals,
                        dinner: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label htmlFor="dinner" className="text-sm">
                    Dinner Included
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case "Heading":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="headingText" className="text-label-md">
                Heading Text
              </Label>
              <Input
                id="headingText"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter heading text"
                className="input-field text-lg font-semibold"
              />
            </div>
            <div>
              <Label htmlFor="subtitle" className="text-label-md">
                Subtitle (Optional)
              </Label>
              <Input
                id="subtitle"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter subtitle"
                className="input-field"
              />
            </div>
          </div>
        )

      case "Paragraph":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="paragraphText" className="text-label-md">
                Paragraph Content
              </Label>
              <Textarea
                id="paragraphText"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter your paragraph text here..."
                className="input-field min-h-[120px]"
                rows={5}
              />
            </div>
          </div>
        )

      case "List":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="listTitle" className="text-label-md">
                List Title
              </Label>
              <Input
                id="listTitle"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter list title"
                className="input-field"
              />
            </div>
            <div>
              <Label className="text-label-md">List Items</Label>
              <div className="space-y-2">
                {(formData.listItems || [""]).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...(formData.listItems || [])]
                        newItems[index] = e.target.value
                        handleInputChange("listItems", newItems)
                      }}
                      placeholder={`Item ${index + 1}`}
                      className="input-field flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = (formData.listItems || []).filter((_, i) => i !== index)
                        handleInputChange("listItems", newItems.length ? newItems : [""])
                      }}
                      className="px-3"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItems = [...(formData.listItems || []), ""]
                    handleInputChange("listItems", newItems)
                  }}
                  className="w-full"
                >
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto card-elevated">
        <DialogHeader className="border-b border-neutral-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-neutral-900">
                {item ? "Edit Event" : isLibraryMode ? "Add Library Item" : `Add Event${day ? ` - Day ${day}` : ""}`}
              </DialogTitle>
              <DialogDescription className="text-body-md text-neutral-600 mt-1">
                {isLibraryMode
                  ? "Create a reusable component for your library"
                  : "Add or edit an event in your itinerary"}
              </DialogDescription>
            </div>
            <Button variant="ghost" onClick={onClose} className="btn-ghost h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* Category Selection */}
          <div>
            <Label className="text-base font-semibold text-neutral-900 mb-4 block">Category</Label>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid grid-cols-8 w-full h-auto p-1 bg-neutral-100">
                {categories.map((category) => {
                  const Icon = category.icon
                  const isActive = selectedCategory === category.id
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${isActive
                        ? "bg-white shadow-brand-sm text-brand-primary-600 border border-brand-primary-200"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                        }`}
                    >
                      <Icon className={`h-5 w-5 mb-2 ${isActive ? category.color : "text-neutral-500"}`} />
                      <span className="text-label-sm font-medium">{category.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information, Description, Media */}
            {selectedCategory !== "Meal" && (
              <div className="space-y-6">
                {/* Basic Information and Description - Moved to top */}
                <Card className="card-flat">
                  <CardContent className="p-6">
                    <h4 className="text-base font-semibold text-neutral-900 mb-4">Basic Information</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description" className="text-label-md">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Add detailed description..."
                          rows={4}
                          className="input-field mt-1 resize-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title" className="text-label-md">
                          Title *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          placeholder="Enter event title"
                          required
                          className="input-field mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location" className="text-label-md">
                            City/Location
                          </Label>
                          <Input
                            id="location"
                            value={extraFields.location || ""}
                            onChange={(e) => setExtraFields((prev) => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g., Bangkok, Thailand"
                            className="input-field mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="area" className="text-label-md">
                            Area/District
                          </Label>
                          <Input
                            id="area"
                            value={extraFields.area || ""}
                            onChange={(e) => setExtraFields((prev) => ({ ...prev, area: e.target.value }))}
                            placeholder="e.g., Sukhumvit"
                            className="input-field mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags Management - New section */}
                <Card className="card-flat border-2 border-brand-primary-300">
                  <CardContent className="p-6">
                    <h4 className="text-base font-semibold text-brand-primary-700 mb-4 flex items-center">
                      <Tag className="h-5 w-5 mr-2" />
                      Tags & Labels
                    </h4>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag or label..."
                          className="input-field flex-1 border-2 focus:border-brand-primary-500"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addTag()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          className="btn-primary bg-brand-primary-600 hover:bg-brand-primary-700 shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Tag
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 min-h-[40px] border-t pt-3 border-neutral-200">
                        {formData.tags && formData.tags.length > 0 ? (
                          formData.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              className="px-3 py-1.5 bg-brand-primary-100 text-brand-primary-700 hover:bg-brand-primary-200 flex items-center shadow-sm"
                            >
                              <span className="font-medium">{tag}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeTag(tag)}
                                className="ml-2 p-0 h-4 w-4 text-brand-primary-700 hover:text-red-600"
                                title="Remove tag"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-neutral-500 italic">
                            No tags added yet. Enter a tag above and click Add Tag.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Media Upload */}
                <Card className="card-flat">
                  <CardContent className="p-6">
                    <h4 className="text-base font-semibold text-neutral-900 mb-4">Media Upload</h4>
                    <div className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-32 border-2 border-dashed border-neutral-300 hover:border-brand-primary-300 hover:bg-brand-primary-50/50 transition-colors duration-200 bg-transparent"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                        disabled={uploading || uploadedFiles.length >= 7}
                      >
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                          <p className="text-sm text-neutral-600 mb-1">
                            {uploading ? "Uploading..." : "Click to upload files"}
                          </p>
                          <p className="text-xs text-neutral-500">Up to 7 files, max 10MB each</p>
                        </div>
                      </Button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.pdf"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />

                      {uploadedFiles.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedFiles.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Right Column - Category Specific, Pricing & Availability, Extra Fields */}
            <div className="space-y-6">
              {/* Category Specific Fields */}
              <Card className="card-flat">
                <CardContent className="p-6">
                  <h4 className="text-base font-semibold text-neutral-900 mb-4">{selectedCategory} Details</h4>
                  {renderCategorySpecificFields()}
                </CardContent>
              </Card>

              {/* Pricing & Availability Section (Modular) */}
              <Card className="card-flat">
                <CardContent className="p-6">
                  <h4 className="text-base font-semibold text-neutral-900 mb-4">Pricing & Availability</h4>
                  {/* Pricing */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-neutral-700 mb-2">Pricing</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price" className="text-label-md">
                          Price
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          placeholder="0.00"
                          className="input-field mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency" className="text-label-md">
                          Currency
                        </Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => handleInputChange("currency", value)}
                        >
                          <SelectTrigger className="input-field mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="AED">AED (د.إ)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h5 className="text-sm font-medium text-neutral-700 mb-2">Availability</h5>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="availableFrom" className="text-label-md">
                            Available From
                          </Label>
                          <Input
                            id="availableFrom"
                            type="date"
                            value={formData.available_from}
                            onChange={(e) => handleInputChange("available_from", e.target.value)}
                            className="input-field mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="availableTo" className="text-label-md">
                            Available To
                          </Label>
                          <Input
                            id="availableTo"
                            type="date"
                            value={formData.available_to}
                            onChange={(e) => handleInputChange("available_to", e.target.value)}
                            className="input-field mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="availabilityStatus" className="text-label-md">
                            Status
                          </Label>
                          <Select
                            value={formData.availability_status}
                            onValueChange={(value) => handleInputChange("availability_status", value)}
                          >
                            <SelectTrigger className="input-field mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="limited">Limited</SelectItem>
                              <SelectItem value="unavailable">Unavailable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="maxCapacity" className="text-label-md">
                            Max Capacity
                          </Label>
                          <Input
                            id="maxCapacity"
                            type="number"
                            value={formData.max_capacity}
                            onChange={(e) => handleInputChange("max_capacity", e.target.value)}
                            placeholder="100"
                            className="input-field mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="currentBookings" className="text-label-md">
                            Current Bookings
                          </Label>
                          <Input
                            id="currentBookings"
                            type="number"
                            value={formData.current_bookings}
                            onChange={(e) => handleInputChange("current_bookings", e.target.value)}
                            placeholder="0"
                            className="input-field mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Details Section */}
              <Card className="card-flat">
                <CardContent className="p-6">
                  <h4 className="text-base font-semibold text-neutral-900 mb-4">Details</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="provider" className="text-label-md">
                          Provider
                        </Label>
                        <Input
                          id="provider"
                          value={formData.provider}
                          onChange={(e) => handleInputChange("provider", e.target.value)}
                          placeholder="Booked through..."
                          className="input-field mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmationNumber" className="text-label-md">
                          Confirmation #
                        </Label>
                        <Input
                          id="confirmationNumber"
                          value={formData.confirmation_number}
                          onChange={(e) => handleInputChange("confirmation_number", e.target.value)}
                          placeholder="ABC123"
                          className="input-field mt-1"
                        />
                      </div>
                    </div>

                    {/* Extra fields input */}
                    <div className="mt-6">
                      <h5 className="text-sm font-medium text-neutral-700 mb-2">Additional Fields</h5>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Field name"
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          className="input-field flex-1"
                        />
                        <Input
                          placeholder="Field value"
                          value={newFieldValue}
                          onChange={(e) => setNewFieldValue(e.target.value)}
                          className="input-field flex-1"
                        />
                        <Button type="button" onClick={addExtraField} className="btn-primary">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Display existing extra fields */}
                    {Object.entries(extraFields).length > 0 && (
                      <div className="space-y-2 mt-2">
                        {Object.entries(extraFields).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                            <div className="flex-1">
                              <span className="font-medium text-sm">{key}:</span>
                              <span className="ml-2 text-sm">{String(value)}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExtraField(key)}
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
            <Button variant="outline" onClick={onClose} className="btn-outline bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : item ? "Update" : "Add"} {isLibraryMode ? "Library Item" : "Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
