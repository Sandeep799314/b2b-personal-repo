"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  Trash2,
  ShoppingCart,
  Plane,
  Car,
  UtensilsCrossed,
  Camera,
  Sun,
  Edit,
  Package,
  GripVertical,
  ChevronDown,
  ChevronLeft,
  Building2,
  Tent,
  ArrowRight,
  Eye,
  X,
  Image as ImageIcon,
  FileText,
  Ship,
} from "lucide-react"
import { ICartItem } from "@/models/Itinerary"
import { useToast } from "@/hooks/use-toast"
import { GalleryUpload } from "./itinerary-builder/gallery-upload"
import type { IGalleryItem } from "@/models/Itinerary"
import type { IItineraryEvent } from "@/models/Itinerary"
import { getAuthHeaders } from "@/lib/client-auth"

// Shared Form Imports
import { FlightForms } from "./itinerary-builder/flight-forms"
import { HotelForms } from "./itinerary-builder/hotel-forms"
import { MealForms } from "./itinerary-builder/meal-forms"
import { ActivityForms } from "./itinerary-builder/activity-forms"
import { ImageForms } from "./itinerary-builder/image-forms"
import { TransferForms } from "./itinerary-builder/transfer-forms"
import { AncillariesForms } from "./itinerary-builder/ancillaries-forms"
import { OthersForms } from "./itinerary-builder/others-forms"
import { CruiseForms } from "./itinerary-builder/cruise-forms"
import {
  transferSubCategories,
  ancillariesSubCategories,
  othersSubCategories,
} from "./itinerary-builder/constants"

interface CartComboBuilderProps {
  itineraryId?: string
  onBack: () => void
}

const CATEGORY_ICONS = {
  activity: Camera,
  hotel: Sun,
  flight: Plane,
  transfer: Car,
  meal: UtensilsCrossed,
  other: Package,
  image: ImageIcon,
  ancillaries: FileText,
  cruise: Ship,
}

const CATEGORY_COLORS = {
  activity: "bg-green-50 border-green-200 text-green-800",
  hotel: "bg-blue-50 border-blue-200 text-blue-800",
  flight: "bg-orange-50 border-orange-200 text-orange-800",
  transfer: "bg-purple-50 border-purple-200 text-purple-800",
  meal: "bg-yellow-50 border-yellow-200 text-yellow-800",
  other: "bg-gray-50 border-gray-200 text-gray-800",
  image: "bg-pink-50 border-pink-200 text-pink-800",
  ancillaries: "bg-indigo-50 border-indigo-200 text-indigo-800",
  cruise: "bg-cyan-50 border-cyan-200 text-cyan-800",
}

const COMPONENT_TEMPLATES = [
  {
    category: "flight",
    title: "Flight",
    icon: Plane,
    color: "bg-orange-50 border-orange-200",
  },
  {
    category: "hotel",
    title: "Hotel",
    icon: Building2,
    color: "bg-blue-50 border-blue-200",
  },
  {
    category: "activity",
    title: "Activity",
    icon: Tent,
    color: "bg-green-50 border-green-200",
  },
  {
    category: "transfer",
    title: "Transfer",
    icon: Car,
    color: "bg-purple-50 border-purple-200",
  },
  {
    category: "meal",
    title: "Meals",
    icon: UtensilsCrossed,
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    category: "ancillaries",
    title: "Ancillaries",
    icon: FileText,
    color: "bg-indigo-50 border-indigo-200",
  },
  {
    category: "image",
    title: "Image",
    icon: ImageIcon,
    color: "bg-pink-50 border-pink-200",
  },
  {
    category: "cruise",
    title: "Cruise",
    icon: Ship,
    color: "bg-cyan-50 border-cyan-200",
  },
  {
    category: "other",
    title: "Others",
    icon: Package,
    color: "bg-gray-50 border-gray-200",
  },
]

