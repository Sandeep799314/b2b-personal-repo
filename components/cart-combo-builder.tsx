"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
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
  Loader2,
  Check,
  Info,
  Copy,
  Share2,
  Download,
  Moon,
  LayoutGrid,
  Users,
  Calendar,
  Clock,
  Luggage,
  MapPin
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

const PREVIEW_CATEGORIES: Record<string, { label: string; icon: string; color: string; border: string; text: string }> = {
  flight: { label: "Flight", icon: "✈", color: "#E6F1FB", border: "#378ADD", text: "#0C447C" },
  hotel: { label: "Hotel", icon: "🏨", color: "#EAF3DE", border: "#639922", text: "#27500A" },
  activity: { label: "Activity", icon: "🎯", color: "#FAEEDA", border: "#BA7517", text: "#633806" },
  transfer: { label: "Transfer", icon: "🚗", color: "#EEEDFE", border: "#7F77DD", text: "#3C3489" },
  meal: { label: "Meal", icon: "🍴", color: "#FAECE7", border: "#D85A30", text: "#712B13" },
  cruise: { label: "Cruise", icon: "🚢", color: "#E1F5EE", border: "#1D9E75", text: "#085041" },
  ancillaries: { label: "Ancillaries", icon: "📋", color: "#FBEAF0", border: "#D4537E", text: "#72243E" },
}

const getCatMeta = (item: ICartItem) => {
  const m = []
  if (item.category === "flight") {
    // Flight remains as is per user request
    if (item.airline) m.push({ k: "Airline", v: item.airline })
    if (item.flightNumber) m.push({ k: "Flight No", v: item.flightNumber })
    if (item.fromCity && item.toCity) m.push({ k: "Route", v: `${item.fromCity} → ${item.toCity}` })
    if (item.startTime) m.push({ k: "Dep. Time", v: item.startTime })
  }
  if (item.category === "hotel") {
    if (item.hotelName) m.push({ k: "Property", v: item.hotelName })
    if (item.roomCategory) m.push({ k: "Room", v: item.roomCategory })
    if (item.location) m.push({ k: "Location", v: item.location })
    if (item.nights) m.push({ k: "Duration", v: `${item.nights} Nights` })
    if (item.adults) m.push({ k: "Pax", v: `${item.adults}A ${item.children || 0}C` })
    if (item.mealPlan) m.push({ k: "Meal Plan", v: item.mealPlan })
    if (item.propertyType) m.push({ k: "Type", v: item.propertyType })
    if (item.hotelRating) m.push({ k: "Rating", v: `${item.hotelRating}★` })
    if (item.confirmationNumber) m.push({ k: "Conf. No", v: item.confirmationNumber })
    if (item.address) m.push({ k: "Address", v: item.address })
  }
  if (item.category === "transfer") {
    if (item.fromLocation && item.toLocation) m.push({ k: "Route", v: `${item.fromLocation} → ${item.toLocation}` })
    if (item.vehicleType) m.push({ k: "Vehicle", v: item.vehicleType })
    if (item.carModel) m.push({ k: "Model", v: item.carModel })
    if (item.transferType) m.push({ k: "Type", v: item.transferType })
    if (item.pickupTime) m.push({ k: "Pickup", v: item.pickupTime })
    if (item.dropTime) m.push({ k: "Drop", v: item.dropTime })
    if (item.fuelType) m.push({ k: "Fuel", v: item.fuelType })
    if (item.transmission) m.push({ k: "Transmission", v: item.transmission })
    if (item.pnr) m.push({ k: "Ref/PNR", v: item.pnr })
  }
  if (item.category === "activity") {
    if (item.location) m.push({ k: "Location", v: item.location })
    if (item.duration) m.push({ k: "Duration", v: item.duration })
    if (item.startTime) m.push({ k: "Starts", v: item.startTime })
    if (item.difficulty) m.push({ k: "Level", v: item.difficulty })
  }
  if (item.category === "meal") {
    if (item.mealType) m.push({ k: "Meal", v: item.mealType })
    if (item.startTime) m.push({ k: "Time", v: item.startTime })
    if (item.location) m.push({ k: "Venue", v: item.location })
  }
  if (item.category === "ancillaries") {
    if (item.subCategory) m.push({ k: "Category", v: item.subCategory })
    if (item.country) m.push({ k: "Country", v: item.country })
    if (item.visaType) m.push({ k: "Visa Type", v: item.visaType })
    if (item.visaDuration) m.push({ k: "Validity", v: item.visaDuration })
    if (item.entryMethod) m.push({ k: "Entry", v: item.entryMethod })
    if (item.insuranceProvider) m.push({ k: "Provider", v: item.insuranceProvider })
    if (item.policyNumber) m.push({ k: "Policy", v: item.policyNumber })
  }
  if (item.category === "other") {
    if (item.subCategory) m.push({ k: "Type", v: item.subCategory })
    if (item.giftAmount) m.push({ k: "Value", v: item.giftAmount })
  }
  return m
}

function CartItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  showPrice,
  currency = "INR" 
}: { 
  item: ICartItem, 
  onEdit: (item: ICartItem) => void, 
  onDelete: (id: string) => void,
  showPrice: boolean,
  currency?: string
}) {
  const cat = PREVIEW_CATEGORIES[item.category] || PREVIEW_CATEGORIES.activity;
  const meta = getCatMeta(item);
  const IconComponent = CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS] || Package;
  const [isHovered, setIsHovered] = useState(false);

  const formatCurrencyValue = (amount: number, curr: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Parse date
  const dateObj = new Date(item.date + "T00:00:00")
  const day = dateObj.getDate()
  const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" })

  const isFlight = item.category === "flight"
  const hasOffer = item.originalPrice && item.originalPrice > item.price

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative border rounded-[14px] bg-white transition-all duration-200 group overflow-hidden h-[190px] flex items-stretch"
      style={{
        borderColor: isHovered ? cat.border : "#eee",
        boxShadow: isHovered ? "0 4px 20px rgba(0,0,0,0.07)" : "none",
      }}
    >
      {/* Date Section - Professional Vertical Strip */}
      <div 
        className="w-[70px] flex-shrink-0 border-r flex flex-col items-center justify-center py-4 shadow-[inset_-1px_0_0_rgba(0,0,0,0.05)]"
        style={{
          background: 'linear-gradient(135deg, #FDB931 0%, #E7A500 100%)',
          borderColor: '#D4AF37'
        }}
      >
        <div className="text-[10px] font-black text-amber-950/70 uppercase tracking-[0.15em] mb-1">{weekday}</div>
        <div className="text-[30px] font-black text-amber-950 leading-none tracking-tighter drop-shadow-sm">{day}</div>
        <div className="text-[11px] font-black text-amber-900 uppercase tracking-[0.2em] mt-1">{month}</div>
      </div>

      {/* Action buttons */}
      <div className={cn(
        "absolute top-3 right-3 flex gap-1.5 transition-opacity duration-200 z-30",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <button 
          onClick={() => onEdit(item)}
          className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors shadow-sm"
        >
          <Edit className="w-3.5 h-3.5 text-neutral-600" />
        </button>
        <button 
          onClick={() => onDelete(item.id)}
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 flex items-stretch overflow-hidden">
        {isFlight ? (
          /* PREMIUM FLIGHT LAYOUT */
          <div className="flex-1 flex flex-col bg-white">
            {/* Airline Header */}
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center text-white shadow-sm overflow-hidden">
                  <span className="text-[10px] font-black italic transform -skew-x-12 tracking-tighter">AI</span>
                </div>
                <div>
                  <h5 className="text-[13px] font-black text-neutral-800 tracking-tight leading-none uppercase">
                    {item.airline || "Air India"}
                  </h5>
                  <p className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-widest">
                    {item.flightNumber || "AI-101"} • {item.flightClass || "ECONOMY"}
                  </p>
                </div>
              </div>
            </div>

            {/* Flight Path Visualization */}
            <div className="px-6 py-4 flex items-center justify-between relative flex-1">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] flex flex-col items-center">
                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.15em] mb-1">{item.duration || "DIRECT"}</span>
                <div className="w-full flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-neutral-200" />
                  <div className="flex-1 h-[1px] border-t border-dashed border-neutral-300" />
                  <Plane className="h-5 w-5 text-neutral-400 rotate-90" />
                  <div className="flex-1 h-[1px] border-t border-dashed border-neutral-300" />
                  <div className="h-2 w-2 rounded-full border border-neutral-300" />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[26px] font-black text-neutral-800 leading-none tracking-tight">
                  {item.fromCity?.substring(0, 3).toUpperCase() || "DEL"}
                </span>
                <span className="text-[14px] font-bold text-neutral-900 mt-1">{item.startTime || "00:00"}</span>
              </div>

              <div className="flex flex-col items-end text-right">
                <span className="text-[26px] font-black text-neutral-800 leading-none tracking-tight">
                  {item.toCity?.substring(0, 3).toUpperCase() || "DXB"}
                </span>
                <span className="text-[14px] font-bold text-neutral-900 mt-1">{item.endTime || "00:00"}</span>
              </div>
            </div>

            {/* Footer Details & Price */}
            <div className="mt-auto bg-neutral-50/50 px-5 py-2.5 flex items-center justify-between border-t border-neutral-100">
               <div className="flex items-center gap-6">
                 {item.pnr && (
                   <div className="flex flex-col">
                     <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">PNR</span>
                     <span className="text-[10px] font-black text-neutral-800 uppercase">{item.pnr}</span>
                   </div>
                 )}
                 {item.checkinBagWeight && (
                   <div className="flex flex-col">
                     <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Baggage</span>
                     <span className="text-[10px] font-black text-neutral-800 uppercase">{item.checkinBagWeight}</span>
                   </div>
                 )}
               </div>
               
               <div className="flex items-center gap-4">
                 {item.offerTag && (
                    <div className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                      {item.offerTag}
                    </div>
                  )}
                 {showPrice && (
                    <div className="flex flex-col items-end">
                      {hasOffer && (
                        <span className="text-[9px] text-neutral-400 line-through font-medium leading-none mb-1">
                          {formatCurrencyValue(item.originalPrice! * (item.quantity || 1), currency)}
                        </span>
                      )}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-tighter">
                          {formatCurrencyValue(Number(item.price) || 0, currency)} × {item.quantity} =
                        </span>
                        <span className="text-[20px] font-black text-neutral-900 leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                          {formatCurrencyValue((Number(item.price) || 0) * (Number(item.quantity) || 1), currency)}
                        </span>
                      </div>
                    </div>
                 )}
               </div>
            </div>
          </div>
        ) : (
          /* NEW STYLISH PROFESSIONAL LAYOUT (Hotel, Activity, Transfer, etc.) */
          <div className="flex-1 flex flex-col bg-white">
            {/* Professional Header Strip */}
            <div className="px-5 py-2 flex items-center justify-between border-b border-neutral-50" style={{ background: `${cat.color}20` }}>
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm border"
                  style={{ backgroundColor: cat.color, borderColor: `${cat.border}40` }}
                >
                  <IconComponent className="w-4 h-4" style={{ color: cat.text }} />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: cat.text }}>
                  {cat.label}
                </span>
              </div>
              {item.location && (
                <div className="flex items-center gap-1 text-neutral-400">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-bold truncate max-w-[150px] uppercase tracking-tighter">{item.location}</span>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="p-5 flex-1 flex flex-col">
              <h4 className="text-[20px] text-neutral-900 font-bold leading-tight mb-4 pr-12" style={{ fontFamily: 'Georgia, serif' }}>
                {item.name || item.hotelName || 'Untitled Service'}
              </h4>

              {/* Structured Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6">
                {meta.filter(m => m.k !== "Location" && m.k !== "Property").map((m, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{m.k}</span>
                    <span className="text-[12px] text-neutral-800 font-black tracking-tight">{m.v}</span>
                  </div>
                ))}
              </div>

              {item.description && (
                <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2 mt-4 italic border-l-2 border-neutral-100 pl-3">
                  {item.description}
                </p>
              )}
            </div>

            {/* Price Footer */}
            {showPrice && (
              <div className="bg-neutral-50/50 px-5 py-2.5 border-t border-neutral-100 flex items-center justify-end gap-4">
                {item.offerTag && (
                  <div className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm">
                    {item.offerTag}
                  </div>
                )}
                <div className="flex flex-col items-end">
                  {hasOffer && (
                    <span className="text-[9px] text-neutral-400 line-through font-medium leading-none mb-1">
                      {formatCurrencyValue(item.originalPrice! * (item.quantity || 1), currency)}
                    </span>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-tight">
                      {formatCurrencyValue(Number(item.price) || 0, currency)} × {item.quantity} =
                    </span>
                    <span className="text-[22px] font-black text-neutral-900 leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                      {formatCurrencyValue((Number(item.price) || 0) * (Number(item.quantity) || 1), currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  
  // New states for the Action Toggles Block
  const [viewMode, setViewMode] = useState<'itinerary' | 'all-inclusions'>('itinerary')
  const [isDetailedView, setIsDetailedView] = useState(true)
  const [showDates, setShowDates] = useState(true)
  const [pricingEnabled, setPricingEnabled] = useState(true)
  const [pricingCurrency, setPricingCurrency] = useState('INR')
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false)
  const [pricingRooms, setPricingRooms] = useState(1)
  const [pricingAdults, setPricingAdults] = useState(2)
  const [pricingChildren, setPricingChildren] = useState(0)
  const [pricingNationality, setPricingNationality] = useState("Indian")
  const [pricingStartDate, setPricingStartDate] = useState("")
  const [pricingEndDate, setPricingEndDate] = useState("")

  const handleCreateCopy = () => {
    toast({
      title: "Coming Soon",
      description: "Copying cart/combo will be available soon.",
    })
  }

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

  const handlePreview = () => {
    const previewData = {
      title,
      description,
      productId,
      cartItems,
      gallery,
      totalPrice: getTotalPrice(),
      currency: "USD", // Default, can be improved to use item currency if mixed
      itineraryId,
    }
    localStorage.setItem("cart-combo-preview", JSON.stringify(previewData))
    window.open("/cart-combo/preview", "_blank")
  }

  // Check for view mode from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const mode = params.get('mode')
      if (mode === 'view' && cartItems.length > 0) {
        handlePreview()
      }
    }
  }, [cartItems.length])

  // Load existing cart data if editing
  useEffect(() => {
    if (itineraryId) {
      loadCartData()
    }
  }, [itineraryId])

  // Chatbot event listeners
  useEffect(() => {
    const handleChatbotAddEvent = (e: any) => {
      const { eventData } = e.detail;
      console.log("[DEBUG] Chatbot adding item to cart:", eventData);
      
      const newItem: ICartItem = {
        ...eventData,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: `${productId}-${cartItems.length + 1}`,
        addedAt: new Date(),
        quantity: eventData.quantity || 1,
        price: Number(eventData.price) || 0,
        date: eventData.date || new Date().toISOString().split('T')[0], // Cart items need a date
      }

      setCartItems(prev => [...prev, newItem]);
      
      toast({
        title: "Item Added",
        description: `${eventData.title || eventData.name} added to cart by AI Assistant`,
      });
    };

    const handleChatbotUpdateTitle = (e: any) => {
      const { title: newTitle } = e.detail;
      if (newTitle) {
        setTitle(newTitle);
        toast({
          title: "Title Updated",
          description: `Cart/Combo title changed to "${newTitle}"`,
        });
      }
    };

    const handleChatbotSave = async (e: any) => {
      const { exitAfterSave } = e.detail || {};
      await handleSave();
      if (exitAfterSave && onBack) {
        onBack();
      }
    };

    const handleChatbotExit = () => {
      if (onBack) {
        onBack();
      }
    };

    window.addEventListener("chatbot-add-event", handleChatbotAddEvent);
    window.addEventListener("chatbot-update-title", handleChatbotUpdateTitle);
    window.addEventListener("chatbot-save", handleChatbotSave);
    window.addEventListener("chatbot-exit", handleChatbotExit);
    
    return () => {
      window.removeEventListener("chatbot-add-event", handleChatbotAddEvent);
      window.removeEventListener("chatbot-update-title", handleChatbotUpdateTitle);
      window.removeEventListener("chatbot-save", handleChatbotSave);
      window.removeEventListener("chatbot-exit", handleChatbotExit);
    };
  }, [productId, cartItems.length, onBack]);

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
    setIsSaving(true)
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
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 2000)
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
    } finally {
      setIsSaving(false)
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
  const sortedCartItems = useMemo(() => {
    return [...cartItems].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }, [cartItems])

  // Group items by date for the new layout
  const groupedItems = useMemo(() => {
    return sortedCartItems.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = []
      acc[item.date].push(item)
      return acc
    }, {} as Record<string, ICartItem[]>)
  }, [sortedCartItems])

  return (
    <div className="flex flex-col lg:flex-row h-screen relative overflow-x-hidden bg-[#f8fafc]">
      {/* Mobile Sticky Header - ONLY visible on mobile */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Editor Mode</span>
          <h1 className="text-sm font-bold text-neutral-800 truncate max-w-[180px]">{title || "Untitled Cart/Combo"}</h1>
        </div>
        <div className="flex items-center gap-2">
           <Button 
            onClick={handleSave} 
            disabled={isSaving}
            size="sm"
            className={`${showSaved ? 'bg-green-600' : 'bg-[#2D7CEA]'} text-white rounded-full px-4 h-8 text-xs font-bold shadow-lg shadow-blue-500/20`}
          >
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : showSaved ? <Check className="h-3 w-3 mr-1.5" /> : <Save className="h-3 w-3 mr-1.5" />}
            {isSaving ? "..." : showSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#f8fafc] max-w-[1200px] mx-auto w-full">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg bg-neutral-100 border border-neutral-200 border-b-0 text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">
          <ShoppingCart className="h-3 w-3 text-neutral-400" />
          Cart/Combo Builder
        </div>

        {/* Professional Header Card */}
        <div className="bg-white rounded-xl rounded-tl-none shadow-sm border border-neutral-200 mb-6 p-4 relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
            <div className="flex flex-1 items-start">
              <div className="flex-1 space-y-1">
                {/* Title Section */}
                <div className="group relative">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Cart/Combo Title"
                    className="w-full text-xl lg:text-2xl font-black border-none p-0 bg-transparent focus:outline-none focus:ring-0 leading-tight placeholder:text-neutral-200 transition-all"
                    style={{ fontWeight: 900 }}
                  />
                  <div className="h-0.5 w-full bg-neutral-100 mt-1 group-focus-within:bg-blue-400 transition-colors" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={cartItems.length === 0}
                className="h-9 px-4 text-xs font-bold border-neutral-200 text-neutral-600 hover:bg-neutral-50 shadow-sm"
              >
                <Eye className="mr-2 h-3.5 w-3.5" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className={`${
                  showSaved ? "bg-green-600 hover:bg-green-700" : "bg-[#2D7CEA] hover:bg-[#1e63c7]"
                } text-white shadow-md transition-all duration-300 px-5 h-9 text-xs font-bold`}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : showSaved ? (
                  <Check className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <Save className="mr-2 h-3.5 w-3.5" />
                )}
                {isSaving ? "Saving..." : showSaved ? "Saved" : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
            <div className="lg:col-span-4 bg-neutral-50 rounded-lg p-2 border border-neutral-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                Product ID
              </label>
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-neutral-400" />
                <Input
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Enter product ID"
                  className="flex-1 border-none p-0 h-auto text-xs font-semibold bg-transparent focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="lg:col-span-8 bg-neutral-50 rounded-lg p-2 border border-neutral-100 focus-within:border-blue-200 focus-within:bg-white transition-all">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                Description
              </label>
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-neutral-400" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description..."
                  rows={1}
                  className="flex-1 border-none p-0 h-auto text-xs font-medium bg-transparent focus-visible:ring-0 resize-none placeholder:text-neutral-300 custom-scrollbar"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Toggles Block - Tab-like for Mobile */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-4 p-2 lg:p-3 overflow-x-auto custom-scrollbar flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-6 min-w-max">
            {/* Itinerary / Item-wise Group */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100/50 rounded-xl">
              <Button
                variant={viewMode === "itinerary" ? "white" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 text-[10px] lg:text-xs font-bold px-4 rounded-lg transition-all",
                  viewMode === "itinerary" ? "bg-white shadow-sm text-black" : "text-black",
                )}
                onClick={() => setViewMode("itinerary")}
              >
                Itinerary
              </Button>
              <Button
                variant={viewMode === "all-inclusions" ? "white" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 text-[10px] lg:text-xs font-bold px-4 rounded-lg transition-all",
                  viewMode === "all-inclusions" ? "bg-white shadow-sm text-black" : "text-black",
                )}
                onClick={() => setViewMode("all-inclusions")}
              >
                Item-wise
              </Button>
            </div>

            {/* Details Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailsModalOpen(true)}
              className="h-8 px-3 text-[10px] lg:text-xs font-bold text-black hover:bg-neutral-100 rounded-lg flex items-center gap-1.5 border border-neutral-200"
            >
              <span className="hidden sm:inline-block">
                <Info className="h-3.5 w-3.5" />
              </span>
              Details
            </Button>

            {/* Switch Group: Detailed, Dates, Pricing */}
            <div className="flex items-center gap-4 lg:gap-6 border-l border-neutral-200 pl-4 lg:pl-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="detailed-v"
                  checked={isDetailedView}
                  onCheckedChange={setIsDetailedView}
                  className="scale-75"
                />
                <label htmlFor="detailed-v" className="text-[10px] font-bold text-black uppercase">
                  Detailed
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="dates-v" checked={showDates} onCheckedChange={setShowDates} className="scale-75" />
                <label htmlFor="dates-v" className="text-[10px] font-bold text-black uppercase">
                  Dates
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="pricing-v"
                  checked={pricingEnabled}
                  onCheckedChange={(v) => {
                    setPricingEnabled(Boolean(v))
                    if (v) setPricingDialogOpen(true)
                  }}
                  className="scale-75"
                />
                <label htmlFor="pricing-v" className="text-[10px] font-bold text-black uppercase">
                  Pricing
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 lg:gap-2 ml-4">
            <select
              value={pricingCurrency}
              onChange={(e) => {
                const newCurrency = e.target.value
                setPricingCurrency(newCurrency)
              }}
              className="h-8 bg-white border border-neutral-200 text-[10px] lg:text-xs font-bold text-black rounded-lg px-2 outline-none cursor-pointer hover:bg-neutral-50"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="AED">د.إ AED</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateCopy}
              disabled={isSaving}
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
              title="Copy"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreview}
              disabled={isGeneratingPreview}
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
              title="Preview"
            >
              {isGeneratingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            </Button>
            <div className="w-px h-4 bg-neutral-200 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Pricing Info Display Row */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-4 p-2 lg:p-3 overflow-x-auto custom-scrollbar flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-6 min-w-max">
            {/* Pax & Room Info */}
            <div className="flex items-center gap-2 p-1 bg-neutral-100/50 rounded-xl px-3 h-9">
              <div className="flex items-center gap-1.5 border-r border-neutral-200 pr-3 mr-1">
                <Building2 className="h-3.5 w-3.5 text-neutral-500" />
                <span className="text-[10px] lg:text-xs font-bold text-black uppercase">
                  {pricingRooms} {pricingRooms === 1 ? "Room" : "Rooms"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-[10px] lg:text-xs font-bold text-black uppercase">{pricingAdults} Adults</span>
                </div>
                {pricingChildren > 0 && (
                  <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-3">
                    <span className="text-[10px] lg:text-xs font-bold text-black uppercase">
                      {pricingChildren} Children
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nationality & Currency */}
            <div className="flex items-center gap-4 lg:gap-6 border-l border-neutral-200 pl-4 lg:pl-6 h-9">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Nationality:</span>
                <Badge
                  variant="outline"
                  className="bg-blue-50/50 text-blue-700 border-blue-100 text-[10px] font-bold uppercase"
                >
                  {pricingNationality}
                </Badge>
              </div>
              <div className="flex items-center gap-2 border-l border-neutral-200 pl-4 lg:pl-6">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Currency:</span>
                <Badge
                  variant="outline"
                  className="bg-emerald-50/50 text-emerald-700 border-emerald-100 text-[10px] font-bold uppercase"
                >
                  {pricingCurrency}
                </Badge>
              </div>
            </div>
          </div>

          {/* Pricing Dates */}
          <div className="flex items-center gap-4 border-l border-neutral-200 pl-4 h-9">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Travel Dates:</span>
              <span className="text-[10px] lg:text-xs font-bold text-black uppercase">
                {pricingStartDate
                  ? new Date(pricingStartDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Set Date"}
                {pricingEndDate &&
                  ` - ${new Date(pricingEndDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPricingDialogOpen(true)}
              className="h-7 w-7 p-0 hover:bg-neutral-100 rounded-full"
            >
              <Edit className="h-3.5 w-3.5 text-neutral-400" />
            </Button>
          </div>
        </div>

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
            {cartItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium mb-2">No items in cart</p>
                <p className="text-sm text-gray-500">Drag components from the right sidebar to add items</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {sortedCartItems.map((item) => (
                  <CartItemCard 
                    key={item.id} 
                    item={item} 
                    onEdit={handleEditItem} 
                    onDelete={handleDeleteItem}
                    showPrice={pricingEnabled}
                    currency={pricingCurrency}
                  />
                ))}
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
    </div>
  )
}
