import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Tent,
  Info,
  CreditCard,
  Wallet,
  ArrowLeft,
  Plus,
  Save,
  Eye,
  Sun,
  Calendar,
  Users,
  DollarSign,
  GripVertical,
  Plane,
  UtensilsCrossed,
  Car,
  MapPin,
  Camera,
  Check,
  FileText,
  Shield,
  Train,
  Ship,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Moon,
  StickyNote,
  Trash2,
  Briefcase,
  Copy,
  Share2,
  Download,
  Phone,
  MessageCircle,
  Mail,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EventCard } from "./event-card"
import { DayTitle } from "./day-title"
import { DayMeals } from "./day-meals"
import { DateCalendarCard } from "./date-calendar-card"
import { EditEventModal } from "./edit-event-modal"
// Library sidebar, integration panel and usage stats removed from builder
import { ComponentSourceModal } from "./component-source-modal"

import { GalleryUpload } from "./gallery-upload"
import { PreviewConfigModal, PreviewConfig } from "../preview-config-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import type { IItineraryDay, IItineraryEvent, IGalleryItem } from "@/models/Itinerary"
import { LibraryToItineraryConverter } from "@/lib/library-converter"
import { ItineraryDetailsModal } from "./itinerary-details-modal"
// library hook removed for builder
import { useItineraries } from "@/hooks/use-itineraries"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { calculateComponentPrice, calculateTotalPrice, PricingConfig } from "@/lib/pricing-calculator"
import { QuotationPricingControls } from "@/components/quotation-pricing-controls"
import { QuotationPricingOptions } from "@/models/Quotation"
import { UserWallet } from "../user-wallet"

// Country options removed

interface ItineraryBuilderProps {
  itineraryId?: string
  quotationId?: string
  mode?: "itinerary" | "quotation"
  onBack: () => void
  onSave?: (data?: any) => Promise<void>
  extraActions?: React.ReactNode
  onHasChangesChange?: (hasChanges: boolean) => void
  readOnly?: boolean
  initialDays?: IItineraryDay[]
  initialPricingOptions?: QuotationPricingOptions
  initialTitle?: string
  initialDescription?: string
  initialCountries?: string[]
  initialProductReferenceCode?: string
  initialProductId?: string
  initialBranding?: any
  initialGallery?: IGalleryItem[]
  initialOverviewEvents?: IItineraryEvent[]
  initialServiceSlots?: any[]
  initialNotes?: string
  initialHighlights?: string[]
  initialImages?: string[]
  initialType?: string
  initialCartItems?: any[]
  initialHtmlContent?: string
  initialHtmlBlocks?: any[]
  hideWallet?: boolean
}

const EMPTY_DAY: IItineraryDay = {
  day: 1,
  date: new Date().toISOString().split("T")[0],
  title: "",
  description: "",
  detailedDescription: "",
  events: [],
  nights: 0,
  meals: {
    breakfast: false,
    lunch: false,
    dinner: false,
  },
}



const COMPONENT_TEMPLATES = [
  {
    category: "flight",
    title: "Flight",
    icon: Plane,
    color: "bg-orange-50 border-orange-200",
  },
  {
    category: "transfer",
    title: "Transfer",
    icon: Car,
    color: "bg-purple-50 border-purple-200",
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
    category: "meal",
    title: "Meals",
    icon: UtensilsCrossed,
    color: "bg-yellow-50 border-yellow-200",
  },




  {
    category: "cruise",
    title: "Cruise",
    icon: Ship,
    color: "bg-cyan-50 border-cyan-200",
  },
  {
    category: "visa",
    title: "Visa Service",
    icon: FileText,
    color: "bg-red-50 border-red-200",
  },
  {
    category: "insurance",
    title: "Insurance",
    icon: Shield,
    color: "bg-emerald-50 border-emerald-200",
  },

  {
    category: "ancillaries",
    title: "Ancillaries",
    icon: CreditCard,
    color: "bg-amber-50 border-amber-200",
  },
  {
    category: "others",
    title: "Others",
    icon: Briefcase,
    color: "bg-slate-50 border-slate-200",
  },
  {
    category: "note",
    title: "Notes",
    icon: StickyNote,
    color: "bg-yellow-100 border-yellow-300",
  },
  {
    category: "additionalInformation",
    title: "Additional Information",
    icon: Info,
    color: "bg-indigo-100 border-indigo-300",
  },
]