export function CartComboBuilder({ itineraryId, onBack }: CartComboBuilderProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("New Cart/Combo")
  const [description, setDescription] = useState("")
  const [productId, setProductId] = useState(`CRT-${Date.now().toString(36).toUpperCase()}`)
  const [cartItems, setCartItems] = useState<ICartItem[]>([])
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ICartItem | null>(null)
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<any>(null)

  // Initialize form state
  const [itemForm, setItemForm] = useState<Partial<ICartItem>>({
    name: "",
    description: "",
    category: "activity" as ICartItem["category"],
    price: 0,
    currency: "USD",
    date: "",
    quantity: 1,
    // Common fields
    location: "",
    duration: "",
    difficulty: "",
    startTime: "",
    endTime: "",
    flightNumber: "",
    airline: "",
    fromCity: "",
    toCity: "",
    checkIn: "",
    checkOut: "",
    hotelName: "",
    roomCategory: "",
    nights: 0,
    vehicleType: "",
    transferType: "private",
    mealType: "",
    // Extended fields
    subCategory: "",
    country: "",
    visaType: "",
    visaDuration: "",
    entryMethod: "",
    departureDate: "",
    returnDate: "",
    imageUrl: "",
    imageCaption: "",
    // Arrays
    destinations: [],
    products: [], // For Others/TravelGears
    stopsList: [], // For Transfers
    additionalVehicles: [],
    amenities: [],
    highlights: [],
    stopLocations: [], // For Flights
    // Extended Flight
    checkinBags: 0,
    checkinBagWeight: "",
    cabinBags: 0,
    cabinBagWeight: "",
    numberOfStops: 0,
    bookingId: "",
    seatNumber: "",
    inFlightMeals: "",
    refundable: "",
    pnr: "",
    // Extended Transfer
    pickupTime: "",
    dropTime: "",
    noOfHours: 0,
    noOfDays: 0,
    busNumber: "",
    trainNumber: "",
    transferLink: "",
    transferClass: "",
    fuelType: "",
    carModel: "",
    transmission: "",
    pickupDrop: "pickup", // Default
    // Extended Hotel
    adults: 2,
    children: 0,
    mealPlan: "",
    propertyType: "",
    address: "",
    hotelLink: "",
    confirmationNumber: "",
    hotelRating: 0,
    // Extended Ancillaries
    forexCurrency: "",
    baseCurrency: "INR",
    amount: 0,
    insuranceProvider: "",
    policyNumber: "",
    coverageDetails: "",
    insuranceType: "",
    sumInsured: 0,
    insuranceNotes: "",
    serviceCharge: 0,
    giftAmount: 0,
  })

  // Gallery state
  const [gallery, setGallery] = useState<IGalleryItem[]>([])

  // Preview state
  const [showPreview, setShowPreview] = useState(false)

  // Check for view mode from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const mode = params.get('mode')
      if (mode === 'view' && cartItems.length > 0) {
        setShowPreview(true)
      }
    }
  }, [cartItems.length])

  // Load existing cart data if editing
  useEffect(() => {
    if (itineraryId) {
      loadCartData()
    }
  }, [])

  const loadCartData = async () => {
    try {
      const authHeaders = await getAuthHeaders()
      const response = await fetch(`/api/itineraries/${itineraryId}`, {
        headers: authHeaders,
      })
      if (response.ok) {
        const data = await response.json()
        setTitle(data.title || "Cart/Combo")
        setDescription(data.description || "")
        setProductId(data.productId || productId)
        setCartItems(data.cartItems || [])
        setGallery(data.gallery || [])
      }
    } catch (error) {
      console.error("Failed to load cart data:", error)
      toast({
        title: "Error",
        description: "Failed to load cart data",
        variant: "destructive",
      })
    }
  }

  const handleComponentDragStart = (component: any) => {
    setDraggedComponent(component)
  }

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedComponent) {
      resetItemForm()
      setItemForm((prev) => ({
        ...prev,
        category: draggedComponent.category,
      }))
      setShowAddItemForm(true)
      setDraggedComponent(null)
    }
  }

  const handleAddItem = () => {
    if (!itemForm.name || !itemForm.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in name and date (date is mandatory)",
        variant: "destructive",
      })
      return
    }

    const newItem: ICartItem = {
      ...itemForm as ICartItem,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: `${productId}-${cartItems.length + 1}`,
      addedAt: new Date(),
      quantity: itemForm.quantity || 1,
      price: Number(itemForm.price) || 0,
    }

    setCartItems([...cartItems, newItem])
    resetItemForm()
    setShowAddItemForm(false)

    toast({
      title: "Success",
      description: "Item added to cart",
    })
  }

  const handleEditItem = (item: ICartItem) => {
    setEditingItem(item)
    setItemForm({ ...item })
    setShowAddItemForm(true)
  }

  const handleUpdateItem = () => {
    if (!editingItem || !itemForm.name || !itemForm.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in name and date",
        variant: "destructive",
      })
      return
    }

    const updatedItems = cartItems.map((item) =>
      item.id === editingItem.id
        ? { ...item, ...itemForm, price: Number(itemForm.price) || 0 }
        : item
    )

    setCartItems(updatedItems)
    resetItemForm()
    setShowAddItemForm(false)
    setEditingItem(null)

    toast({
      title: "Success",
      description: "Item updated successfully",
    })
  }

  const handleDeleteItem = (itemId: string) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId))
    toast({
      title: "Success",
      description: "Item removed from cart",
    })
  }

  const resetItemForm = () => {
    setItemForm({
      name: "",
      description: "",
      category: "activity",
      price: 0,
      currency: "USD",
      date: "",
      quantity: 1,
      // Common & Extended defaults
      location: "", duration: "", difficulty: "",
      startTime: "", endTime: "",
      flightNumber: "", airline: "",
      fromCity: "", toCity: "",
      checkIn: "", checkOut: "",
      hotelName: "", roomCategory: "",
      nights: 0,
      vehicleType: "", transferType: "private",
      mealType: "",
      subCategory: "", country: "", visaType: "", visaDuration: "",
      imageUrl: "", imageCaption: "",
      destinations: [], products: [], stopsList: [], additionalVehicles: [],
      amenities: [], highlights: [], stopLocations: [],
      checkinBags: 0, cabinBags: 0, numberOfStops: 0,
      adults: 2, children: 0, hotelRating: 0,
      serviceCharge: 0, giftAmount: 0, amount: 0, sumInsured: 0,
      noOfHours: 0, noOfDays: 0,
      pickupDrop: "pickup"
    })
  }

  // Helpers for Array State Management
  const handleArrayChange = (field: keyof ICartItem, index: number, value: any) => {
    const currentArray = (itemForm[field] as any[]) || []
    const newArray = [...currentArray]
    newArray[index] = value
    setItemForm(prev => ({ ...prev, [field]: newArray }))
  }

  const handleArrayAdd = (field: keyof ICartItem, initialValue: any = "") => {
    const currentArray = (itemForm[field] as any[]) || []
    setItemForm(prev => ({ ...prev, [field]: [...currentArray, initialValue] }))
  }

  const handleArrayRemove = (field: keyof ICartItem, index: number) => {
    const currentArray = (itemForm[field] as any[]) || []
    setItemForm(prev => ({ ...prev, [field]: currentArray.filter((_, i) => i !== index) }))
  }

  const handleObjectArrayChange = (field: keyof ICartItem, index: number, key: string, value: any) => {
    const currentArray = (itemForm[field] as any[]) || []
    const newArray = [...currentArray]
    newArray[index] = { ...newArray[index], [key]: value }
    setItemForm(prev => ({ ...prev, [field]: newArray }))
  }

  const handleSave = async () => {
    try {
      const itineraryData = {
        productId,
        title,
        description,
        type: "cart-combo",
        destination: "Multiple",
        duration: "Variable",
        totalPrice: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        currency: "USD",
        createdBy: "agent-user",
        lastUpdatedBy: "agent-user",
        countries: [],
        days: [],
        highlights: [],
        images: [],
        cartItems,
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
        toast({
          title: "Success",
          description: `Cart/Combo ${itineraryId ? "updated" : "created"} successfully`,
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save cart/combo",
        variant: "destructive",
      })
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0
      const quantity = Number(item.quantity) || 1
      return sum + (price * quantity)
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0
      return sum + quantity
    }, 0)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    const year = date.getFullYear()
    return { day, month, year }
  }

  // Sort cart items by date
  const sortedCartItems = [...cartItems].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Render item details based on category
  const renderItemDetails = (item: ICartItem) => {
    switch (item.category) {
      case "flight":
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <span className="font-medium">{item.fromCity || "N/A"}</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{item.toCity || "N/A"}</span>
            {item.airline && <span className="text-gray-500">• {item.airline}</span>}
          </div>
        )
      case "hotel":
        return (
          <div className="text-sm text-gray-700 mt-2">
            {item.hotelName && <p className="font-medium">{item.hotelName}</p>}
            {item.location && <p className="text-gray-600">{item.location}</p>}
          </div>
        )
      case "transfer":
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <span className="font-medium">{item.fromLocation || "N/A"}</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{item.toLocation || "N/A"}</span>
          </div>
        )
      case "activity":
        return (
          <div className="text-sm text-gray-700 mt-2">
            {item.location && <p className="text-gray-600">{item.location}</p>}
          </div>
        )
      case "ancillaries":
        return (
          <div className="text-sm text-gray-700 mt-2">
            {item.subCategory && <p className="capitalize font-medium">{item.subCategory}</p>}
            {item.visaType && <p>Type: {item.visaType}</p>}
          </div>
        )
      case "cruise":
        return (
          <div className="text-sm text-gray-700 mt-2">
            {item.location && <p className="font-medium">{item.location}</p>}
          </div>
        )
      case "image":
        return (
          <div className="text-sm text-gray-700 mt-2">
            {item.imageCaption && <p className="italic">{item.imageCaption}</p>}
          </div>
        )
      case "meal":
        return (
          <div className="text-sm text-gray-700 mt-2">
            {item.mealType && <span className="text-gray-600 capitalize">{item.mealType}</span>}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen relative">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Cart/Combo Builder</h1>
              <p className="text-sm text-gray-500">Build individual item collections</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)} disabled={cartItems.length === 0}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter cart/combo title" />
            </div>
            <div>
              <Label>Product ID</Label>
              <Input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Enter product ID" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cart Items Drop Zone */}
        <Card
          className="mb-6 border-2 border-dashed"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropZoneDrop}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart Items ({cartItems.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {sortedCartItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium mb-2">No items in cart</p>
                <p className="text-sm text-gray-500">Drag components from the right sidebar to add items</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedCartItems.map((item) => {
                  const IconComponent = CATEGORY_ICONS[item.category] || Package
                  const { day, month, year } = formatDate(item.date)
                  return (
                    <div
                      key={item.id}
                      className="border-2 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white"
                    >
                      <div className="flex items-center">
                        {/* Date Section - Left Side */}
                        <div className="flex-shrink-0 w-32 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 flex flex-col items-center justify-center h-full min-h-[120px]">
                          <div className="text-4xl font-black leading-none">{day}</div>
                          <div className="text-lg font-bold tracking-wider mt-1">{month}</div>
                          <div className="text-sm font-medium mt-1 opacity-90">{year}</div>
                        </div>

                        {/* Content Section - Middle */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900">{item.name}</h4>
                              {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                              {renderItemDetails(item)}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {item.category}
                                </Badge>
                                <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price and Actions - Right Side */}
                        <div className="flex-shrink-0 flex items-center gap-4 pr-4">
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-900">
                              {item.currency === "INR" ? "₹" : "$"}
                              {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                            </p>
                          </div>

                          <div className="h-12 w-px bg-gray-200" />

                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <GalleryUpload gallery={gallery} onGalleryUpdate={setGallery} />
          </CardContent>
        </Card>

        {/* Summary Card at Bottom */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="font-medium">Total Items:</span>
              <span className="font-bold text-blue-900">{getTotalItems()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-medium">Total Categories:</span>
              <span className="font-bold text-blue-900">
                {new Set(cartItems.map((item) => item.category)).size}
              </span>
            </div>
            <div className="border-t-2 border-blue-200 pt-3">
              <div className="flex justify-between text-xl">
                <span className="font-bold">Total Price:</span>
                <span className="font-black text-2xl text-blue-900">${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Sidebar */}
      <div
        className={`border-l bg-white flex flex-col h-screen transition-all duration-300 ${isSidebarMinimized ? "w-20" : "w-80"
          }`}
      >
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b flex-shrink-0 flex items-center justify-between">
              {!isSidebarMinimized && <h3 className="font-semibold text-lg">Components</h3>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="p-2"
                title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
              >
                {isSidebarMinimized ? <ChevronLeft className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 rotate-90" />}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className={`space-y-3 ${isSidebarMinimized ? "flex flex-col items-center" : ""}`}>
                {COMPONENT_TEMPLATES.map((component) => {
                  const Icon = component.icon
                  return (
                    <Card
                      key={component.category}
                      className={`${component.color} cursor-move hover:shadow-md transition-shadow ${isSidebarMinimized ? "w-12 h-12 flex items-center justify-center" : ""
                        }`}
                      draggable
                      onDragStart={() => handleComponentDragStart(component)}
                      title={isSidebarMinimized ? component.title : undefined}
                    >
                      <CardContent
                        className={isSidebarMinimized ? "p-0 flex items-center justify-center" : "p-3"}
                      >
                        {isSidebarMinimized ? (
                          <Icon className="h-5 w-5" />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{component.title}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Add/Edit Item Modal */}
      {showAddItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">{editingItem ? "Edit Item" : "Add New Item"}</h3>
            <div className="space-y-4">

              {/* Date is mandatory for Cart Items */}
              <div>
                <Label>
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={itemForm.date}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>

              {/* SHARED FORM ADAPTERS */}
              {itemForm.category === "flight" && (
                <FlightForms
                  manualTitle={itemForm.name || ""}
                  setManualTitle={(v: string) => setItemForm(p => ({ ...p, name: v }))}
                  manualPrice={itemForm.price || 0}
                  setManualPrice={(v: number | string) => setItemForm(p => ({ ...p, price: Number(v) }))}
                  manualCurrency={itemForm.currency || "USD"}
                  setManualCurrency={(v: string) => setItemForm(p => ({ ...p, currency: v }))}
                  manualDescription={itemForm.description || ""}
                  setManualDescription={(v: string) => setItemForm(p => ({ ...p, description: v }))}
                  // Specifics
                  manualFromCity={itemForm.fromCity || ""}
                  setManualFromCity={(v: string) => setItemForm(p => ({ ...p, fromCity: v }))}
                  manualToCity={itemForm.toCity || ""}
                  setManualToCity={(v: string) => setItemForm(p => ({ ...p, toCity: v }))}
                  manualAirline={itemForm.airline || ""}
                  setManualAirline={(v: string) => setItemForm(p => ({ ...p, airline: v }))}
                  manualFlightNumber={itemForm.flightNumber || ""}
                  setManualFlightNumber={(v: string) => setItemForm(p => ({ ...p, flightNumber: v }))}
                  manualTime={itemForm.startTime || ""}
                  setManualTime={(v: string) => setItemForm(p => ({ ...p, startTime: v }))}
                  manualEndTime={itemForm.endTime || ""}
                  setManualEndTime={(v: string) => setItemForm(p => ({ ...p, endTime: v }))}
                  manualClass={itemForm.flightClass || ""}
                  setManualClass={(v: string) => setItemForm(p => ({ ...p, flightClass: v }))}
                  manualDuration={itemForm.duration || ""}
                  setManualDuration={(v: string) => setItemForm(p => ({ ...p, duration: v }))}
                  // Extended Fields
                  manualCheckinBags={itemForm.checkinBags || 0}
                  setManualCheckinBags={(v) => setItemForm(p => ({ ...p, checkinBags: Number(v) }))}
                  manualCheckinBagWeight={itemForm.checkinBagWeight || ""}
                  setManualCheckinBagWeight={(v) => setItemForm(p => ({ ...p, checkinBagWeight: v }))}
                  manualCabinBags={itemForm.cabinBags || 0}
                  setManualCabinBags={(v) => setItemForm(p => ({ ...p, cabinBags: Number(v) }))}
                  manualCabinBagWeight={itemForm.cabinBagWeight || ""}
                  setManualCabinBagWeight={(v) => setItemForm(p => ({ ...p, cabinBagWeight: v }))}
                  manualNumberOfStops={itemForm.numberOfStops || 0}
                  setManualNumberOfStops={(v) => {
                    const currentLocations = itemForm.stopLocations || []
                    let newLocs = currentLocations
                    if (v > currentLocations.length) {
                      newLocs = [...currentLocations, ...Array(v - currentLocations.length).fill("")]
                    } else if (v < currentLocations.length) {
                      newLocs = currentLocations.slice(0, v)
                    }
                    setItemForm(p => ({ ...p, numberOfStops: v, stopLocations: newLocs }))
                  }}
                  manualStopLocations={itemForm.stopLocations || []}
                  handleAddStopLocation={() => handleArrayAdd("stopLocations", "")}
                  handleRemoveStopLocation={(idx) => handleArrayRemove("stopLocations", idx)}
                  handleStopLocationChange={(idx, v) => handleArrayChange("stopLocations", idx, v)}
                  manualBookingId={itemForm.bookingId || ""}
                  setManualBookingId={(v) => setItemForm(p => ({ ...p, bookingId: v }))}
                  manualSeatNumber={itemForm.seatNumber || ""}
                  setManualSeatNumber={(v) => setItemForm(p => ({ ...p, seatNumber: v }))}
                  manualInFlightMeals={itemForm.inFlightMeals || ""}
                  setManualInFlightMeals={(v) => setItemForm(p => ({ ...p, inFlightMeals: v }))}
                  manualRefundable={itemForm.refundable || ""}
                  setManualRefundable={(v) => setItemForm(p => ({ ...p, refundable: v }))}
                  manualPnr={itemForm.pnr || ""}
                  setManualPnr={(v) => setItemForm(p => ({ ...p, pnr: v }))}
                  manualAmenities={itemForm.amenities || []}
                  setManualAmenities={(v) => setItemForm(p => ({ ...p, amenities: v }))}
                  manualImageUrl={itemForm.imageUrl || ""}
                  setManualImageUrl={(v) => setItemForm(p => ({ ...p, imageUrl: v }))}
                />
              )}

              {itemForm.category === "hotel" && (
                <HotelForms
                  manualTitle={itemForm.name || ""}
                  setManualTitle={(v: string) => setItemForm(p => ({ ...p, name: v }))}
                  manualHotelName={itemForm.hotelName || itemForm.name || ""}
                  setManualHotelName={(v: string) => setItemForm(p => ({ ...p, hotelName: v }))}
                  manualPrice={itemForm.price || 0}
                  setManualPrice={(v: number | "") => setItemForm(p => ({ ...p, price: Number(v) }))}
                  manualCurrency={itemForm.currency || "USD"}
                  setManualCurrency={(v: string) => setItemForm(p => ({ ...p, currency: v }))}
                  // Specifics
                  manualLocation={itemForm.location || ""}
                  setManualLocation={(v: string) => setItemForm(p => ({ ...p, location: v }))}
                  manualRoomCategory={itemForm.roomCategory || ""}
                  setManualRoomCategory={(v: string) => setItemForm(p => ({ ...p, roomCategory: v }))}
                  manualCheckIn={itemForm.checkIn || ""}
                  setManualCheckIn={(v: string) => setItemForm(p => ({ ...p, checkIn: v }))}
                  manualCheckOut={itemForm.checkOut || ""}
                  setManualCheckOut={(v: string) => setItemForm(p => ({ ...p, checkOut: v }))}
                  manualNights={itemForm.nights === 0 || itemForm.nights ? itemForm.nights : ""}
                  setManualNights={(v: number | "") => setItemForm(p => ({ ...p, nights: v === "" ? 0 : v }))}
                  // Extended Fields
                  manualAdults={itemForm.adults !== undefined ? itemForm.adults : ""}
                  setManualAdults={(v) => setItemForm(p => ({ ...p, adults: Number(v) }))}
                  manualChildren={itemForm.children !== undefined ? itemForm.children : ""}
                  setManualChildren={(v) => setItemForm(p => ({ ...p, children: Number(v) }))}
                  manualHotelRating={itemForm.hotelRating !== undefined ? itemForm.hotelRating : ""}
                  setManualHotelRating={(v) => setItemForm(p => ({ ...p, hotelRating: Number(v) }))}
                  manualAddress={itemForm.address || ""}
                  setManualAddress={(v) => setItemForm(p => ({ ...p, address: v }))}
                  manualImageUrl={itemForm.imageUrl || ""}
                  setManualImageUrl={(v) => setItemForm(p => ({ ...p, imageUrl: v }))}
                  manualRefundable={itemForm.refundable || ""}
                  setManualRefundable={(v) => setItemForm(p => ({ ...p, refundable: v }))}
                  manualHotelLink={itemForm.hotelLink || ""}
                  setManualHotelLink={(v) => setItemForm(p => ({ ...p, hotelLink: v }))}
                  manualDescription={itemForm.description || ""}
                  setManualDescription={(v) => setItemForm(p => ({ ...p, description: v }))}
                  manualConfirmationNumber={itemForm.confirmationNumber || ""}
                  setManualConfirmationNumber={(v) => setItemForm(p => ({ ...p, confirmationNumber: v }))}
                  manualAmenities={itemForm.amenities || []}
                  handleAddManualAmenity={() => handleArrayAdd("amenities", "")}
                  handleRemoveManualAmenity={(idx) => handleArrayRemove("amenities", idx)}
                  handleManualAmenitiesChange={(idx, v) => handleArrayChange("amenities", idx, v)}
                  manualHighlights={itemForm.highlights || []}
                  handleAddManualHighlight={() => handleArrayAdd("highlights", "")}
                  handleRemoveManualHighlight={(idx) => handleArrayRemove("highlights", idx)}
                  handleManualHighlightsChange={(idx, v) => handleArrayChange("highlights", idx, v)}
                  manualMealPlan={itemForm.mealPlan || ""}
                  setManualMealPlan={(v) => setItemForm(p => ({ ...p, mealPlan: v }))}
                  manualPropertyType={itemForm.propertyType || ""}
                  setManualPropertyType={(v) => setItemForm(p => ({ ...p, propertyType: v }))}
                />
              )}

              {itemForm.category === "activity" && (
                <ActivityForms
                  manualTitle={itemForm.name || ""}
                  setManualTitle={(v: string) => setItemForm(p => ({ ...p, name: v }))}
                  manualPrice={itemForm.price || 0}
                  setManualPrice={(v: number | string) => setItemForm(p => ({ ...p, price: Number(v) }))}
                  manualCurrency={itemForm.currency || "USD"}
                  setManualCurrency={(v: string) => setItemForm(p => ({ ...p, currency: v }))}
                  manualDescription={itemForm.description || ""}
                  setManualDescription={(v: string) => setItemForm(p => ({ ...p, description: v }))}
                  // Specifics
                  manualLocation={itemForm.location || ""}
                  setManualLocation={(v: string) => setItemForm(p => ({ ...p, location: v }))}
                  manualDuration={itemForm.duration || ""}
                  setManualDuration={(v: string) => setItemForm(p => ({ ...p, duration: v }))}
                />
              )}

              {itemForm.category === "meal" && (
                <MealForms
                  manualMeals={itemForm.name ? [itemForm.name] : []}
                  setManualMeals={(v: string[]) => setItemForm(p => ({ ...p, name: v[0] || "", mealType: v[0] || "" }))}
                  manualPrice={itemForm.price || 0}
                  setManualPrice={(v: number | "") => setItemForm(p => ({ ...p, price: Number(v) }))}
                  manualCurrency={itemForm.currency || "USD"}
                  setManualCurrency={(v: string) => setItemForm(p => ({ ...p, currency: v }))}
                  manualCustomMealDescription={itemForm.description || ""}
                  setManualCustomMealDescription={(v: string) => setItemForm(p => ({ ...p, description: v }))}
                />
              )}

              {itemForm.category === "transfer" && (
                <>
                  <div className="mb-4">
                    <Label>Sub Category</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={itemForm.subCategory || "airport-transfer"}
                      onChange={(e) => setItemForm(p => ({ ...p, subCategory: e.target.value }))}
                    >
                      {Object.entries(transferSubCategories).map(([key, labelItem]) => (
                        <option key={key} value={key}>{labelItem.label}</option>
                      ))}
                    </select>
                  </div>
                  <TransferForms
                    selectedSubCategory={itemForm.subCategory || "airport-transfer"}
                    manualTitle={itemForm.name || ""}
                    setManualTitle={(v: string) => setItemForm(p => ({ ...p, name: v }))}
                    manualPrice={itemForm.price || 0}
                    setManualPrice={(v: number | "") => setItemForm(p => ({ ...p, price: Number(v) }))}
                    manualCurrency={itemForm.currency || "USD"}
                    setManualCurrency={(v: string) => setItemForm(p => ({ ...p, currency: v }))}
                    manualDescription={itemForm.description || ""}
                    setManualDescription={(v: string) => setItemForm(p => ({ ...p, description: v }))}
                    // Specifics
                    manualFromCity={itemForm.fromLocation || ""}
                    setManualFromCity={(v: string) => setItemForm(p => ({ ...p, fromLocation: v }))}
                    manualToCity={itemForm.toLocation || ""}
                    setManualToCity={(v: string) => setItemForm(p => ({ ...p, toLocation: v }))}
                    manualVehicleType={itemForm.vehicleType || ""}
                    setManualVehicleType={(v: string) => setItemForm(p => ({ ...p, vehicleType: v }))}
                    // Required Defaults - Now Mapped
                    manualPickupDrop={itemForm.pickupDrop || "pickup"}
                    setManualPickupDrop={(v: any) => setItemForm(p => ({ ...p, pickupDrop: v }))}
                    manualAirportName={itemForm.airportName || ""}
                    setManualAirportName={(v) => setItemForm(p => ({ ...p, airportName: v }))}
                    manualTransferType={itemForm.transferType || "private"}
                    setManualTransferType={(v: any) => setItemForm(p => ({ ...p, transferType: v }))}
                    manualVehicleCapacity={itemForm.capacity !== undefined ? itemForm.capacity : ""}
                    setManualVehicleCapacity={(v) => setItemForm(p => ({ ...p, capacity: Number(v) }))}
                    manualPricePerPax={itemForm.price || ""} // Using base price for now
                    manualStopsList={itemForm.stopsList || []}
                    handleAddStop={() => handleArrayAdd("stopsList", "")}
                    handleRemoveStop={(idx) => handleArrayRemove("stopsList", idx)}
                    handleStopChange={(idx, v) => handleArrayChange("stopsList", idx, v)}
                    manualAdditionalVehicles={itemForm.additionalVehicles || []}
                    handleAddVehicle={() => handleArrayAdd("additionalVehicles", { vehicleType: "", capacity: 0, price: 0 })}
                    handleRemoveVehicle={(idx) => handleArrayRemove("additionalVehicles", idx)}
                    handleVehicleChange={(idx, f, v) => handleObjectArrayChange("additionalVehicles", idx, f, v)}
                    manualPickupTime={itemForm.pickupTime || ""}
                    setManualPickupTime={(v) => setItemForm(p => ({ ...p, pickupTime: v }))}
                    manualDropTime={itemForm.dropTime || ""}
                    setManualDropTime={(v) => setItemForm(p => ({ ...p, dropTime: v }))}
                    manualNoOfHours={itemForm.noOfHours !== undefined ? itemForm.noOfHours : ""}
                    setManualNoOfHours={(v) => setItemForm(p => ({ ...p, noOfHours: Number(v) }))}
                    manualNoOfDays={itemForm.noOfDays !== undefined ? itemForm.noOfDays : ""}
                    setManualNoOfDays={(v) => setItemForm(p => ({ ...p, noOfDays: Number(v) }))}
                    // Extended Fields
                    manualCarType={itemForm.vehicleType || ""}
                    setManualCarType={(v) => setItemForm(p => ({ ...p, vehicleType: v }))}
                    manualFuelType={itemForm.fuelType || ""}
                    setManualFuelType={(v) => setItemForm(p => ({ ...p, fuelType: v }))}
                    manualCarModel={itemForm.carModel || ""}
                    setManualCarModel={(v) => setItemForm(p => ({ ...p, carModel: v }))}
                    manualTransmission={itemForm.transmission || ""}
                    setManualTransmission={(v) => setItemForm(p => ({ ...p, transmission: v }))}
                    manualTravelDuration={itemForm.duration || ""}
                    setManualTravelDuration={(v) => setItemForm(p => ({ ...p, duration: v }))}
                    manualDepartureTime={itemForm.startTime || ""}
                    setManualDepartureTime={(v) => setItemForm(p => ({ ...p, startTime: v }))}
                    manualArrivalTime={itemForm.endTime || ""}
                    setManualArrivalTime={(v) => setItemForm(p => ({ ...p, endTime: v }))}
                    manualClass={itemForm.transferClass || ""}
                    setManualClass={(v) => setItemForm(p => ({ ...p, transferClass: v }))}
                    manualBusNumber={itemForm.busNumber || ""}
                    setManualBusNumber={(v) => setItemForm(p => ({ ...p, busNumber: v }))}
                    manualTrainNumber={itemForm.trainNumber || ""}
                    setManualTrainNumber={(v) => setItemForm(p => ({ ...p, trainNumber: v }))}
                    manualPnr={itemForm.pnr || ""}
                    setManualPnr={(v) => setItemForm(p => ({ ...p, pnr: v }))}
                    manualRefundable={itemForm.refundable || ""}
                    setManualRefundable={(v) => setItemForm(p => ({ ...p, refundable: v }))}
                    manualLink={itemForm.transferLink || ""}
                    setManualLink={(v) => setItemForm(p => ({ ...p, transferLink: v }))}
                    manualAmenities={itemForm.amenities || []}
                    setManualAmenities={(v) => setItemForm(p => ({ ...p, amenities: v }))}
                  />
                </>
              )}

              {itemForm.category === "ancillaries" && (
                <>
                  <div className="mb-4">
                    <Label>Sub Category</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={itemForm.subCategory || "visa"}
                      onChange={(e) => setItemForm(p => ({ ...p, subCategory: e.target.value }))}
                    >
                      {Object.entries(ancillariesSubCategories).map(([key, labelItem]) => (
                        <option key={key} value={key}>{labelItem.label}</option>
                      ))}
                    </select>
                  </div>
                  <AncillariesForms
                    selectedSubCategory={itemForm.subCategory || "visa"}
                    manualTitle={itemForm.name || ""}
                    setManualTitle={(v: string) => setItemForm(p => ({ ...p, name: v }))}
                    manualPrice={itemForm.price || 0}
                    setManualPrice={(v: number | "") => setItemForm(p => ({ ...p, price: Number(v) }))}
                    manualCurrency={itemForm.currency || "USD"}
                    setManualCurrency={(v: string) => setItemForm(p => ({ ...p, currency: v }))}
                    // Ancillaries specifics
                    manualVisaType={itemForm.visaType || ""}
                    setManualVisaType={(v: string) => setItemForm(p => ({ ...p, visaType: v }))}
                    manualCountry={itemForm.country || ""}
                    setManualCountry={(v: string) => setItemForm(p => ({ ...p, country: v }))}
                    // Mapped Fields
                    manualVisaDuration={itemForm.visaDuration || ""}
                    setManualVisaDuration={(v) => setItemForm(p => ({ ...p, visaDuration: v }))}
                    manualServiceFee={itemForm.serviceCharge !== undefined ? itemForm.serviceCharge : ""}
                    setManualServiceFee={(v) => setItemForm(p => ({ ...p, serviceCharge: Number(v) }))}
                    manualTotalFee={""} // Calculated usually?
                    manualLengthOfStay={itemForm.lengthOfStay || ""}
                    setManualLengthOfStay={(v) => setItemForm(p => ({ ...p, lengthOfStay: v }))}
                    manualEntryMethod={itemForm.entryMethod || ""}
                    setManualEntryMethod={(v) => setItemForm(p => ({ ...p, entryMethod: v }))}
                    manualDepartureDate={itemForm.departureDate || ""}
                    setManualDepartureDate={(v) => setItemForm(p => ({ ...p, departureDate: v }))}
                    manualReturnDate={itemForm.returnDate || ""}
                    setManualReturnDate={(v) => setItemForm(p => ({ ...p, returnDate: v }))}
                    manualForexCurrency={itemForm.forexCurrency || "USD"}
                    setManualForexCurrency={(v) => setItemForm(p => ({ ...p, forexCurrency: v }))}
                    manualBaseCurrency={itemForm.baseCurrency || "INR"}
                    setManualBaseCurrency={(v) => setItemForm(p => ({ ...p, baseCurrency: v }))}
                    manualAmount={itemForm.amount !== undefined ? itemForm.amount : ""}
                    setManualAmount={(v) => setItemForm(p => ({ ...p, amount: Number(v) }))}
                    manualDestinations={itemForm.destinations || []}
                    handleAddDestination={() => handleArrayAdd("destinations", "")}
                    handleRemoveDestination={(idx) => handleArrayRemove("destinations", idx)}
                    handleDestinationChange={(idx, v) => handleArrayChange("destinations", idx, v)}
                    manualStartDate={itemForm.startDate || ""}
                    setManualStartDate={(v) => setItemForm(p => ({ ...p, startDate: v }))}
                    manualEndDate={itemForm.endDate || ""}
                    setManualEndDate={(v) => setItemForm(p => ({ ...p, endDate: v }))}
                    manualNoOfTravellers={itemForm.noOfTravellers || 1}
                    setManualNoOfTravellers={(v) => setItemForm(p => ({ ...p, noOfTravellers: Number(v) }))}
                    manualInsuranceType={itemForm.insuranceType || ""}
                    setManualInsuranceType={(v) => setItemForm(p => ({ ...p, insuranceType: v }))}
                    manualSumInsured={itemForm.sumInsured !== undefined ? itemForm.sumInsured : ""}
                    setManualSumInsured={(v) => setItemForm(p => ({ ...p, sumInsured: Number(v) }))}
                    manualNotes={itemForm.insuranceNotes || ""}
                    setManualNotes={(v) => setItemForm(p => ({ ...p, insuranceNotes: v }))}
                  />
                </>
              )}

              {itemForm.category === "image" && (
                <ImageForms
                  manualTitle={itemForm.name || ""}
                  setManualTitle={(v: string) => setItemForm(p => ({ ...p, name: v }))}
                  manualImageUrl={itemForm.imageUrl || ""}
                  setManualImageUrl={(v: string) => setItemForm(p => ({ ...p, imageUrl: v }))}
                  manualImageCaption={itemForm.imageCaption || ""}
                  setManualImageCaption={(v: string) => setItemForm(p => ({ ...p, imageCaption: v }))}
                />
              )}

              {itemForm.category === "cruise" && (
                <CruiseForms
                  manualTitle={itemForm.name || ""}
                  setManualTitle={(v: string) => setItemForm(p => ({ ...p, name: v }))}
                  manualDescription={itemForm.description || ""}
                  setManualDescription={(v: string) => setItemForm(p => ({ ...p, description: v }))}
                  manualLocation={itemForm.location || ""}
                  setManualLocation={(v: string) => setItemForm(p => ({ ...p, location: v }))}
                  manualTime={itemForm.startTime || ""}
                  setManualTime={(v: string) => setItemForm(p => ({ ...p, startTime: v }))}
                  manualPrice={itemForm.price || 0}
                  setManualPrice={(v: number | string) => setItemForm(p => ({ ...p, price: Number(v) }))}
                  manualCurrency={itemForm.currency || "USD"}
                  setManualCurrency={(v: string) => setItemForm(p => ({ ...p, currency: v }))}
                  manualHighlights={itemForm.highlights || []}
                  handleAddHighlight={() => handleArrayAdd("highlights", "")}
                  handleRemoveHighlight={(idx) => handleArrayRemove("highlights", idx)}
                  handleHighlightChange={(idx, v) => handleArrayChange("highlights", idx, v)}
                />
              )}

              {itemForm.category === "other" && (
                <>
                  <div className="mb-4">
                    <Label>Sub Category</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={itemForm.subCategory || "custom"}
                      onChange={(e) => setItemForm(p => ({ ...p, subCategory: e.target.value }))}
                    >
                      {Object.entries(othersSubCategories).map(([key, labelItem]) => (
                        <option key={key} value={key}>{labelItem.label}</option>
                      ))}
                    </select>
                  </div>
                  <OthersForms
                    selectedSubCategory={itemForm.subCategory || "custom"}
                    manualTitle={itemForm.name || ""}
                    setManualTitle={(v: string) => setItemForm(p => ({ ...p, name: v }))}
                    manualCurrency={itemForm.currency || "USD"}
                    setManualCurrency={(v: string) => setItemForm(p => ({ ...p, currency: v }))}
                    // Others specific defaults
                    manualGiftAmount={itemForm.giftAmount !== undefined ? itemForm.giftAmount : (itemForm.price || 0)}
                    setManualGiftAmount={(v: number | "") => setItemForm(p => ({ ...p, giftAmount: Number(v), price: Number(v) }))}
                    manualServiceCharge={itemForm.serviceCharge !== undefined ? itemForm.serviceCharge : ""}
                    setManualServiceCharge={(v) => setItemForm(p => ({ ...p, serviceCharge: Number(v) }))}
                    manualProducts={itemForm.products || []}
                    handleAddProduct={() => handleArrayAdd("products", { name: "", price: 0, description: "" })}
                    handleRemoveProduct={(idx) => handleArrayRemove("products", idx)}
                    handleProductChange={(idx, f, v) => handleObjectArrayChange("products", idx, f, v)}
                  />
                </>
              )}

            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddItemForm(false)
                  setEditingItem(null)
                  resetItemForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
                {editingItem ? "Update" : "Add"} Item
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ... existing preview code ... */}
          {/* REUSING EXISTING PREVIEW CODE (Collapsed for brevity in thought process but included in execution) */}
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{productId}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              {description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{description}</p>
                </div>
              )}

              {/* Cart Items by Date */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Package Contents
                </h3>

                {/* Group items by date */}
                {(() => {
                  const itemsByDate = sortedCartItems.reduce((acc, item) => {
                    if (!acc[item.date]) {
                      acc[item.date] = []
                    }
                    acc[item.date].push(item)
                    return acc
                  }, {} as Record<string, ICartItem[]>)

                  return Object.entries(itemsByDate).map(([date, items]) => {
                    const { day, month, year } = formatDate(date)
                    return (
                      <div key={date} className="space-y-3">
                        {/* Date Header */}
                        <div className="flex items-center gap-3 pb-2 border-b-2 border-blue-200">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black">{day}</span>
                              <span className="text-sm font-bold">{month}</span>
                              <span className="text-xs opacity-75">{year}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {items.length} {items.length === 1 ? "item" : "items"}
                          </div>
                        </div>

                        {/* Items for this date */}
                        <div className="space-y-3 pl-4">
                          {items.map((item) => {
                            const IconComponent = CATEGORY_ICONS[item.category] || Package
                            return (
                              <div
                                key={item.id}
                                className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-colors bg-white"
                              >
                                {/* Icon */}
                                <div className={`p-3 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other} flex-shrink-0`}>
                                  <IconComponent className="h-6 w-6" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-lg text-gray-900">{item.name}</h4>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  )}

                                  {/* Category-specific details */}
                                  <div className="mt-2 text-sm text-gray-700">
                                    {/* Simplified View Logic for Preview - can extend later */}
                                    {renderItemDetails(item)}
                                  </div>

                                  {/* Meta info */}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs capitalize">
                                      {item.category}
                                    </Badge>
                                    {item.quantity > 1 && (
                                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xl font-black text-gray-900">
                                    {item.currency === "INR" ? "₹" : "$"}
                                    {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>

              {/* Gallery Preview */}
              {gallery.length > 0 && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-xl font-bold text-gray-900">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.caption || `Gallery image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200 space-y-3">
                <h3 className="text-lg font-bold text-blue-900">Package Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-blue-900">{getTotalItems()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {new Set(cartItems.map((item) => item.category)).size}
                    </p>
                  </div>
                </div>
                <div className="border-t-2 border-blue-200 pt-3">
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-3xl font-black text-blue-900">${getTotalPrice().toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end">
              <Button onClick={() => setShowPreview(false)}>Close Preview</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