export const ItineraryBuilder = forwardRef<any, ItineraryBuilderProps>(
  ({ itineraryId, quotationId, mode = "itinerary", onBack, onSave, extraActions, onHasChangesChange, readOnly = false, initialDays, initialPricingOptions, initialTitle, initialDescription, initialCountries, initialProductReferenceCode, initialProductId, initialBranding, initialGallery, initialOverviewEvents, initialServiceSlots, initialNotes, initialHighlights, initialImages, initialType, initialCartItems, initialHtmlContent, initialHtmlBlocks, hideWallet = false }, ref) => {
  // library items disabled in this builder
  const { createItinerary, updateItinerary } = useItineraries()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const isNewMode = searchParams.get('mode') === 'new'
  const itineraryTypeParam = searchParams.get('type') || 'customized-package'
  const [currentItineraryId, setCurrentItineraryId] = useState<string | null>(itineraryId || null)

  // All state declarations in one place
  const [days, setDays] = useState<IItineraryDay[]>(initialDays || [{ ...EMPTY_DAY, events: [] }])
  
  // Sync state when initial props change (e.g. version change)
  useEffect(() => {
    if (initialDays && initialDays.length > 0) {
      setDays(initialDays)
      // When switching versions in quotation mode, reset initial load flag
      // so that other effects don't think we're still loading
      isInitialLoad.current = false
      setHasChanges(false)
    }
  }, [initialDays])

  useEffect(() => {
    if (initialPricingOptions) {
      setQuotationPricingOptions(initialPricingOptions)
    }
  }, [initialPricingOptions])

  useEffect(() => {
    if (initialTitle !== undefined) {
      setTitle(initialTitle || "")
    }
  }, [initialTitle])

  useEffect(() => {
    if (initialDescription !== undefined) {
      setDescription(initialDescription || "")
    }
  }, [initialDescription])

  useEffect(() => {
    if (initialCountries !== undefined) {
      setCountries(initialCountries || [])
    }
  }, [initialCountries])

  useEffect(() => {
    if (initialProductReferenceCode !== undefined) {
      setProductReferenceCode(initialProductReferenceCode || "")
    }
  }, [initialProductReferenceCode])

  useEffect(() => {
    if (initialProductId !== undefined) {
      setProductId(initialProductId || "")
    }
  }, [initialProductId])

  useEffect(() => {
    if (initialBranding !== undefined) {
      setBranding(initialBranding || {})
    }
  }, [initialBranding])

  useEffect(() => {
    if (initialGallery !== undefined) {
      setGallery(initialGallery || [])
    }
  }, [initialGallery])

  useEffect(() => {
    if (initialOverviewEvents !== undefined) {
      setOverviewEvents(initialOverviewEvents || [])
    }
  }, [initialOverviewEvents])

  useEffect(() => {
    if (initialServiceSlots !== undefined) {
      setServiceSlots(initialServiceSlots || [])
    }
  }, [initialServiceSlots])

  useEffect(() => {
    if (initialNotes !== undefined) {
      setNotes(initialNotes || "")
    }
  }, [initialNotes])

  useEffect(() => {
    if (initialHighlights !== undefined) {
      setHighlights(initialHighlights || [])
    }
  }, [initialHighlights])

  useEffect(() => {
    if (initialImages !== undefined) {
      setImages(initialImages || [])
    }
  }, [initialImages])

  useEffect(() => {
    if (initialType !== undefined) {
      setItineraryType(initialType || "customized-package")
    }
  }, [initialType])

  useEffect(() => {
    if (initialCartItems !== undefined) {
      setCartItems(initialCartItems || [])
    }
  }, [initialCartItems])

  useEffect(() => {
    if (initialHtmlContent !== undefined) {
      setHtmlContent(initialHtmlContent || "")
    }
  }, [initialHtmlContent])

  useEffect(() => {
    if (initialHtmlBlocks !== undefined) {
      setHtmlBlocks(initialHtmlBlocks || [])
    }
  }, [initialHtmlBlocks])
  const [title, setTitle] = useState(initialTitle || "New Itinerary")
  const [description, setDescription] = useState(initialDescription || "")
  const [isDetailedView, setIsDetailedView] = useState(true)
  const [showDates, setShowDates] = useState(true)
  const [serviceSlots, setServiceSlots] = useState<Array<{ id: string; title: string; events: IItineraryEvent[] }>>(initialServiceSlots || [])
  const [overviewEvents, setOverviewEvents] = useState<IItineraryEvent[]>(initialOverviewEvents || [])

  const [editingEvent, setEditingEvent] = useState<{
    event: IItineraryEvent
    dayIndex: number
    eventIndex: number
  } | null>(null)
  const [productId, setProductId] = useState(`ITN-${Date.now().toString(36).toUpperCase()}`)
  const [productReferenceCode, setProductReferenceCode] = useState(initialProductReferenceCode || "")
  const [branding, setBranding] = useState<any>(initialBranding || {})
  const [countries, setCountries] = useState<string[]>(initialCountries || [])
  const [countryError, setCountryError] = useState<string>("")
  const [gallery, setGallery] = useState<IGalleryItem[]>(initialGallery || [])
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set())

  // Pricing toggle & modal state
  const [pricingEnabled, setPricingEnabled] = useState<boolean>(false)
  const [pricingDialogOpen, setPricingDialogOpen] = useState<boolean>(false)
  const [pricingAdults, setPricingAdults] = useState<number>(2)
  const [pricingChildren, setPricingChildren] = useState<number>(0)
  const [pricingRooms, setPricingRooms] = useState<number>(1)
  const [pricingNationality, setPricingNationality] = useState<string>('Indian')
  const [pricingCurrency, setPricingCurrency] = useState<string>('INR')
  // Pricing mode: 'individual' (includes total) or 'total-only'
  const [pricingMode, setPricingMode] = useState<'individual' | 'total-only'>('individual')
  // Pricing dates
  const [pricingStartDate, setPricingStartDate] = useState<string>("")
  // pricingEndDate is now derived from pricingStartDate + days.length
  const [pricingEndDate, setPricingEndDate] = useState<string>("")

  // Manual total pricing
  const [useManualTotal, setUseManualTotal] = useState<boolean>(false)
  const [manualTotalPrice, setManualTotalPrice] = useState<string>("")

  // Quotation specific state
  const [quotationPricingOptions, setQuotationPricingOptions] = useState<QuotationPricingOptions>({
    markupType: "percentage",
    markupValue: 0,
    showIndividualPrices: true,
    showSubtotals: true,
    showTotal: true,
    currency: "USD",
    finalTotalPrice: 0,
    originalTotalPrice: 0
  })

  // Update pricingEndDate whenever pricingStartDate or days change
  useEffect(() => {
    if (pricingStartDate && days.length > 0) {
      const start = new Date(pricingStartDate)
      const end = new Date(start)
      end.setDate(start.getDate() + (days.length - 1))
      setPricingEndDate(end.toISOString().split('T')[0])
    } else {
      setPricingEndDate("")
    }
  }, [pricingStartDate, days.length])

  // Duplicate name dialog
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateDialogMessage, setDuplicateDialogMessage] = useState("")

  // Validation error dialog
  const [validationErrorOpen, setValidationErrorOpen] = useState(false)
  const [validationErrorMessage, setValidationErrorMessage] = useState("")

  // Delete day confirmation dialog
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deletingDayIndex, setDeletingDayIndex] = useState<number | null>(null)

  const [highlightOptions, setHighlightOptions] = useState<string[]>([])
  const [newHighlight, setNewHighlight] = useState<string>("")
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [guestDetails, setGuestDetails] = useState<any>({})
  const [agencyDetails, setAgencyDetails] = useState<any>({})
  const [headerFooter, setHeaderFooter] = useState<any>({})

  const [viewMode, setViewMode] = useState<'itinerary' | 'all-inclusions'>('itinerary')
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Markup state
  const [markupType, setMarkupType] = useState<"percentage" | "amount">("amount")
  const [markupValue, setMarkupValue] = useState<number>(0)
  const [itineraryType, setItineraryType] = useState<string>(initialType || itineraryTypeParam || "customized-package")
  const [cartItems, setCartItems] = useState<any[]>(initialCartItems || [])
  const [htmlContent, setHtmlContent] = useState<string>(initialHtmlContent || "")
  const [htmlBlocks, setHtmlBlocks] = useState<any[]>(initialHtmlBlocks || [])
  const [notes, setNotes] = useState<string>(initialNotes || "")
  const [highlights, setHighlights] = useState<string[]>(initialHighlights || [])
  const [images, setImages] = useState<string[]>(initialImages || [])

  useImperativeHandle(ref, () => ({
    save: handleSave,
    handleBackWithCheck,
    hasChanges
  }))
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const isInitialLoad = useRef(true)

  // Chatbot event listeners
  useEffect(() => {
    const handleChatbotAddEvent = (e: any) => {
      const { dayIndex, eventData } = e.detail;
      console.log("[DEBUG] Chatbot adding event to day:", dayIndex, eventData);
      
      if (dayIndex < 0 || dayIndex >= days.length) {
        console.error("Invalid day index for chatbot event");
        return;
      }

      const newDays = [...days];
      const newEvent = {
        id: `event-${Date.now()}`,
        ...eventData,
        componentSource: "manual",
        versionHistory: [
          {
            timestamp: new Date(),
            action: "created",
            source: "chatbot",
          },
        ],
      };

      newDays[dayIndex].events = [...newDays[dayIndex].events, newEvent];
      setDays(newDays);
      setHasChanges(true);
      if (onHasChangesChange) onHasChangesChange(true);
      
      // Auto-save after AI addition if we have an itineraryId
      if (currentItineraryId) {
        autoSave(newDays);
      }

      toast({
        title: "Event Added",
        description: `${eventData.title} added to Day ${dayIndex + 1} by AI Assistant`,
      });
    };

    const handleChatbotUpdateTitle = (e: any) => {
      const { title: newTitle } = e.detail;
      if (newTitle) {
        setTitle(newTitle);
        setHasChanges(true);
        if (onHasChangesChange) onHasChangesChange(true);
        toast({
          title: "Title Updated",
          description: `Itinerary title changed to "${newTitle}"`,
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

    window.addEventListener("chatbot-add-event", handleChatbotAddEvent)
    window.addEventListener("chatbot-update-title", handleChatbotUpdateTitle)
    window.addEventListener("chatbot-save", handleChatbotSave)
    window.addEventListener("chatbot-exit", handleChatbotExit)
    
    return () => {
      window.removeEventListener("chatbot-add-event", handleChatbotAddEvent)
      window.removeEventListener("chatbot-update-title", handleChatbotUpdateTitle)
      window.removeEventListener("chatbot-save", handleChatbotSave)
      window.removeEventListener("chatbot-exit", handleChatbotExit)
    }
  }, [days, onHasChangesChange, title, currentItineraryId, onBack])

  // Browser-level navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasChanges])

  // Load existing itinerary data when editing
  useEffect(() => {
    const loadItineraryData = async () => {
      // If we're in quotation mode and have initialDays, skip internal fetch
      if (mode === "quotation" && initialDays && initialDays.length > 0) {
        console.log("[DEBUG] Quotation mode with initialDays, skipping internal fetch")
        isInitialLoad.current = false
        return
      }

      if (itineraryId) {
        // Skip if we already have this itinerary loaded (e.g. after a save)
        if (currentItineraryId === itineraryId && !isInitialLoad.current) {
          console.log("[DEBUG] Itinerary already loaded, skipping fetch:", itineraryId)
          return
        }

        setCurrentItineraryId(itineraryId)
        try {
          console.log("[DEBUG] Loading itinerary data for ID:", itineraryId)
          
          // Basic validation for MongoDB ObjectId format or shared IDs
          if (itineraryId === "undefined" || itineraryId === "null" || !itineraryId) {
            console.error("[v0] Invalid itinerary ID provided:", itineraryId)
            if (!isInitialLoad.current) return; // Don't redirect if it's just a transient state
            
            toast({
              title: "Error",
              description: "Invalid itinerary ID. Redirecting...",
              variant: "destructive",
            })
            isInitialLoad.current = false
            setTimeout(() => router.push("/itinerary"), 2000)
            return
          }

          const response = await fetch(`/api/itineraries/${itineraryId}`)
          if (response.ok) {
            const itineraryData = await response.json()

            console.log("[DEBUG] Loaded itinerary data:", itineraryData)
            // Populate all state with loaded data
            setTitle(itineraryData.title || "")
            setDescription(itineraryData.description || "")
            setProductId(itineraryData.productId || "")
            setProductReferenceCode(itineraryData.productReferenceCode || "")
            
            // Handle meals format (array to object conversion for the builder UI)
            const processedDays = (itineraryData.days || []).map((day: any) => {
              const mealsObj = { breakfast: false, lunch: false, dinner: false }
              if (Array.isArray(day.meals)) {
                day.meals.forEach((m: string) => {
                  if (m === 'breakfast') mealsObj.breakfast = true
                  if (m === 'lunch') mealsObj.lunch = true
                  if (m === 'dinner') mealsObj.dinner = true
                })
              }
              return { ...day, meals: mealsObj }
            })

            setDays(processedDays.length > 0 ? processedDays : [{ ...EMPTY_DAY, events: [] }])
            setCountries(itineraryData.countries || [])
            setGallery(itineraryData.gallery || [])
            setMarkupType(itineraryData.markupType || "amount")
            setMarkupValue(itineraryData.markupValue || 0)
            
            if (itineraryData.branding && Object.keys(itineraryData.branding).length > 0) {
              setBranding(itineraryData.branding)
            } else {
              // Fetch global settings if no branding on itinerary
              try {
                const settingsRes = await fetch("/api/settings")
                if (settingsRes.ok) {
                  const settingsData = await settingsRes.json()
                  if (settingsData.branding) {
                    setBranding(settingsData.branding)
                  }
                }
              } catch (err) {
                console.error("Failed to fetch global branding defaults:", err)
              }
            }
            setCurrentItineraryId(
              itineraryData._id ? itineraryData._id.toString() : itineraryId ?? null,
            )
            // Load overview events if they exist
            setOverviewEvents(itineraryData.overviewEvents || [])
            // Load service slots (Additional Information) if they exist
            setServiceSlots(itineraryData.serviceSlots || [])
            setGuestDetails(itineraryData.guestDetails || {})
            setAgencyDetails(itineraryData.agencyDetails || {})
            setHeaderFooter(itineraryData.headerFooter || {})
            setItineraryType(itineraryData.type || "customized-package")
            setCartItems(itineraryData.cartItems || [])
            setHtmlContent(itineraryData.htmlContent || "")
            setHtmlBlocks(itineraryData.htmlBlocks || [])
            setNotes(itineraryData.notes || "")
            setHighlights(itineraryData.highlights || [])
            setImages(itineraryData.images || [])

            console.log("[v0] Loaded itinerary data for editing:", itineraryData)
            
            // Mark initial load as done after data is set
            setTimeout(() => {
              isInitialLoad.current = false
              setHasChanges(false)
            }, 500)
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error("[v0] Failed to load itinerary data:", response.statusText, errorData)
            
            // Only show error if it's the initial load or a real ID
            if (isInitialLoad.current) {
              toast({
                title: "Loading Failed",
                description: errorData.error || "Failed to load itinerary data. It might have been deleted.",
                variant: "destructive",
              })
              isInitialLoad.current = false
              if (response.status === 404) {
                setTimeout(() => router.push("/itinerary"), 2000)
              }
            }
          }
        } catch (error) {
          console.error("[v0] Error loading itinerary data:", error)
          if (isInitialLoad.current) {
            toast({
              title: "Error",
              description: "An unexpected error occurred while loading the itinerary.",
              variant: "destructive",
            })
            isInitialLoad.current = false
          }
        }
      } else if (isNewMode) {
        // Initialize with setup data from URL parameters for new itineraries
        const numDays = parseInt(searchParams.get('days') || '1')
        const itineraryName = searchParams.get('name') || 'New Itinerary'
        const newProductId = searchParams.get('productId') || productId

        const initialDays = Array.from({ length: numDays }, (_, index) => ({
          ...EMPTY_DAY,
          day: index + 1,
          title: "",
          date: new Date(new Date().setDate(new Date().getDate() + index)).toISOString().split("T")[0],
          events: [],
        }))

        setDays(initialDays)
        setTitle(itineraryName)
        setProductId(newProductId)
        const refCode = searchParams.get('productReferenceCode') || ''
        setProductReferenceCode(refCode)

        // Fetch global branding defaults for new itinerary
        try {
          const settingsRes = await fetch("/api/settings")
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json()
            if (settingsData.branding) {
              setBranding(settingsData.branding)
            }
          }
        } catch (err) {
          console.error("Failed to fetch global branding defaults:", err)
        }

        // Remove the query parameters
        router.replace('/itinerary/builder')
        setCurrentItineraryId(null)
        
        // Mark initial load as done
        setTimeout(() => {
          isInitialLoad.current = false
          setHasChanges(false)
        }, 500)
      } else {
        isInitialLoad.current = false
      }
    }

    loadItineraryData()
  }, [itineraryId, isNewMode, router, productId])

  // Monitor state changes to set hasChanges
  useEffect(() => {
    // Skip setting hasChanges if it's initial load
    if (isInitialLoad.current) return

    // Skip setting hasChanges if it's already true to avoid unnecessary updates
    if (!hasChanges) {
      setHasChanges(true)
    }
  }, [title, description, days, countries, gallery, branding, serviceSlots, overviewEvents, productReferenceCode])

  useEffect(() => {
    if (onHasChangesChange) {
      onHasChangesChange(hasChanges)
    }
  }, [hasChanges, onHasChangesChange])

  const handleBackWithCheck = () => {
    if (hasChanges) {
      setShowExitConfirm(true)
    } else {
      onBack()
    }
  }

  const handleConfirmExit = (saveFirst: boolean) => {
    setShowExitConfirm(false)
    if (saveFirst) {
      handleSave().then(() => {
        onBack()
      })
    } else {
      setHasChanges(false) // Reset to avoid double prompt
      onBack()
    }
  }

  // Load quotation data if in quotation mode
  useEffect(() => {
    const loadQuotationData = async () => {
      if (mode === 'quotation' && quotationId) {
        try {
          const response = await fetch(`/api/quotations/${quotationId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.pricingOptions) {
              setQuotationPricingOptions(data.pricingOptions)
              if (data.pricingOptions.currency) {
                setPricingCurrency(data.pricingOptions.currency)
              }
            }
          }
        } catch (error) {
          console.error("Error loading quotation data:", error)
        }
      }
    }
    loadQuotationData()
  }, [mode, quotationId])

  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [showPreviewConfig, setShowPreviewConfig] = useState(false)
  const [activeSidebar, setActiveSidebar] = useState<"components" | "library">("components")
  const [draggedItem, setDraggedItem] = useState<{
    type: "component" | "event" | "library-item"
    item: any
    sourceDay?: number
    sourceIndex?: number
  } | null>(null)
  const [dropTarget, setDropTarget] = useState<{ dayIndex: number; position: number } | null>(null)
  const [componentSourceModal, setComponentSourceModal] = useState<{
    isOpen: boolean
    component: any
    dropTarget: { dayIndex: number; position: number } | null
  }>({
    isOpen: false,
    component: null,
    dropTarget: null,
  })

  // library statistics removed

  const toggleHighlight = (highlight: string) => {
    if (highlightOptions.includes(highlight)) {
      if (days.some(day => day.events.some(event => event.highlights?.includes(highlight)))) {
        // Remove highlight from all events
        const newDays = days.map(day => {
          const newEvents = day.events.map(event => {
            const highlights = event.highlights || []
            return {
              ...event,
              highlights: highlights.filter(h => h !== highlight),
            }
          })
          return { ...day, events: newEvents }
        })
        setDays(newDays)
      } else {
        // Add highlight to all events
        const newDays = days.map(day => {
          const newEvents = day.events.map(event => {
            const highlights = event.highlights || []
            return {
              ...event,
              highlights: [...highlights, highlight],
            }
          })
          return { ...day, events: newEvents }
        })
        setDays(newDays)
      }
    }
  }

  const addHighlight = (highlight: string) => {
    if (!highlightOptions.includes(highlight)) {
      setHighlightOptions([...highlightOptions, highlight])
      setNewHighlight("")
    }
  }

  const handleDragStart = (
    type: "component" | "event" | "library-item",
    item: any,
    dayIndex?: number,
    eventIndex?: number,
  ) => {
    setDraggedItem({ type, item, sourceDay: dayIndex, sourceIndex: eventIndex })
  }

  const handleDragOver = (dayIndex: number, position: number) => {
    setDropTarget({ dayIndex, position })
  }

  // library drag start handler removed

  const convertLibraryItemToEvent = (libraryItem: any): IItineraryEvent => {
    const convertedEvent = LibraryToItineraryConverter.convertToItineraryEvent(libraryItem)

    // Generate hotel group ID if it's a hotel
    const hotelGroupId = convertedEvent.category === "hotel" ? `hotel-${Date.now()}` : undefined

    return {
      ...convertedEvent,
      libraryItemId: libraryItem.id,
      componentSource: "my-library",
      originalLibraryId: libraryItem.id,
      versionHistory: [
        {
          timestamp: new Date(),
          action: "imported",
          source: "my-library",
        },
      ],
      highlights: convertedEvent.highlights ? [...convertedEvent.highlights] : [],
      listItems: convertedEvent.listItems ? [...convertedEvent.listItems] : [],
      ...(convertedEvent.category === "hotel" && {
        hotelGroupId,
        hotelNightIndex: 1,
        hotelTotalNights: convertedEvent.nights || 1,
      }),
    }
  }

  const handleDrop = async (dayIndex: number, position: number) => {
    if (!draggedItem) {
      console.log("[DEBUG] No dragged item found")
      return
    }

    console.log("[DEBUG] Dropping item:", draggedItem, "to day:", dayIndex, "position:", position)

    if (draggedItem.type === "component") {
      // If it's Additional Information or Ancillaries component, open the source modal
      // so user can choose Manual or From Library. We'll create the appropriate slot
      // from the modal selection handlers.
      // Legacy block removed to allow proper handling in specific sections




      // Skip modal for drops in Additional Information section (dayIndex === -1)
      if (dayIndex === -1) {
        // STRICT: Only allow Additional Information component in this section
        if (draggedItem.item.category !== "additionalInformation" &&
          !draggedItem.item.category.toLowerCase().includes("additional")) {
          console.log("[DEBUG] Only Additional Information is allowed in this section")
          toast({
            title: "Not Allowed",
            description: "Only 'Additional Information' components can be added to this section.",
            variant: "destructive"
          })
          setDraggedItem(null)
          setDropTarget(null)
          return
        }

        console.log("[DEBUG] Opening component source modal for Additional Information")
        setComponentSourceModal({ isOpen: true, component: draggedItem.item, dropTarget: { dayIndex: -1, position: serviceSlots.length } })
        return
      }

      // Handle drops in Overview section (dayIndex === -2)
      if (dayIndex === -2) {
        // Only allow notes in overview
        if (draggedItem.item.category !== "note") {
          console.log("[DEBUG] Only notes are allowed in Overview section")
          setDraggedItem(null)
          setDropTarget(null)
          return
        }
        // Open modal for note creation in overview
        console.log("[DEBUG] Opening component source modal for overview note")
        setComponentSourceModal({ isOpen: true, component: draggedItem.item, dropTarget: { dayIndex, position } })
        return
      }


      console.log("[DEBUG] Opening component source modal")
      setComponentSourceModal({ isOpen: true, component: draggedItem.item, dropTarget: { dayIndex, position } })
      return
    }

    // Deep copy to prevent mutation
    const newDays = days.map(day => ({
      ...day,
      events: [...day.events]
    }))

    if (draggedItem.type === "library-item") {
      console.log("[DEBUG] Converting library item to event")
      const newEvent = convertLibraryItemToEvent(draggedItem.item)
      console.log("[DEBUG] New event created:", newEvent)
      newDays[dayIndex].events.splice(position, 0, newEvent)

      // Handle multi-night hotels: duplicate event across nights
      if (newEvent.category === "hotel" && newEvent.nights && newEvent.nights > 1) {
        const hotelGroupId = newEvent.hotelGroupId || `hotel-${Date.now()}`

        // Update the original event with night tracking
        newDays[dayIndex].events[position] = {
          ...newEvent,
          hotelGroupId,
          hotelNightIndex: 1,
          hotelTotalNights: newEvent.nights,
        }

        // Add hotel events to subsequent days (including checkout day)
        // For 2 nights: create 2 more hotel cards (day 2 night 2, day 3 checkout)
        for (let i = 1; i <= newEvent.nights; i++) {
          const nextDayIndex = dayIndex + i

          // Extend days array if needed
          if (nextDayIndex >= newDays.length) {
            const lastDay = newDays[newDays.length - 1]
            newDays.push({
              ...lastDay,
              day: newDays.length + 1,
              title: "",
              date: new Date(
                new Date(lastDay.date).getTime() + 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split("T")[0],
              events: [],
            })
          }

          // Create duplicate event for this night/checkout
          const nightEvent: IItineraryEvent = {
            ...newEvent,
            id: `event-${Date.now()}-night-${i}`,
            hotelGroupId,
            hotelNightIndex: i + 1,
            hotelTotalNights: newEvent.nights,
          }

          // Add to the next day
          newDays[nextDayIndex].events.push(nightEvent)
        }
      }

      console.log("[DEBUG] Updated days array:", newDays)
    } else if (
      draggedItem.type === "event" &&
      draggedItem.sourceDay !== undefined &&
      draggedItem.sourceIndex !== undefined
    ) {
      console.log("[DEBUG] Moving existing event")
      const [movedEvent] = newDays[draggedItem.sourceDay].events.splice(draggedItem.sourceIndex, 1)
      newDays[dayIndex].events.splice(position, 0, movedEvent)
    }

    console.log("[DEBUG] Setting new days state")

    // Sort events: Notes first
    newDays[dayIndex].events.sort((a, b) => {
      if (a.category === 'note' && b.category !== 'note') return -1
      if (a.category !== 'note' && b.category === 'note') return 1
      return 0
    })

    setDays(newDays)
    setDraggedItem(null)
    setDropTarget(null)
    console.log("[DEBUG] Drop operation completed")

    // Auto-save after dropping if we have an itineraryId
    if (currentItineraryId) {
      console.log("[DEBUG] Auto-saving after drop")
      try {
        await autoSave(newDays)
      } catch (error) {
        console.error("[DEBUG] Auto-save failed:", error)
      }
    }
  }

  const updateDayTitle = (dayIndex: number, newTitle: string) => {
    const newDays = [...days]
    newDays[dayIndex].title = newTitle
    setDays(newDays)
  }

  const updateDayDescription = (dayIndex: number, newDescription: string, isDetailed = false) => {
    const newDays = [...days]
    if (isDetailed) {
      newDays[dayIndex].detailedDescription = newDescription
    } else {
      newDays[dayIndex].description = newDescription
    }
    setDays(newDays)
  }

  const updateDayNights = (dayIndex: number, nights: string) => {
    const newDays = [...days]
    newDays[dayIndex].nights = Number.parseInt(nights) || 0
    setDays(newDays)
  }

  const updateDayMeals = (dayIndex: number, meal: "breakfast" | "lunch" | "dinner", value: boolean) => {
    const newDays = [...days]
    // Initialize meals if undefined or array (migration from old format)
    if (!newDays[dayIndex].meals || Array.isArray(newDays[dayIndex].meals)) {
      newDays[dayIndex].meals = {
        breakfast: false,
        lunch: false,
        dinner: false,
      }
    }
    // Cast to any to access properties since strict typing is union
    ; (newDays[dayIndex].meals as any)[meal] = value
    setDays(newDays)
  }

  const toggleDayCollapse = (dayIndex: number) => {
    const newCollapsedDays = new Set(collapsedDays)
    if (newCollapsedDays.has(dayIndex)) {
      newCollapsedDays.delete(dayIndex)
    } else {
      newCollapsedDays.add(dayIndex)
    }
    setCollapsedDays(newCollapsedDays)
  }

  const handleEditEvent = (dayIndex: number, eventIndex: number) => {
    if (dayIndex === -1) {
      // For service slots, eventIndex here refers to the SLOT index
      const slot = serviceSlots[eventIndex]
      if (slot && slot.events.length > 0) {
        setEditingEvent({
          event: slot.events[0],
          dayIndex,
          eventIndex, // This is actually slotIndex for dayIndex -1
        })
      }
      return
    }

    setEditingEvent({
      event: days[dayIndex].events[eventIndex],
      dayIndex,
      eventIndex,
    })
  }

  const handleDeleteEvent = (dayIndex: number, eventIndex: number) => {
    const eventToDelete = days[dayIndex].events[eventIndex]
    let newDays = JSON.parse(JSON.stringify(days)) // Deep copy

    // Check if it's a multi-night hotel that needs syncing
    if (eventToDelete.category === 'hotel' && eventToDelete.hotelGroupId) {
      const groupId = eventToDelete.hotelGroupId

      // 1. Remove the event
      newDays[dayIndex].events.splice(eventIndex, 1)

      // 2. Find all remaining events for this group and their positions
      let groupEvents: { dayIdx: number, eventIdx: number, event: IItineraryEvent }[] = []
      newDays.forEach((d: any, dIdx: number) => {
        d.events.forEach((e: any, eIdx: number) => {
          if (e.hotelGroupId === groupId) {
            groupEvents.push({ dayIdx: dIdx, eventIdx: eIdx, event: e })
          }
        })
      })

      // 3. Sort by day index to ensure sequence
      groupEvents.sort((a, b) => a.dayIdx - b.dayIdx)

      if (groupEvents.length === 0) {
        // No remaining events, just update state
        setDays(newDays)
        return
      }

      // 4. Remove all group events from their current positions (to be re-inserted)
      // Do this in reverse order to avoid index shifting issues
      groupEvents.reverse().forEach(item => {
        newDays[item.dayIdx].events.splice(item.eventIdx, 1)
      })
      groupEvents.reverse() // Restore original order

      // 5. Calculate new metadata
      const newTotalNights = Math.max(0, groupEvents.length - 1)

      // 6. Re-insert events starting from the first event's original day
      // This creates a contiguous block
      const startDayIdx = groupEvents[0].dayIdx

      groupEvents.forEach((item, idx) => {
        const targetDayIdx = startDayIdx + idx

        // Ensure we have enough days
        while (targetDayIdx >= newDays.length) {
          const lastDay = newDays[newDays.length - 1]
          newDays.push({
            ...lastDay,
            day: newDays.length + 1,
            title: `Day ${newDays.length + 1}`,
            date: new Date(new Date(lastDay.date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            events: [],
            meals: { breakfast: false, lunch: false, dinner: false }
          })
        }

        const updatedEvent = {
          ...item.event,
          hotelNightIndex: idx + 1,
          hotelTotalNights: newTotalNights,
          nights: newTotalNights // Sync nights property
        }

        // Insert into the target day
        newDays[targetDayIdx].events.push(updatedEvent)
      })

      setDays(newDays)
    } else {
      // Standard deletion
      newDays[dayIndex].events.splice(eventIndex, 1)
      setDays(newDays)
    }
  }

  const handleSaveEvent = (updatedEvent: IItineraryEvent) => {
    console.log("[DEBUG] handleSaveEvent called", {
      editingEventId: editingEvent?.event?.id,
      updatedPrice: updatedEvent.price,
      updatedCurrency: updatedEvent.currency
    });

    if (!editingEvent) {
      console.error("[DEBUG] No editingEvent found in state!");
      return;
    }

    let finalEvent = {
      ...updatedEvent,
      highlights: updatedEvent.highlights ? [...updatedEvent.highlights] : [],
      listItems: updatedEvent.listItems ? [...updatedEvent.listItems] : [],
    }

    if (finalEvent.componentSource === "my-library") {
      finalEvent.componentSource = "my-library-edited"
    } else if (finalEvent.componentSource === "global-library") {
      finalEvent.componentSource = "global-library-edited"
    }

    // Handle overview events (dayIndex === -2)
    if (editingEvent.dayIndex === -2) {
      const newOverviewEvents = [...overviewEvents]
      newOverviewEvents[editingEvent.eventIndex] = finalEvent
      setOverviewEvents(newOverviewEvents)
      setEditingEvent(null)
      return
    }

    // Handle service slots update (Additional Information)
    if (editingEvent.dayIndex === -1) {
      const newSlots = [...serviceSlots]
      const slotIndex = editingEvent.eventIndex // This is slotIndex

      if (newSlots[slotIndex]) {
        // Update the event inside the slot
        newSlots[slotIndex].events[0] = {
          ...finalEvent,
          // Ensure category stays 'list' or correct type
          category: finalEvent.category || newSlots[slotIndex].events[0].category
        }
        // Also update slot title if needed
        newSlots[slotIndex].title = finalEvent.title

        setServiceSlots(newSlots)
        setEditingEvent(null)
      }
      return
    }

    // 1. First, create a deep copy of days to work with
    let newDays = JSON.parse(JSON.stringify(days))

    // 2. Update the event at the specific position
    newDays[editingEvent.dayIndex].events[editingEvent.eventIndex] = finalEvent

    // 3. Handle multi-night hotels
    // 3. Handle multi-night hotels
    if (updatedEvent.category === "hotel" && updatedEvent.nights && updatedEvent.nights > 0) {
      const hotelGroupId = updatedEvent.hotelGroupId || `hotel-${Date.now()}`
      const totalNights = updatedEvent.nights

      // Update the corrected event with group info
      newDays[editingEvent.dayIndex].events[editingEvent.eventIndex] = {
        ...newDays[editingEvent.dayIndex].events[editingEvent.eventIndex],
        hotelGroupId,
        hotelNightIndex: 1,
        hotelTotalNights: totalNights,
      }

      const currentDayIndex = editingEvent.dayIndex
      const currentEventIndex = editingEvent.eventIndex

      // A. Remove ALL other existing linked events for this group
      // We keep the one we are currently editing (to avoid losing its position), but remove all others
      newDays = newDays.map((day: any, dIdx: number) => {
        return {
          ...day,
          events: day.events.filter((e: any, eIdx: number) => {
            // Keep non-hotel events
            if (e.hotelGroupId !== hotelGroupId) return true;
            // Keep the exact event instance we are editing
            if (dIdx === currentDayIndex && eIdx === currentEventIndex) return true;
            // Remove everything else in this group
            return false;
          })
        }
      })

      // B. Regenerate linked events
      // We need to generate (totalNights - 1) additional "night" events + 1 "checkout" event
      // Loop starts from 1 because i=0 is the main event (Night 1)
      const cachedEvent = newDays[currentDayIndex].events[currentEventIndex]

      for (let i = 1; i <= totalNights; i++) {
        // i=1 is Night 2, i=totalNights is Checkout
        const targetDayIndex = currentDayIndex + i

        // Extend days if needed
        if (targetDayIndex >= newDays.length) {
          // If we need to add more days to accommodate the stay
          const daysToAdd = targetDayIndex - newDays.length + 1
          for (let d = 0; d < daysToAdd; d++) {
            const lastDay = newDays[newDays.length - 1]
            newDays.push({
              ...lastDay,
              day: newDays.length + 1,
              title: `Day ${newDays.length + 1}`,
              date: new Date(new Date(lastDay.date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              events: []
            })
          }
        }

        // Create the linked event
        const linkedEvent: IItineraryEvent = {
          ...cachedEvent,
          id: `event-${Date.now()}-${i}`, // unique ID
          hotelGroupId,
          hotelNightIndex: i + 1, // 1-based index (Night 1 = 1, Night 2 = 2...)
          hotelTotalNights: totalNights,
          price: 0, // Linked events usually 0 displayed price
        }

        // Insert into the target day
        newDays[targetDayIndex].events.push(linkedEvent)
      }
    }

    setDays(newDays)
    setEditingEvent(null)
  }

  const addDay = () => {
    const newDay: IItineraryDay = {
      day: days.length + 1,
      title: "",
      date: new Date(Date.now() + days.length * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: "",
      detailedDescription: "",
      events: [],
      nights: 0,
      meals: {
        breakfast: false,
        lunch: false,
        dinner: false,
      },
    }
    setDays([...days, newDay])
  }

  const deleteDay = (dayIndex: number) => {
    if (days.length === 1) return

    // 1. Identify Hotel Events in the deleted day that need resizing
    const deletedDay = days[dayIndex]
    const affectedHotelGroups = new Set<string>()

    deletedDay.events.forEach(e => {
      if (e.category === 'hotel' && e.hotelGroupId) {
        affectedHotelGroups.add(e.hotelGroupId)
      }
    })

    // 2. Remove the day
    let newDays = days.filter((_, index) => index !== dayIndex)

    // 3. Process affected hotel groups
    // For each group, we need to:
    // a. Find all remaining events of that group
    // b. Reduce their totalNights by 1
    // c. Re-index their nightIndex (1, 2, 3...) based on their new day order

    // We need to do this traversing the NEW days structure
    affectedHotelGroups.forEach(groupId => {
      // Collect all remaining events for this group across all days
      let groupEvents: { dayIdx: number, eventIdx: number, event: IItineraryEvent }[] = []

      newDays.forEach((d, dIdx) => {
        d.events.forEach((e, eIdx) => {
          if (e.hotelGroupId === groupId) {
            groupEvents.push({ dayIdx: dIdx, eventIdx: eIdx, event: e })
          }
        })
      })

      // If no events left (e.g. it was a 1-night stay on the deleted day), nothing to do.
      if (groupEvents.length === 0) return

      // Verify if we still have a contiguous block? 
      // Logic: The days are removed, so the remaining days shift up. 
      // The events physically stay on their "relative" days. 
      // We just need to update metadata.

      // IMPORTANT: totalNights is (number of cards) - 1. Because the last card is checkout with NO night count usually.
      // e.g. 3 cards = 2 nights + checkout.
      const newTotalNights = Math.max(0, groupEvents.length - 1)

      groupEvents.forEach((item, idx) => {
        // idx is 0-based, so nightIndex is idx + 1
        const updatedEvent = {
          ...item.event,
          hotelNightIndex: idx + 1,
          hotelTotalNights: newTotalNights,
          // Update 'nights' property on ALL events to keep them in sync
          nights: newTotalNights
        }
        newDays[item.dayIdx].events[item.eventIdx] = updatedEvent
      })
    })

    // 4. Renumber remaining days
    const renumberedDays = newDays.map((day, index) => ({
      ...day,
      day: index + 1,
      title: day.title.includes("Day ") ? `Day ${index + 1}` : day.title,
    }))

    setDays(renumberedDays)
    setDeleteConfirmationOpen(false)
    setDeletingDayIndex(null)

    toast({
      title: "Day Deleted",
      description: `Day ${dayIndex + 1} has been removed. Multi-night events have been updated.`,
    })
  }

  const handleSelectManualComponent = (manualData?: any) => {
    // For manual selection, either create a service slot (for Additional Information)
    // or create a normal manual event in the target day. Accepts optional manualData
    // that contains { title, bullets } when creating Additional Information.
    if (!componentSourceModal.component) return

    const component = componentSourceModal.component

    if (component.category === "additionalInformation" || componentSourceModal.dropTarget?.dayIndex === -1) {
      console.log("[DEBUG] Creating service slot (manual) for Additional Information")
      const title = (manualData && manualData.title) || `Additional Information ${serviceSlots.length + 1}`
      // Support both `bullets` and `listItems` fields
      const bullets: string[] = (manualData && Array.isArray(manualData.bullets)) ? manualData.bullets : (manualData && Array.isArray(manualData.listItems)) ? manualData.listItems : []

      const listEvent: IItineraryEvent = {
        id: `event-${Date.now()}`,
        category: "list",
        title,
        description: title || "Additional Information", // Required by Mongoose schema
        listItems: bullets,
        componentSource: "manual",
        highlights: [],
        time: "",
      } as unknown as IItineraryEvent

      const newSlot = {
        id: `service-slot-${Date.now()}`,
        title,
        events: [listEvent], // ALWAYS create the event so the slot is visible
      }

      setServiceSlots([...serviceSlots, newSlot])
      setDraggedItem(null)
      setDropTarget(null)
      setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })
      return
    }

    // Redundant block removed as it was merged with the above block

    // Fallback: create a manual event in days if a drop target exists
    if (!componentSourceModal.dropTarget) {
      setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })
      setDraggedItem(null)
      setDropTarget(null)
      return
    }

    const { dayIndex, position } = componentSourceModal.dropTarget
    // Deep copy for immutable update
    const newDays = days.map(day => ({
      ...day,
      events: [...day.events]
    }))

    // Generate a unique group ID for multi-night hotels
    const hotelGroupId = component.category === "hotel" ? `hotel-${Date.now()}` : undefined

    const newEvent: IItineraryEvent = {
      id: `event-${Date.now()}`,
      category: component.category,
      title: (manualData && manualData.title) || `New ${component.title}`,
      description: (manualData && manualData.description) || "",
      time: (manualData && manualData.time) || "09:00",
      location: (manualData && manualData.location) || "",
      highlights: (manualData && manualData.highlights) || [],
      listItems: (manualData && manualData.listItems) || [],
      price: (manualData && manualData.price) || 0,
      currency: (manualData && manualData.currency) || "INR", // CRITICAL: Save selected currency
      componentSource: "manual",
      versionHistory: [
        {
          timestamp: new Date(),
          action: "created",
          source: "manual",
        },
      ],
      ...(component.category === "flight" && {
        fromCity: (manualData && manualData.fromCity) || (manualData && manualData.from) || "Enter origin",
        toCity: (manualData && manualData.toCity) || (manualData && manualData.to) || "Enter destination",
        mainPoint: (manualData && manualData.mainPoint) || (manualData && manualData.main) || "Enter flight details",
        time: (manualData && manualData.time) || "09:00",
        endTime: (manualData && manualData.endTime) || "",
        airlines: (manualData && manualData.airlines) || "",
        flightNumber: (manualData && manualData.flightNumber) || "",
        flightClass: (manualData && manualData.flightClass) || "",
        baggage: (manualData && manualData.baggage) || "",
        stops: (manualData && manualData.stops) || "",
        pnr: (manualData && manualData.pnr) || "",
        refundable: (manualData && manualData.refundable) || "",
        amenities: (manualData && manualData.amenities) || [],
      }),
      ...(component.category === "hotel" && {
        checkIn: (manualData && manualData.checkIn) || "14:00",
        checkOut: (manualData && manualData.checkOut) || "12:00",
        amenities: (manualData && manualData.amenities) || [],
        nights: (manualData && manualData.nights) || 1,
        hotelGroupId,
        hotelNightIndex: 1,
        hotelTotalNights: (manualData && manualData.nights) || 1,
        adults: (manualData && manualData.adults) || 0,
        children: (manualData && manualData.children) || 0,
        propertyType: (manualData && manualData.propertyType) || "",
        address: (manualData && manualData.address) || "",
        hotelLink: (manualData && manualData.hotelLink) || "",
        confirmationNumber: (manualData && manualData.confirmationNumber) || "",
        hotelName: (manualData && manualData.hotelName) || "",
        roomCategory: (manualData && manualData.roomCategory) || "",
        hotelRating: (manualData && manualData.hotelRating) || 0,
        mealPlan: (manualData && manualData.mealPlan) || "",
        hotelNotes: (manualData && manualData.hotelNotes) || "",
        imageUrl: (manualData && manualData.imageUrl) || "",
        refundable: (manualData && manualData.refundable) || "",
      }),
      ...(component.category === "transfer" && {
        transferCategory: (manualData && manualData.transferCategory) || "",
        fromLocation: (manualData && manualData.fromLocation) || (manualData && manualData.from) || "Pick-up location",
        toLocation: (manualData && manualData.toLocation) || (manualData && manualData.to) || "Drop-off location",
        vehicleType: (manualData && manualData.vehicleType) || "Private Car",
        capacity: (manualData && manualData.capacity) || 4,
        transferType: (manualData && manualData.transferType) || "private",
        // Airport Transfer specific
        airportName: (manualData && manualData.airportName) || "",
        pickupDrop: (manualData && manualData.pickupDrop) || "pickup",
        // Car Hire specific
        pickupTime: (manualData && manualData.pickupTime) || "",
        dropTime: (manualData && manualData.dropTime) || "",
        noOfHours: (manualData && manualData.noOfHours) || 0,
        noOfDays: (manualData && manualData.noOfDays) || 0,
        fuelType: (manualData && manualData.fuelType) || "",
        carModel: (manualData && manualData.carModel) || "",
        transmission: (manualData && manualData.transmission) || "",
        // Bus/Train specific
        busNumber: (manualData && manualData.busNumber) || "",
        trainNumber: (manualData && manualData.trainNumber) || "",
        transferClass: (manualData && manualData.transferClass) || "",
        transferLink: (manualData && manualData.transferLink) || "",
        duration: (manualData && manualData.duration) || "",
        departureTime: (manualData && manualData.departureTime) || "",
        arrivalTime: (manualData && manualData.arrivalTime) || "",
        pnr: (manualData && manualData.pnr) || "",
        refundable: (manualData && manualData.refundable) || "",
        // Dynamic lists
        stopsList: (manualData && manualData.stopsList) || [],
        additionalVehicles: (manualData && manualData.additionalVehicles) || [],
        amenities: (manualData && manualData.amenities) || [],
      }),
      ...(component.category === "activity" && {
        duration: (manualData && manualData.duration) || "2 hours",
        difficulty: (manualData && manualData.difficulty) || "Easy",
        capacity: (manualData && manualData.capacity) || 20,
        highlights: (manualData && manualData.highlights) || [],
      }),
      ...(component.category === "meal" && {
        meals: (manualData && manualData.meals) || [],
        customMealDescription: (manualData && manualData.customMealDescription) || "",
      }),
      ...(component.category === "heading" && {
        title: (manualData && manualData.title) || "Enter heading text",
        description: (manualData && manualData.description) || "Optional subtitle",
      }),
      ...(component.category === "paragraph" && {
        title: (manualData && manualData.title) || "Paragraph",
        description: (manualData && manualData.description) || "Enter your paragraph text here...",
      }),
      ...(component.category === "list" && {
        title: (manualData && manualData.title) || "List Title",
        listItems: (manualData && manualData.listItems) || ["Item 1", "Item 2", "Item 3"],
      }),
      ...(component.category === "image" && {
        title: (manualData && manualData.title) || "New Image",
        description: (manualData && manualData.description) || "Add image description...",
        imageUrl: (manualData && manualData.imageUrl) || "",
        imageCaption: (manualData && manualData.imageCaption) || "",
        imageAlt: (manualData && manualData.imageAlt) || "",
      }),
      ...(component.category === "note" && {
        title: "Note",
        description: (manualData && manualData.description) || "",
      }),
      ...(component.category === "others" && {
        subCategory: (manualData && manualData.subCategory) || "",
        serviceCharge: (manualData && manualData.serviceCharge) || 0,
        travelGears: (manualData && manualData.travelGears) || [],
      }),
      ...(component.category === "ancillaries" && {
        subCategory: (manualData && manualData.subCategory) || "visa",
        // Visa
        country: manualData && manualData.country,
        visaType: manualData && manualData.visaType,
        visaDuration: manualData && manualData.visaDuration,
        entryMethod: manualData && manualData.entryMethod,
        departureDate: manualData && manualData.departureDate,
        returnDate: manualData && manualData.returnDate,
        lengthOfStay: manualData && manualData.lengthOfStay,
        // Forex
        forexCurrency: manualData && manualData.forexCurrency,
        baseCurrency: manualData && manualData.baseCurrency,
        amount: manualData && manualData.amount,
        // Insurance
        destinations: manualData && manualData.destinations,
        startDate: manualData && manualData.startDate,
        endDate: manualData && manualData.endDate,
        noOfTravellers: manualData && manualData.noOfTravellers,
        insuranceType: manualData && manualData.insuranceType,
        sumInsured: manualData && manualData.sumInsured,
        insuranceNotes: manualData && manualData.insuranceNotes,
        // Common
        serviceCharge: (manualData && manualData.serviceCharge) || 0,
      }),
    }

    // Handle overview events (dayIndex === -2)
    if (dayIndex === -2) {
      setOverviewEvents([...overviewEvents, newEvent])
      setDraggedItem(null)
      setDropTarget(null)
      setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })
      return
    }

    newDays[dayIndex].events.splice(position, 0, newEvent)

    // Handle multi-night hotels: duplicate event across nights
    if (newEvent.category === "hotel" && newEvent.nights && newEvent.nights > 1) {
      const hotelGroupId = newEvent.hotelGroupId || `hotel-${Date.now()}`

      // Update the original event with night tracking
      newDays[dayIndex].events[position] = {
        ...newEvent,
        hotelGroupId,
        hotelNightIndex: 1,
        hotelTotalNights: newEvent.nights,
      }

      // Add hotel events to subsequent days (including checkout day)
      for (let i = 1; i <= newEvent.nights; i++) {
        const nextDayIndex = dayIndex + i

        // Extend days array if needed
        if (nextDayIndex >= newDays.length) {
          const lastDay = newDays[newDays.length - 1]
          newDays.push({
            ...lastDay,
            day: newDays.length + 1,
            title: `Day ${newDays.length + 1}`,
            date: new Date(
              new Date(lastDay.date).getTime() + 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0],
            events: [],
          })
        }

        // Create duplicate event for this night/checkout
        const nightEvent: IItineraryEvent = {
          ...newEvent,
          id: `event-${Date.now()}-night-${i}`,
          hotelGroupId,
          hotelNightIndex: i + 1,
          hotelTotalNights: newEvent.nights,
        }

        // Add to the next day
        newDays[nextDayIndex].events.push(nightEvent)
      }
    }

    // Sort events: Notes first
    newDays[dayIndex].events.sort((a, b) => {
      if (a.category === 'note' && b.category !== 'note') return -1
      if (a.category !== 'note' && b.category === 'note') return 1
      return 0
    })

    setDays(newDays)
    setDraggedItem(null)
    setDropTarget(null)
    setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })
  }

  const handleSelectLibraryComponent = (libraryItem: any) => {
    // This handles selection of a library item from the ComponentSourceModal.
    if (!componentSourceModal.component) return

    const component = componentSourceModal.component
    if (component.category === "additionalInformation") {
      console.log("[DEBUG] Creating service slot from library item for Additional Information")
      const bullets: string[] = Array.isArray(libraryItem.extraFields?.additionalInfo)
        ? libraryItem.extraFields.additionalInfo.map((s: any) => (typeof s === 'string' ? s : String(s)))
        : (typeof libraryItem.extraFields?.additionalInfo === 'string' ? [libraryItem.extraFields.additionalInfo] : [])

      const listEvent: IItineraryEvent = {
        id: `event-${Date.now()}`,
        category: "list",
        title: libraryItem.title || "Additional Information",
        description: libraryItem.notes || "",
        listItems: bullets,
        componentSource: "my-library",
        libraryItemId: libraryItem._id,
        highlights: [],
        time: "",
      } as unknown as IItineraryEvent

      const newSlot = {
        id: `service-slot-${Date.now()}`,
        title: libraryItem.title || `Additional Information ${serviceSlots.length + 1}`,
        events: [listEvent],
      }

      setServiceSlots([...serviceSlots, newSlot])
      setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })
      setDraggedItem(null)
      setDropTarget(null)
      return
    }


    // Non-additionalInformation: convert and insert into days if a dropTarget is present
    const dropTargetLocal = componentSourceModal.dropTarget
    let targetDay = 0
    let position = 0
    if (dropTargetLocal) {
      targetDay = dropTargetLocal.dayIndex
      position = dropTargetLocal.position
    } else {
      targetDay = days.length - 1
      position = days[targetDay].events.length
    }

    const converted = convertLibraryItemToEvent(libraryItem)
    const newDays = [...days]
    newDays[targetDay].events.splice(position, 0, converted)
    setDays(newDays)
    setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })
    setDraggedItem(null)
    setDropTarget(null)
  }



  // library selection handler removed

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = date.toLocaleDateString("en", { month: "short" })
    const year = date.getFullYear().toString().slice(-2)
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${day} ${month}' ${year} ${hours}:${minutes}`
  }

  const handlePreview = () => {
    setShowPreviewConfig(true)
  }

  const handlePreviewConfirm = async (config: PreviewConfig) => {
    setIsGeneratingPreview(true)
    try {
      const basePrice = days.reduce(
        (sum, day) => sum + day.events.reduce((daySum, event) => daySum + (event.price || 0), 0),
        0,
      )

      let totalPrice = basePrice
      if (markupType === "percentage") {
        totalPrice = basePrice + (basePrice * markupValue / 100)
      } else {
        totalPrice = basePrice + markupValue
      }

      const totalNights = days.reduce((sum, day) => sum + (day.nights || 0), 0)

      const effectiveItineraryId = currentItineraryId || itineraryId || null

      if (effectiveItineraryId) {
        const idString = effectiveItineraryId.toString()
        localStorage.setItem("last-preview-itinerary-id", idString)
        localStorage.setItem("last-preview-itinerary-type", itineraryTypeParam)
      }

      // Ensure branding is populated
      let effectiveBranding = branding
      if (!effectiveBranding || (!effectiveBranding.companyName && !effectiveBranding.contactEmail)) {
        try {
          console.log("Fetching global branding defaults for preview...")
          const settingsRes = await fetch("/api/settings")
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json()
            if (settingsData.branding) {
              effectiveBranding = settingsData.branding
            }
          }
        } catch (err) {
          console.error("Failed to fetch global branding defaults for preview:", err)
        }
      }

      const previewData = {
        title,
        description,
        productId,
        country: countries[0] || extractDestination(),
        days,
        nights: totalNights,
        branding: effectiveBranding,
        totalPrice,
        markupType,
        markupValue,
        generatedAt: formatDate(new Date()),
        serviceSlots,
        gallery,
        previewConfig: {
          ...config,
          theme: config.template // Map template to theme for compatibility
        },
        itineraryId: effectiveItineraryId ? effectiveItineraryId.toString() : null,
        _id: effectiveItineraryId ? effectiveItineraryId.toString() : undefined,
        itineraryType: itineraryTypeParam,
        currency: pricingCurrency,
      }

      localStorage.setItem("itinerary-preview", JSON.stringify(previewData))

      window.open("/itinerary/preview", "_blank")

      toast({
        title: "Preview Generated",
        description: "Opening preview in new tab...",
      })
    } catch (error) {
      console.error("Failed to generate preview:", error)
      toast({
        title: "Preview Failed",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleSave = async () => {
    // VALIDATION FIRST - before setting any state
    const descriptionValue = description ? description.trim() : ""
    const destinationValue = countries && countries.length > 0 ? (countries[0] ? countries[0].trim() : "") : ""

    console.log("[VALIDATION] Checking fields before save")
    console.log("[VALIDATION] descriptionValue length:", descriptionValue.length)
    console.log("[VALIDATION] destinationValue length:", destinationValue.length)

    // Check if description is empty
    if (!descriptionValue || descriptionValue.length === 0) {
      console.log("[VALIDATION] BLOCKED - Description is empty")
      setValidationErrorMessage("Please enter an itinerary description before saving.")
      setValidationErrorOpen(true)
      return
    }

    // Check if destination is empty
    if (!destinationValue || destinationValue.length === 0) {
      console.log("[VALIDATION] BLOCKED - Destination is empty")
      setValidationErrorMessage("Please enter a destination before saving.")
      setValidationErrorOpen(true)
      return
    }

    console.log("[VALIDATION] Validation PASSED - All fields are filled")

    // NOW we can proceed with saving
    setIsSaving(true)
    setCountryError("")

    try {
      const basePrice = days.reduce(
        (sum, day) => sum + day.events.reduce((daySum, event) => daySum + (event.price || 0), 0),
        0,
      )

      let totalPrice = basePrice
      if (markupType === "percentage") {
        totalPrice = basePrice + (basePrice * markupValue / 100)
      } else {
        totalPrice = basePrice + markupValue
      }

      const itineraryData = {
        productId: productId.trim() || ("ITN-" + Date.now().toString(36).toUpperCase()),
        productReferenceCode: productReferenceCode.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
        destination: countries[0] && countries[0].trim() ? countries[0].trim() : (extractDestination() || "Multiple Destinations"),
        duration: days.length + (days.length === 1 ? " day" : " days"),
        totalPrice,
        currency: pricingCurrency,
        markupType,
        markupValue,
        createdBy: "agent-user",
        countries,
        days: days.map((day, dayIdx) => {
          // Convert meals object to array of strings for Mongoose schema
          let mealsArray: string[] = []
          if (day.meals) {
            if (Array.isArray(day.meals)) {
              mealsArray = day.meals
            } else if (typeof day.meals === 'object') {
              // Convert object { breakfast: true, lunch: false, dinner: true } to ["breakfast", "dinner"]
              const mealsObj = day.meals as { breakfast?: boolean; lunch?: boolean; dinner?: boolean }
              if (mealsObj.breakfast) mealsArray.push('breakfast')
              if (mealsObj.lunch) mealsArray.push('lunch')
              if (mealsObj.dinner) mealsArray.push('dinner')
            }
          }

          return {
            ...day,
            title: day.title || `Day ${dayIdx + 1}`, // Provide default title if empty
            meals: mealsArray, // Use array format instead of object
            events: day.events.map((event) => ({
              ...event,
              title: event.title || ("New " + event.category),
              description: event.description || "No description provided",
              highlights: event.highlights || [],
              listItems: event.listItems || [],
              price: event.price || 0,
              versionHistory: event.versionHistory || [
                {
                  timestamp: new Date(),
                  action: "created" as const,
                  source: event.componentSource || "manual",
                },
              ],
            })),
          }
        }),
        highlights: highlights.length > 0 ? highlights : extractHighlights(),
        images: images.length > 0 ? images : extractImages(),
        gallery, // Include gallery in save data
        branding,
        serviceSlots,
        overviewEvents, // Include overview events in save data
        guestDetails,
        agencyDetails,
        headerFooter,
        type: itineraryType,
        cartItems,
        htmlContent,
        htmlBlocks,
        notes,
      }

      console.log("[v0] Saving itinerary data:", itineraryData)

      let result
      let effectiveItineraryId = currentItineraryId
      
      // Auto-update matched itinerary instead of duplicating or blocking
      if (!effectiveItineraryId && itineraryData.title) {
        try {
          const dupResp = await fetch(`/api/itineraries?title=${encodeURIComponent(
            itineraryData.title,
          )}`, {
            headers: {
              "x-request-id": `dup-${Date.now()}`,
            },
          })

          if (dupResp.ok) {
            const dupData = await dupResp.json()
            const matches = Array.isArray(dupData.data) ? dupData.data : []
            if (matches.length > 0) {
              effectiveItineraryId = matches[0]._id
              setCurrentItineraryId(effectiveItineraryId)
              window.history.replaceState(null, "", `/itinerary/builder?id=${effectiveItineraryId}&mode=edit&type=${itineraryTypeParam}`)
              toast({
                title: "Updating Existing",
                description: `Updating existing itinerary named "${itineraryData.title}".`,
              })
            }
          }
        } catch (error) {
          console.warn("[v0] Duplicate check failed (client-side):", error)
        }
      }
      
      if (effectiveItineraryId) {
        result = await updateItinerary(effectiveItineraryId, itineraryData)
      } else {
        result = await createItinerary(itineraryData)
        // Trigger credit deduction animation for new itinerary
        if (typeof window !== 'undefined' && result) {
          window.dispatchEvent(new CustomEvent('credits-deducted', { detail: { amount: 2 } }));
        }
      }

      if (result) {
        toast({
          title: "Itinerary Saved Successfully",
          description: title + " saved with Product ID: " + productId,
        })

        const savedId = result._id ? result._id.toString() : null
        if (!currentItineraryId && savedId) {
          setCurrentItineraryId(savedId)
          window.history.replaceState(null, "", "/itinerary/builder?id=" + savedId + "&mode=edit&type=" + itineraryTypeParam)
        } else if (savedId && currentItineraryId !== savedId) {
          setCurrentItineraryId(savedId)
        }

        // Call the onSave callback if provided
        if (onSave) {
          // Pass back the complete itinerary data including quotation options
          await (onSave as any)({
            itineraryId: savedId,
            quotationOptions: mode === 'quotation' ? quotationPricingOptions : undefined,
            ...itineraryData
          })
        }
        // Reset changes tracking after successful save
        setHasChanges(false)
        setShowSaved(true)
        
        // Trigger credit refresh event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('refresh-credits'));
        }

        setTimeout(() => setShowSaved(false), 2000)
      }
    } catch (error) {
      console.error("[v0] Save error:", error)
      toast({
        title: "Save Failed",
        description:
          error instanceof Error ? error.message : "Failed to save itinerary. Please check all required fields.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const autoSave = async (updatedDays?: IItineraryDay[]) => {
    if (!currentItineraryId) return

    try {
      console.log("[DEBUG] Auto-saving itinerary...")

      const daysToSave = updatedDays || days
      const totalPrice = daysToSave.reduce(
        (sum, day) => sum + day.events.reduce((daySum, event) => daySum + (event.price || 0), 0),
        0,
      )

      const itineraryData = {
        productId: productId.trim() || ("ITN-" + Date.now().toString(36).toUpperCase()),
        productReferenceCode: productReferenceCode.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
        destination: countries[0] && countries[0].trim() ? countries[0].trim() : (extractDestination() || "Multiple Destinations"),
        duration: daysToSave.length + (daysToSave.length === 1 ? " day" : " days"),
        totalPrice,
        currency: "USD",
        createdBy: "agent-user",
        countries,
        days: daysToSave.map((day) => ({
          ...day,
          events: day.events.map((event) => ({
            ...event,
            title: event.title || `New ${event.category}`,
            description: event.description || "No description provided",
            highlights: event.highlights || [],
            listItems: event.listItems || [],
            price: event.price || 0,
            versionHistory: event.versionHistory || [
              {
                timestamp: new Date(),
                action: "created" as const,
                source: event.componentSource || "manual",
              },
            ],
          })),
        })),
        highlights: extractHighlights(),
        images: extractImages(),
        gallery,
        branding,
        overviewEvents, // Include overview events in auto-save
      }

      const result = await updateItinerary(currentItineraryId, itineraryData)
      console.log("[DEBUG] Auto-save completed successfully")

      if (onSave) {
        await onSave()
      }
    } catch (error) {
      console.error("[DEBUG] Auto-save failed:", error)
    }
  }

  const handleCreateCopy = async () => {
    try {
      if (!title.trim()) {
        toast({
          title: "Copy Failed",
          description: "Please add a title before creating a copy.",
          variant: "destructive",
        })
        return
      }

      const newProductId = `ITN-${Date.now().toString(36).toUpperCase()}`
      const newTitle = `${title} (Copy)`

      const copiedDays = days.map((day) => ({
        ...day,
        events: day.events.map((event) => ({
          ...event,
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          highlights: event.highlights ? [...event.highlights] : [],
          listItems: event.listItems ? [...event.listItems] : [],
          componentSource: event.componentSource === "my-library" ? "my-library-edited" : event.componentSource,
          versionHistory: [
            ...(event.versionHistory || []),
            {
              timestamp: new Date(),
              action: "created" as const,
              source: "manual",
            },
          ],
        })),
      }))

      const totalPrice = copiedDays.reduce(
        (sum, day) =>
          sum +
          day.events.reduce((daySum, event) => {
            const p = Number((event as any).price)
            const pn = isNaN(p) ? 0 : p
            return daySum + pn
          }, 0),
        0,
      )

      // Determine destination: prefer explicit country input, otherwise try to extract
      const destinationFromInput = countries[0] && countries[0].trim() ? countries[0].trim() : ""
      const destinationResolved = destinationFromInput || extractDestination()

      if (!destinationResolved || destinationResolved === "Multiple Destinations") {
        toast({
          title: "Copy Failed",
          description: "Please set a destination before creating a copy.",
          variant: "destructive",
        })
        return
      }

      const copyData = {
        productId: newProductId,
        title: newTitle,
        description: description ? `${description} (Copy)` : "Copy of itinerary",
        destination: destinationResolved,
        duration: `${copiedDays.length} ${copiedDays.length === 1 ? "day" : "days"}`,
        totalPrice,
        currency: "USD",
        status: "draft" as const,
        createdBy: "agent-user",
        days: copiedDays,
        highlights: extractHighlights(),
        images: extractImages(),
        gallery: [...gallery], // Include gallery in copy
        branding: { ...branding },
      }

      console.log("[v0] Creating copy with data:", copyData)

      const result = await createItinerary(copyData)

      if (result) {
        setProductId(newProductId)
        setTitle(newTitle)
        setDescription(description ? `${description} (Copy)` : "Copy of itinerary")
        setDays(copiedDays)

        toast({
          title: "Copy Created Successfully",
          description: `Created "${newTitle}" with Product ID: ${newProductId}`,
        })

        if (result._id) {
          const savedId = result._id.toString()
          setCurrentItineraryId(savedId)
          window.history.replaceState(null, "", `/itinerary/builder?id=${savedId}&mode=edit&type=${itineraryTypeParam}`)
        }
      } else {
        throw new Error("Failed to create copy - no result returned")
      }
    } catch (error) {
      console.error("[v0] Failed to create copy:", error)
      toast({
        title: "Copy Failed",
        description: error instanceof Error ? error.message : "Failed to create copy. Please try again.",
        variant: "destructive",
      })
    }
  }

  const extractDestination = (): string => {
    const flightEvents = days.flatMap((day) => day.events.filter((event) => event.category === "flight"))
    if (flightEvents.length > 0) {
      const destinations = flightEvents
        .map((event) => event.toCity)
        .filter((city) => city && city !== "Enter destination")
      if (destinations.length > 0) {
        return destinations.join(", ")
      }
    }
    const hotelEvents = days.flatMap((day) => day.events.filter((event) => event.category === "hotel"))
    if (hotelEvents.length > 0) {
      const locations = hotelEvents.map((event) => event.location).filter((location) => location && location.trim())
      if (locations.length > 0) {
        return locations[0] || "Multiple Destinations"
      }
    }
    return "Multiple Destinations"
  }

  const extractHighlights = (): string[] => {
    const eventHighlights = days.flatMap((day) => day.events.flatMap((event) => event.highlights || []))
    const allHighlights = [...highlightOptions, ...eventHighlights]
    return [...new Set(allHighlights.filter((highlight) => highlight && highlight.trim()))]
  }

  const extractImages = (): string[] => {
    const allImages = days.flatMap((day) =>
      day.events.filter((event) => event.imageUrl).map((event) => event.imageUrl!),
    )

    return [...new Set(allImages)]
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen relative overflow-x-hidden bg-[#f8fafc]">
      {/* Mobile Sticky Header - ONLY visible on mobile */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Editor Mode</span>
          <h1 className="text-sm font-bold text-neutral-800 truncate max-w-[180px]">{title || "Untitled Itinerary"}</h1>
        </div>
        <div className="flex items-center gap-2">
           {!readOnly && (
             <Button 
              onClick={handleSave} 
              disabled={isSaving}
              size="sm"
              className={`${showSaved ? 'bg-green-600' : 'bg-[#2D7CEA]'} text-white rounded-full px-4 h-8 text-xs font-bold shadow-lg shadow-blue-500/20`}
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : showSaved ? <Check className="h-3 w-3 mr-1.5" /> : <Save className="h-3 w-3 mr-1.5" />}
              {isSaving ? "..." : showSaved ? "Saved" : "Save"}
            </Button>
           )}
        </div>
      </div>
      {/* Vertical EDITOR MODE strip for customized-package - Hidden on Mobile */}
      {(itineraryTypeParam === 'customized-package' && (isNewMode || currentItineraryId)) && (
        <div
          className={`hidden lg:flex w-7 flex-none items-center justify-center shadow-md relative z-40 ${readOnly ? 'grayscale opacity-50' : ''}`}
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
          }}
        >
          <span
            className="text-white font-bold text-sm tracking-widest whitespace-nowrap uppercase lg:sticky lg:top-1/2 lg:-translate-y-1/2"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              letterSpacing: '0.15em'
            }}
          >
            {readOnly ? 'View Mode' : 'Editor Mode'}
          </span>
        </div>
      )}

      {/* Floating Mobile Action Bar - ONLY visible on mobile */}
      {!readOnly && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-neutral-900/95 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/10 ring-1 ring-black/5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={addDay}
            className="text-white hover:bg-white/10 h-10 w-10 rounded-full transition-transform active:scale-90"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePreview}
            disabled={isGeneratingPreview}
            className="text-white hover:bg-white/10 h-10 w-10 rounded-full transition-transform active:scale-90"
          >
            {isGeneratingPreview ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileSidebarOpen(true)}
            className="text-white hover:bg-white/10 h-10 w-10 rounded-full transition-transform active:scale-90"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCreateCopy}
            className="text-white hover:bg-white/10 h-10 w-10 rounded-full transition-transform active:scale-90"
          >
            <Copy className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 h-10 w-10 rounded-full transition-transform active:scale-90"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex-1 p-2 lg:p-4 overflow-y-auto h-full bg-[#f8fafc] pb-24 lg:pb-4">
        {/* Professional Header Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-neutral-200 mb-4 lg:mb-6 p-4 lg:p-6 relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${readOnly ? 'from-neutral-400 to-neutral-500' : 'from-amber-400 to-yellow-500'}`} />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 lg:gap-6 mb-4 lg:mb-8">
            <div className="flex-1 space-y-3 lg:space-y-4">
              {/* Title Section */}
              <div className="group relative">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  readOnly={readOnly}
                  placeholder="Itinerary Title"
                  className={`w-full text-xl lg:text-4xl font-black border-none p-0 bg-transparent focus:outline-none focus:ring-0 leading-tight placeholder:text-neutral-200 transition-all ${readOnly ? 'cursor-default' : ''}`}
                  style={{ fontWeight: 900 }}
                  aria-label="Itinerary title"
                  type="text"
                  spellCheck={false}
                />
                {!readOnly && <div className="h-0.5 w-full bg-neutral-100 mt-2 group-focus-within:bg-amber-400 transition-colors" />}
              </div>

              {/* Days & Nights Badge Bar */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <div className="bg-amber-50 text-amber-700 px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-wider flex items-center border border-amber-100 shadow-sm">
                  <Sun className="w-3 h-3 lg:w-3.5 lg:h-3.5 mr-1.5 text-amber-500" />
                  {days.length} Days
                  <span className="mx-2 text-amber-200">|</span>
                  <Moon className="w-3 h-3 lg:w-3.5 lg:h-3.5 mr-1.5 text-amber-600" />
                  {days.length > 0 ? days.reduce((sum, d) => sum + (d.nights || 0), 0) || Math.max(0, days.length - 1) : 0} Nights
                </div>
                <div className="hidden sm:block text-neutral-400 text-[10px] lg:text-xs font-medium bg-white px-2 py-1 rounded-md border border-neutral-100">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {!readOnly && (
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className={`${showSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-[#2D7CEA] hover:bg-[#1e63c7]'} text-white shadow-md transition-all duration-300 px-6 h-10`}
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
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-8 space-y-4 lg:space-y-6">
              {/* Destination & Reference Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div className={`bg-neutral-50 rounded-xl p-2.5 lg:p-3 border border-neutral-100 transition-all ${!readOnly ? 'focus-within:border-amber-200 focus-within:bg-white' : ''}`}>
                  <label className="text-[10px] lg:text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1 lg:mb-1.5 block">
                    Destination {!readOnly && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-amber-500" />
                    <Input
                      value={countries[0] || ""}
                      onChange={(e) => setCountries([e.target.value])}
                      readOnly={readOnly}
                      className="flex-1 border-none p-0 h-auto text-xs lg:text-sm font-semibold bg-transparent focus-visible:ring-0"
                      placeholder="Where to?"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className={`bg-neutral-50 rounded-xl p-2.5 lg:p-3 border border-neutral-100 transition-all ${!readOnly ? 'focus-within:border-amber-200 focus-within:bg-white' : ''}`}>
                  <label className="text-[10px] lg:text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1 lg:mb-1.5 block">
                    Product Reference
                  </label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-neutral-400" />
                    <Input
                      value={productReferenceCode}
                      onChange={(e) => setProductReferenceCode(e.target.value)}
                      readOnly={readOnly}
                      placeholder="Optional Code"
                      className="flex-1 border-none p-0 h-auto text-xs lg:text-sm font-semibold bg-transparent focus-visible:ring-0"
                      aria-label="Product Reference Code"
                    />
                  </div>
                </div>
              </div>

              {/* Description Box */}
              <div className={`bg-neutral-50 rounded-xl p-3 lg:p-4 border border-neutral-100 transition-all ${!readOnly ? 'focus-within:border-amber-200 focus-within:bg-white' : ''}`}>
                <label className="text-[10px] lg:text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 lg:mb-2 block">
                  Itinerary Description {!readOnly && <span className="text-red-500">*</span>}
                </label>
                {(() => {
                  const lines = description ? description.split('\n').length : 1
                  const rows = Math.min(Math.max(lines, 1), 6)
                  return (
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      readOnly={readOnly}
                      placeholder="Describe the journey experience..."
                      rows={rows}
                      className="min-h-[50px] lg:min-h-[60px] border-none resize-none p-0 text-sm lg:text-base bg-transparent focus-visible:ring-0 placeholder:text-neutral-300 leading-relaxed font-medium text-neutral-700"
                      aria-label="Itinerary description"
                    />
                  )
                })()}
              </div>
            </div>

            {/* Right Column: Highlights & Tags */}
            <div className="lg:col-span-4 flex flex-col h-full lg:border-l border-neutral-100 lg:pl-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <h3 className="text-xs lg:text-sm font-bold text-neutral-800 flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-500" />
                    Trip Highlights
                  </h3>
                  <Badge variant="secondary" className="text-[9px] lg:text-[10px] bg-neutral-100 text-neutral-500 border-none">
                    {highlightOptions.length} TOTAL
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1 lg:gap-1.5 mb-4 lg:mb-6 max-h-[120px] lg:max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {highlightOptions.map((highlight) => {
                    const isActive = days.some(day =>
                      day.events.some(event => event.highlights?.includes(highlight))
                    );
                    return (
                      <Badge
                        key={highlight}
                        variant="outline"
                        className={`text-[10px] lg:text-[11px] py-0.5 lg:py-1 px-2 lg:px-2.5 rounded-lg transition-all border shadow-sm ${
                          isActive
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-white text-neutral-600 border-neutral-200'
                        } ${!readOnly ? 'cursor-pointer hover:border-amber-300 hover:bg-amber-50' : 'cursor-default'}`}
                        onClick={() => !readOnly && toggleHighlight(highlight)}
                        role={!readOnly ? "button" : "presentation"}
                        tabIndex={!readOnly ? 0 : -1}
                        onKeyDown={(e) => {
                          if (!readOnly && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault()
                            toggleHighlight(highlight)
                          }
                        }}
                      >
                        {highlight}
                      </Badge>
                    );
                  })}
                </div>

                {!readOnly && (
                  <div className="mt-auto pt-3 lg:pt-4 border-t border-neutral-50">
                    <div className="relative group">
                      <Input
                        type="text"
                        placeholder="Add custom highlight..."
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newHighlight.trim()) {
                            e.preventDefault()
                            addHighlight(newHighlight.trim())
                          }
                        }}
                        className="w-full pr-10 lg:pr-12 h-9 lg:h-11 bg-neutral-50 border-neutral-100 focus:bg-white focus:border-amber-300 rounded-lg lg:rounded-xl text-xs lg:text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (newHighlight.trim()) {
                            addHighlight(newHighlight.trim())
                          }
                        }}
                        className="absolute right-1 top-1 lg:right-1.5 lg:top-1.5 h-7 w-7 lg:h-8 lg:w-8 p-0 text-amber-600 hover:bg-amber-50"
                      >
                        <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </Button>
                    </div>
                    <p className="text-[9px] lg:text-[10px] text-neutral-400 mt-1.5 lg:mt-2 text-center">
                      Press Enter to quickly add a new tag
                    </p>
                  </div>
                )}
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
                variant={viewMode === 'itinerary' ? 'white' : 'ghost'}
                size="sm"
                className={cn(
                  "h-8 text-[10px] lg:text-xs font-bold px-4 rounded-lg transition-all",
                  viewMode === 'itinerary' ? "bg-white shadow-sm text-black" : "text-black"
                )}
                onClick={() => setViewMode('itinerary')}
              >
                Itinerary
              </Button>
              <Button
                variant={viewMode === 'all-inclusions' ? 'white' : 'ghost'}
                size="sm"
                className={cn(
                  "h-8 text-[10px] lg:text-xs font-bold px-4 rounded-lg transition-all",
                  viewMode === 'all-inclusions' ? "bg-white shadow-sm text-black" : "text-black"
                )}
                onClick={() => setViewMode('all-inclusions')}
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
              <span className="hidden sm:inline-block"><Info className="h-3.5 w-3.5" /></span>
              Details
            </Button>

            {/* Switch Group: Detailed, Dates, Pricing */}
            <div className="flex items-center gap-4 lg:gap-6 border-l border-neutral-200 pl-4 lg:pl-6">
              <div className="flex items-center gap-2">
                <Switch id="detailed-v" checked={isDetailedView} onCheckedChange={setIsDetailedView} className="scale-75" />
                <label htmlFor="detailed-v" className="text-[10px] font-bold text-black uppercase">Detailed</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="dates-v" checked={showDates} onCheckedChange={setShowDates} className="scale-75" />
                <label htmlFor="dates-v" className="text-[10px] font-bold text-black uppercase">Dates</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="pricing-v" checked={pricingEnabled} onCheckedChange={(v) => {
                  if (readOnly) return
                  setPricingEnabled(Boolean(v))
                  if (v) setPricingDialogOpen(true)
                }} className="scale-75" disabled={readOnly} />
                <label htmlFor="pricing-v" className={`text-[10px] font-bold uppercase ${readOnly ? 'text-neutral-400' : 'text-black'}`}>Pricing</label>
              </div>
            </div>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-1.5 lg:gap-2 ml-4">
              <select
                value={pricingCurrency}
                onChange={(e) => {
                  const newCurrency = e.target.value
                  setPricingCurrency(newCurrency)
                  if (mode === 'quotation') {
                    setQuotationPricingOptions(prev => ({ ...prev, currency: newCurrency }))
                  }
                }}
                className="h-8 bg-white border border-neutral-200 text-[10px] lg:text-xs font-bold text-black rounded-lg px-2 outline-none cursor-pointer hover:bg-neutral-50"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
                <option value="AED">د.إ AED</option>
              </select>
              <Button variant="ghost" size="icon" onClick={handleCreateCopy} disabled={isSaving} className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg" title="Copy Itinerary">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePreview} disabled={isGeneratingPreview} className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg" title="Preview Itinerary">
                {isGeneratingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              </Button>
              <div className="w-px h-4 bg-neutral-200 mx-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg" title="Share">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg" title="Download PDF">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
          </div>

          {/* Pricing Info Display Row */}        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-4 p-2 lg:p-3 overflow-x-auto custom-scrollbar flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-6 min-w-max">
            {/* Pax & Room Info */}
            <div className="flex items-center gap-2 p-1 bg-neutral-100/50 rounded-xl px-3 h-9">
              <div className="flex items-center gap-1.5 border-r border-neutral-200 pr-3 mr-1">
                <Building2 className="h-3.5 w-3.5 text-neutral-500" />
                <span className="text-[10px] lg:text-xs font-bold text-black uppercase">{pricingRooms} {pricingRooms === 1 ? 'Room' : 'Rooms'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-[10px] lg:text-xs font-bold text-black uppercase">{pricingAdults} Adults</span>
                </div>
                {pricingChildren > 0 && (
                  <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-3">
                    <span className="text-[10px] lg:text-xs font-bold text-black uppercase">{pricingChildren} Children</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nationality & Currency */}
            <div className="flex items-center gap-4 lg:gap-6 border-l border-neutral-200 pl-4 lg:pl-6 h-9">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Nationality:</span>
                <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-100 text-[10px] font-bold uppercase">{pricingNationality}</Badge>
              </div>
              <div className="flex items-center gap-2 border-l border-neutral-200 pl-4 lg:pl-6">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Currency:</span>
                <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-100 text-[10px] font-bold uppercase">{pricingCurrency}</Badge>
              </div>
            </div>
          </div>

          {/* Pricing Dates */}
          <div className="flex items-center gap-4 border-l border-neutral-200 pl-4 h-9">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Travel Dates:</span>
              <span className="text-[10px] lg:text-xs font-bold text-black uppercase">
                {pricingStartDate ? new Date(pricingStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Set Date'}
                {pricingEndDate && ` - ${new Date(pricingEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setPricingDialogOpen(true)}
              className="h-7 w-7 p-0 hover:bg-neutral-100 rounded-full"
            >
              <Plus className="h-3.5 w-3.5 text-neutral-500" />
            </Button>
          </div>
        </div>

        {/* Pricing Options Dialog */}
        <Dialog open={pricingDialogOpen} onOpenChange={(open) => {
          setPricingDialogOpen(open)
          if (!open) setPricingEnabled(false)
        }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Pricing Settings</DialogTitle>
              <DialogDescription>Configure your pricing options</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Pricing mode toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Pricing Mode</label>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricingMode"
                      value="individual"
                      checked={pricingMode === 'individual'}
                      onChange={() => setPricingMode('individual')}
                    />
                    <span>Individual Pricing <span className="text-xs text-gray-500">(Includes total pricing)</span></span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricingMode"
                      value="total-only"
                      checked={pricingMode === 'total-only'}
                      onChange={() => setPricingMode('total-only')}
                    />
                    <span>Only Total Pricing <span className="text-xs text-gray-500">(Show only total at the end)</span></span>
                  </label>
                </div>
              </div>

              {/* Pax Information - with spinner controls */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="text-sm font-semibold">Pax Information</h3>

                {/* Room */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Room</label>
                  <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                    <button onClick={() => setPricingRooms(Math.max(1, pricingRooms - 1))} className="text-gray-500 hover:text-gray-700">−</button>
                    <span className="w-8 text-center font-semibold">{pricingRooms}</span>
                    <button onClick={() => setPricingRooms(pricingRooms + 1)} className="text-gray-500 hover:text-gray-700">+</button>
                  </div>
                </div>

                {/* Adults */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Adults</label>
                  <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                    <button onClick={() => setPricingAdults(Math.max(0, pricingAdults - 1))} className="text-gray-500 hover:text-gray-700">−</button>
                    <span className="w-8 text-center font-semibold">{pricingAdults}</span>
                    <button onClick={() => setPricingAdults(pricingAdults + 1)} className="text-gray-500 hover:text-gray-700">+</button>
                  </div>
                </div>

                {/* Children */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium block">Children</label>
                      <p className="text-xs text-gray-500">0 - 17 Years Old</p>
                    </div>
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                      <button onClick={() => setPricingChildren(Math.max(0, pricingChildren - 1))} className="text-gray-500 hover:text-gray-700">−</button>
                      <span className="w-8 text-center font-semibold">{pricingChildren}</span>
                      <button onClick={() => setPricingChildren(pricingChildren + 1)} className="text-gray-500 hover:text-gray-700">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Nationality */}
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium">Guest Nationality</label>
                <select
                  value={pricingNationality}
                  onChange={(e) => setPricingNationality(e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Indian">Indian</option>
                  <option value="American">American</option>
                  <option value="British">British</option>
                  <option value="Canadian">Canadian</option>
                  <option value="Australian">Australian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Currency */}
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium">Currency</label>
                <select
                  value={pricingCurrency}
                  onChange={(e) => {
                    const newCurrency = e.target.value
                    setPricingCurrency(newCurrency)
                    if (mode === 'quotation') {
                      setQuotationPricingOptions(prev => ({ ...prev, currency: newCurrency }))
                    }
                  }}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="AED">UAE Dirham (د.إ)</option>
                  <option value="dual" disabled>Dual Currency (Coming Soon)</option>
                </select>
              </div>

              {/* Dates */}
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium">Dates</label>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="date"
                    value={pricingStartDate}
                    onChange={(e) => setPricingStartDate(e.target.value)}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {/* End Date is calculated automatically */}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => {
                setPricingDialogOpen(false)
                setPricingEnabled(false)
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                setPricingDialogOpen(false)
              }}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



        {/* Gallery Upload Section */}
        <div className="mb-1">
          <GalleryUpload gallery={gallery} onGalleryUpdate={setGallery} />
        </div>

        {viewMode === 'itinerary' ? (
          <div className="space-y-1.5">
            {/* Overview Card - Appears Above Day 1 */}
            <Card
              className={`relative border-2 ${dropTarget?.dayIndex === -2 ? "border-blue-400" : "border-indigo-200"} bg-indigo-50/30 overflow-hidden rounded-xl`}
              onDragOver={(e) => {
                e.preventDefault()
                handleDragOver(-2, overviewEvents.length)
              }}
              onDrop={() => handleDrop(-2, overviewEvents.length)}
            >
              <CardHeader className="pb-2 pt-3 px-3 lg:px-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <Info className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-base lg:text-lg font-bold text-indigo-900 tracking-tight">OVERVIEW</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newNote: IItineraryEvent = {
                        id: `event-${Date.now()}`,
                        category: "note",
                        title: "Note",
                        description: "",
                        componentSource: "manual",
                        highlights: [],
                        time: "",
                      }
                      setOverviewEvents([...overviewEvents, newNote])
                    }}
                    className="text-xs lg:text-sm w-full sm:w-auto h-8 lg:h-9 bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-1 px-3 lg:px-4 pb-3">
                {overviewEvents.length === 0 ? (
                  <div className="text-center py-6 px-4 border-2 border-dashed border-indigo-100 rounded-xl bg-white/60">
                    <p className="text-xs lg:text-sm text-indigo-400 font-medium">
                      Drag a <strong>Notes</strong> component here or click <strong>Add Note</strong>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 lg:space-y-3">
                    {overviewEvents.map((event, eventIndex) => (
                      <EventCard
                        key={`overview-${event.id}-${eventIndex}`}
                        event={event}
                        isDetailedView={isDetailedView}
                        pricingEnabled={false}
                        pricingAdults={0}
                        pricingChildren={0}
                        pricingCurrency="INR"
                        pricingMode="individual"
                        onDragStart={() => { }}
                        onEdit={() => {
                          // Handle editing overview event
                          setEditingEvent({
                            dayIndex: -2,
                            eventIndex: eventIndex,
                            event: { ...event }
                          })
                          setIsEditModalOpen(true)
                        }}
                        onDelete={() => {
                          const newEvents = [...overviewEvents]
                          newEvents.splice(eventIndex, 1)
                          setOverviewEvents(newEvents)
                        }}
                        onDuplicate={() => {
                          const newEvent = { ...event, id: `event-${Date.now()}` }
                          const newEvents = [...overviewEvents]
                          newEvents.splice(eventIndex + 1, 0, newEvent)
                          setOverviewEvents(newEvents)
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Day Cards */}
            {days.map((day, dayIndex) => (
              <Card
                key={`day-${dayIndex}-${day.day}`}
                className={`relative border-2 ${!readOnly && dropTarget?.dayIndex === dayIndex ? "border-blue-400" : "border-gray-200"} overflow-hidden rounded-xl shadow-sm`}
                onDragOver={(e) => {
                  if (readOnly) return
                  e.preventDefault()
                  handleDragOver(dayIndex, day.events.length)
                }}
                onDrop={() => !readOnly && handleDrop(dayIndex, day.events.length)}
              >
                <CardHeader className="pb-2 pt-3 px-3 lg:px-4 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <DayTitle
                      day={day.day}
                      title={day.title}
                      readOnly={readOnly}
                      onTitleChange={(newTitle) => updateDayTitle(dayIndex, newTitle)}
                    />
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Date Display */}
                      {showDates && pricingStartDate && (() => {
                        const startDate = new Date(pricingStartDate)
                        const currentDate = new Date(startDate)
                        currentDate.setDate(startDate.getDate() + dayIndex)

                        const month = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase()
                        const year = currentDate.getFullYear().toString().slice(-2)
                        const dayNum = currentDate.getDate().toString()
                        const weekday = currentDate.toLocaleString('default', { weekday: 'short' }).toUpperCase()

                        return (
                          <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm w-10 h-10 lg:w-12 lg:h-12 shrink-0 overflow-hidden">
                            <div className="text-[7px] lg:text-[8px] font-bold text-amber-500 uppercase leading-none pt-0.5 lg:pt-1">
                              {month}-{year}
                            </div>
                            <div className="text-base lg:text-lg font-bold text-gray-600 leading-none my-0.5">
                              {dayNum}
                            </div>
                            <div className="text-[7px] lg:text-[8px] font-bold text-amber-500 uppercase leading-none pb-0.5 lg:pb-1">
                              {weekday}
                            </div>
                          </div>
                        )
                      })()}

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleDayCollapse(dayIndex)} className="h-8 w-8 p-0">
                          {collapsedDays.has(dayIndex) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsDetailedView(!isDetailedView)} className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!readOnly && days.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingDayIndex(dayIndex)
                              setDeleteConfirmationOpen(true)
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {!collapsedDays.has(dayIndex) && (
                  <CardContent className="pt-3 px-3 lg:px-4 pb-3">

                    <div className="mt-1 space-y-1.5">
                      {day.events.map((event, eventIndex) => (
                        <EventCard
                          key={`${event.id}-${dayIndex}-${eventIndex}`}
                          event={event}
                          isDetailedView={isDetailedView}
                          nightIndex={event.hotelNightIndex}
                          totalNights={event.hotelTotalNights}
                          dayNumber={dayIndex + 1}
                          pricingEnabled={pricingEnabled}
                          pricingAdults={pricingAdults}
                          pricingChildren={pricingChildren}
                          pricingCurrency={pricingCurrency}
                          pricingRooms={pricingRooms}
                          pricingMode={pricingMode}
                          readOnly={readOnly}
                          onDragStart={() => !readOnly && handleDragStart("event", event, dayIndex, eventIndex)}
                          onEdit={() => !readOnly && handleEditEvent(dayIndex, eventIndex)}
                          onDelete={() => !readOnly && handleDeleteEvent(dayIndex, eventIndex)}
                        />
                      ))}
                    </div>

                    {/* Meals Component - only show if day has a meal event */}
                    {day.events.some(event => event.category === 'meal') && (
                      <DayMeals
                        meals={day.meals || []}
                        onChange={(meal, value) => updateDayMeals(dayIndex, meal, value)}
                      />
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {Object.entries(
              days.reduce((acc, day) => {
                day.events.forEach((event) => {
                  if (!acc[event.category]) {
                    acc[event.category] = []
                  }
                  acc[event.category].push(event)
                })
                return acc
              }, {} as Record<string, IItineraryEvent[]>),
            ).map(([category, events]) => {
              const categoryInfo = COMPONENT_TEMPLATES.find((c) => c.category === category)
              const Icon = categoryInfo?.icon || FileText
              const color = categoryInfo?.color || "bg-gray-50 border-gray-200"
              return (
                <Card key={category} className={`border-2 ${color}`}>
                  <CardHeader className="pt-2 px-2 pb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Icon className="h-4 w-4" />
                      <h3 className="text-base font-semibold capitalize">{category}</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1.5 px-2 pb-2">
                    <div className="space-y-1.5">
                      {events.map((event, index) => {
                        const dayIndex = days.findIndex((day) =>
                          day.events.some((e) => e.id === event.id),
                        )
                        return (
                          <EventCard
                            key={`${event.id}-${index}`}
                            event={event}
                            isDetailedView={isDetailedView}
                            nightIndex={event.hotelNightIndex}
                            totalNights={event.hotelTotalNights}
                            dayNumber={dayIndex + 1}
                            pricingEnabled={pricingEnabled}
                            pricingAdults={pricingAdults}
                            pricingChildren={pricingChildren}
                            pricingCurrency={pricingCurrency}
                            pricingRooms={pricingRooms}
                            pricingMode={pricingMode}
                            onDragStart={() => handleDragStart("event", event)}
                            onEdit={() => {
                              const eventIndex = days[dayIndex].events.findIndex((e) => e.id === event.id)
                              handleEditEvent(dayIndex, eventIndex)
                            }}
                            onDelete={() => {
                              const eventIndex = days[dayIndex].events.findIndex((e) => e.id === event.id)
                              handleDeleteEvent(dayIndex, eventIndex)
                            }}
                          />
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}


        <div className="mt-2 text-center">
          <Button onClick={addDay} variant="outline" className="border-dashed border-2 bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Add Day
          </Button>
        </div>

        <div className="mt-0 mb-0" onDragOver={(e) => { e.preventDefault(); handleDragOver(-1, 0) }} onDrop={() => handleDrop(-1, 0)}>
          <h3 className="text-xs font-semibold mb-0.5 text-gray-700">Additional Information</h3>

          <div className="space-y-0">
            {serviceSlots.length === 0 && (
              <div className="text-xs text-gray-400 p-0.5 border border-dashed border-gray-200 rounded bg-gray-50">Drag here</div>
            )}

            {serviceSlots.map((slot, slotIndex) => (
              <Card key={slot.id} className="border border-dashed border-gray-200 rounded-sm">
                <CardContent className="p-0.5">
                  <div className="space-y-0">
                    {slot.events.map((event, eventIndex) => (
                      <div key={event.id}>
                        <EventCard
                          event={event}
                          isDetailedView={isDetailedView}
                          onDragStart={() => handleDragStart("event", event)}
                          onEdit={() => {
                            // For service slots, we use dayIndex = -1
                            // and eventIndex to map to the slot index (or flat event list if needed)
                            // But usually serviceSlots structure is separate.
                            // Let's assume handleEditEvent can handle dayIndex -1 for serviceSlots.
                            console.log("[DEBUG] Editing service slot:", slotIndex, eventIndex)
                            // We need to pass enough info.
                            // If handleEditEvent only takes (dayIndex, eventIndex), we might need to overload it
                            // OR render a specific Edit modal for this.
                            // But let's try to trace handleEditEvent.
                            // Actually, I'll update this to:
                            handleEditEvent(-1, slotIndex)
                          }}
                          onDelete={() => {
                            const newSlots = [...serviceSlots]
                            newSlots[slotIndex].events.splice(eventIndex, 1)
                            setServiceSlots(newSlots)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Display Section */}
        {pricingEnabled && (
          <div className="mt-12 mb-10 p-8 lg:p-12 rounded-3xl border border-neutral-200 bg-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-12 border-t-[8px] border-t-[#f0c105]/80">
            {(() => {
              const pricingConfig: PricingConfig = {
                adults: pricingAdults,
                children: pricingChildren,
                targetCurrency: pricingCurrency,
                rooms: pricingRooms,
              }
              const allEvents = days.flatMap(day => day.events)
              const { total: basePrice } = calculateTotalPrice(allEvents, pricingConfig)

              let finalTotal = basePrice
              if (markupType === "percentage") {
                finalTotal = basePrice + (basePrice * markupValue / 100)
              } else {
                finalTotal = basePrice + markupValue
              }

              const displayTotal = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: pricingCurrency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(finalTotal)

              const displaySubTotal = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: pricingCurrency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(basePrice)

              const strikethroughDisplay = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: pricingCurrency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(finalTotal * 1.4)

              const totalPax = pricingAdults + pricingChildren

              return (
                <>
                  {/* Left Column: Contextual Branding */}
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-md bg-[#f0c105] text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                      Investment Detail
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-serif text-neutral-900 leading-tight">
                      Pricing Summary
                    </h2>
                    <p className="text-neutral-500 text-sm lg:text-base max-w-md font-medium leading-relaxed">
                      A comprehensive breakdown of your travel investment, tailored to your unique preferences and selected inclusions.
                    </p>
                  </div>

                  {/* Right Column: Sleek Professional Financial Card */}
                  <div className="flex-none w-full md:w-[360px] bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
                    <div className="space-y-4">
                      {/* Header & Currency */}
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Investment Summary</span>
                        <div className="flex justify-end w-[140px]">
                          <select
                            value={pricingCurrency}
                            onChange={(e) => {
                              const newCurrency = e.target.value
                              setPricingCurrency(newCurrency)
                              if (mode === 'quotation') {
                                setQuotationPricingOptions(prev => ({ ...prev, currency: newCurrency }))
                              }
                            }}
                            className="text-[10px] font-bold text-neutral-600 bg-neutral-50 px-2 py-1 rounded border-none outline-none cursor-pointer hover:bg-neutral-100 transition-colors"
                          >
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="AED">AED</option>
                          </select>
                        </div>
                      </div>

                      {/* Vertical Price Stack */}
                      <div className="space-y-3">
                        {/* Base Amount */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-neutral-500">Base Amount</span>
                          <span className="w-[140px] text-right text-sm font-semibold text-neutral-800">{displaySubTotal}</span>
                        </div>

                        {/* Markup Control Section - Perfectly Aligned */}
                        <div className="flex justify-between items-center py-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight flex-shrink-0">Markup</span>
                            <div className="flex bg-neutral-100 rounded border border-neutral-200 p-0.5 scale-90">
                              <button
                                onClick={() => setMarkupType("percentage")}
                                className={cn(
                                  "px-1.5 py-0.5 text-[8px] font-bold rounded transition-colors",
                                  markupType === "percentage" ? "bg-[#f0c105] text-black shadow-xs" : "text-neutral-400 hover:text-neutral-600"
                                )}
                                style={markupType === "percentage" ? { backgroundColor: 'rgba(240, 193, 5, 0.8)' } : {}}
                              >
                                %
                              </button>
                              <button
                                onClick={() => setMarkupType("amount")}
                                className={cn(
                                  "px-1.5 py-0.5 text-[8px] font-bold rounded transition-colors",
                                  markupType === "amount" ? "bg-[#f0c105] text-black shadow-xs" : "text-neutral-400 hover:text-neutral-600"
                                )}
                                style={markupType === "amount" ? { backgroundColor: 'rgba(240, 193, 5, 0.8)' } : {}}
                              >
                                AMT
                              </button>
                            </div>
                          </div>

                          <div className="w-[140px] flex items-center justify-end">
                            <div className="relative flex items-center">
                              <span className="text-[10px] font-bold text-neutral-400 mr-1">
                                {markupType === "amount" ? (pricingCurrency === 'INR' ? '₹' : pricingCurrency) : ""}
                              </span>
                              <Input
                                type="number"
                                value={markupValue || ""}
                                onChange={(e) => setMarkupValue(Number(e.target.value))}
                                className="h-8 w-20 text-right text-xs font-bold bg-white border-neutral-200 px-2 rounded-md focus:ring-1 focus:ring-[#f0c105]/30"
                                placeholder="0"
                              />
                              {markupType === "percentage" && (
                                <span className="text-[10px] font-bold text-neutral-400 ml-1">%</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-3 mt-1">
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Total Investment</span>
                              {totalPax > 0 && <span className="text-[9px] text-neutral-400 font-medium tracking-tight">for {totalPax} Travelers</span>}
                            </div>
                            <span className="w-[140px] text-right text-2xl font-bold text-neutral-900 font-serif leading-none tracking-tight">
                              {displayTotal}
                            </span>
                          </div>
                        </div>

                        {/* Per Person Highlight */}
                        {totalPax > 1 && (
                          <div className="flex justify-between items-center pt-1 text-[11px]">
                            <span className="text-neutral-400 italic">Estimated per person</span>
                            <span className="w-[140px] text-right font-bold" style={{ color: 'rgba(240, 193, 5, 0.8)' }}>
                              {new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: pricingCurrency,
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(finalTotal / totalPax)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="mt-4 mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md h-10 lg:h-11 text-xs lg:text-sm font-bold">
            <Mail className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
            Enquire Now
          </Button>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-10 lg:h-11 text-xs lg:text-sm font-bold">
            <CreditCard className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
            Book Now
          </Button>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md h-10 lg:h-11 text-xs lg:text-sm font-bold">
            <Phone className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
            Call
          </Button>
          <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md h-10 lg:h-11 text-xs lg:text-sm font-bold">
            <MessageCircle className="mr-1.5 lg:mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
            Whatsapp
          </Button>
        </div>

        {/* Library integration panel removed from builder view */}
      </div>

      <div className={`hidden lg:flex border-t lg:border-t-0 lg:border-l bg-white flex-col transition-all duration-300 ${isSidebarMinimized ? 'h-auto lg:h-screen lg:w-20' : 'h-auto lg:h-screen w-full lg:w-80'} lg:sticky lg:top-0`}>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 lg:p-4 border-b flex-shrink-0 flex items-center justify-between bg-gray-50/30">
              {!isSidebarMinimized && <h3 className="font-bold text-sm lg:text-lg text-neutral-800">Components</h3>}
              {isSidebarMinimized && <h3 className="font-bold text-xs lg:hidden">Components</h3>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="h-8 w-8 lg:h-9 lg:w-9 p-0 hover:bg-gray-100"
                title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
              >
                {isSidebarMinimized ? <ChevronLeft className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 lg:rotate-90" />}
              </Button>
            </div>
            
            <div className={`flex-1 overflow-y-auto p-3 lg:p-4 min-h-0 ${isSidebarMinimized ? 'hidden lg:block' : 'block'}`}>
              <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-3 ${isSidebarMinimized ? 'lg:flex lg:flex-col lg:items-center' : ''}`}>
                {COMPONENT_TEMPLATES.filter(c => c.category !== 'visa' && c.category !== 'insurance').map((component) => {
                  const Icon = component.icon
                  return (
                    <Card
                      key={component.category}
                      className={`${component.color} cursor-move hover:shadow-md transition-shadow border shadow-sm ${isSidebarMinimized ? 'lg:w-12 lg:h-12 flex lg:items-center lg:justify-center' : 'h-auto'}`}
                      draggable
                      onDragStart={() => handleDragStart("component", component)}
                      title={isSidebarMinimized ? component.title : undefined}
                    >
                      <CardContent className={isSidebarMinimized ? "p-0 lg:flex lg:items-center lg:justify-center" : "p-2.5 lg:p-3"}>
                        {isSidebarMinimized ? (
                          <div className="hidden lg:flex items-center justify-center w-full h-full">
                            <Icon className="h-5 w-5" />
                          </div>
                        ) : null}
                        {(!isSidebarMinimized || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-3.5 w-3.5 text-gray-400 hidden lg:block" />
                            <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            <span className="font-bold text-[10px] lg:text-sm text-neutral-700 truncate">{component.title}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Quotation Pricing Controls - Only in Quotation Mode */}
            {mode === 'quotation' && (
              <div className={`border-t p-4 flex-shrink-0 bg-gray-50/50 ${isSidebarMinimized ? 'hidden lg:block' : ''}`}>
                <h3 className={`font-bold text-sm lg:text-lg mb-3 ${isSidebarMinimized ? 'hidden' : ''}`}>Pricing & Markup</h3>
                <div className={isSidebarMinimized ? 'hidden' : ''}>
                  <QuotationPricingControls
                    initialOptions={quotationPricingOptions}
                    onOptionsChange={(newOptions: QuotationPricingOptions) => {
                      setQuotationPricingOptions(newOptions)
                      // Sync currency if it changed
                      if (newOptions.currency && newOptions.currency !== pricingCurrency) {
                        setPricingCurrency(newOptions.currency)
                      }
                    }}
                    currency={pricingCurrency}
                  />
                </div>
                {isSidebarMinimized && (
                  <div className="hidden lg:flex justify-center" title="Expand to see pricing controls">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ComponentSourceModal
        isOpen={componentSourceModal.isOpen}
        onClose={() => {
          setComponentSourceModal({ isOpen: false, component: null, dropTarget: null })
        }}
        componentType={componentSourceModal.component?.category || ""}
        componentTitle={componentSourceModal.component?.title || ""}
        onSelectManual={handleSelectManualComponent}
        onSelectLibrary={handleSelectLibraryComponent}
      />

      {editingEvent?.event && (
        <EditEventModal
          event={editingEvent.event}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleSaveEvent}
        />
      )}

      <PreviewConfigModal
        isOpen={showPreviewConfig}
        onClose={() => setShowPreviewConfig(false)}
        onConfirm={handlePreviewConfirm}
      />
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Duplicate Itinerary Name</DialogTitle>
            <DialogDescription>{duplicateDialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDuplicateDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ItineraryDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        guestDetails={guestDetails}
        agencyDetails={agencyDetails}
        headerFooter={headerFooter}
        onSave={(newGuestDetails, newAgencyDetails, newHeaderFooter) => {
          setGuestDetails(newGuestDetails)
          setAgencyDetails(newAgencyDetails)
          setHeaderFooter(newHeaderFooter)
          setHasChanges(true)
        }}
      />



      <Dialog open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden rounded-t-3xl border-none">
          <DialogHeader className="p-4 border-b bg-neutral-50">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-amber-500" />
              Components
            </DialogTitle>
            <DialogDescription>
              Drag or click a component to add it to your itinerary.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-2 gap-3">
              {COMPONENT_TEMPLATES.filter(c => c.category !== 'visa' && c.category !== 'insurance').map((component) => {
                const Icon = component.icon
                return (
                  <Card
                    key={component.category}
                    className={`${component.color} cursor-pointer hover:shadow-md transition-all active:scale-95 border shadow-sm`}
                    onClick={() => {
                      // On mobile, just add to the end of the first day or current active view
                      handleSelectManualComponent(component.category)
                      setMobileSidebarOpen(false)
                    }}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                      <div className="p-2 bg-white/50 rounded-full">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-xs text-neutral-700">{component.title}</span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
          <DialogFooter className="p-4 border-t bg-neutral-50">
            <Button className="w-full font-bold" onClick={() => setMobileSidebarOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={validationErrorOpen} onOpenChange={setValidationErrorOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Required Fields Missing</DialogTitle>
            <DialogDescription className="text-base pt-4">{validationErrorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setValidationErrorOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Day?</DialogTitle>
            <DialogDescription className="text-base pt-4">
              Are you sure you want to delete Day {deletingDayIndex !== null ? deletingDayIndex + 1 : ""}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => {
              setDeleteConfirmationOpen(false)
              setDeletingDayIndex(null)
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingDayIndex !== null) {
                  deleteDay(deletingDayIndex)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Do you want to save before leaving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleConfirmExit(false)} className="sm:flex-1">
              Discard
            </Button>
            <Button onClick={() => handleConfirmExit(true)} className="sm:flex-1 bg-[#2D7CEA] hover:bg-[#1e63c7]">
              Save & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
})

