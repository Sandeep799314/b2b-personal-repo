"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, Share2, Edit, Loader2, Layout } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ImageCollage } from "@/components/image-collage"
import { IGalleryItem } from "@/models/Itinerary"
import { calculateComponentPrice, getExchangeRates, PricingConfig } from "@/lib/pricing-calculator"
import { formatCurrencyWithSymbol } from "@/lib/currency-utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { MinimalistTemplate } from "@/components/itinerary-builder/previews/minimalist-template"
import { ClassicTemplate } from "@/components/itinerary-builder/previews/classic-template"
import LondonItinerary from "@/components/itinerary-builder/previews/new-template"
import { BrandedPremiumTemplate } from "@/components/itinerary-builder/previews/branded-premium-template"
import { EliteEleganceTemplate } from "@/components/itinerary-builder/previews/elite-elegance-template"

interface PreviewItinerary {
  title: string
  description: string
  productId: string
  destination: string
  days: any[]
  nights: number
  branding: {
    logo?: string
    companyName?: string
    contactEmail?: string
    contactPhone?: string
    address?: string
    socialLinks?: {
      instagram?: string
      whatsapp?: string
      facebook?: string
      twitter?: string
      youtube?: string
      website?: string
    }
  }
  totalPrice: number
  currency?: string
  markupType?: "percentage" | "amount"
  markupValue?: number
  generatedAt: string
  additionalSections: Record<string, string>
  gallery?: IGalleryItem[]
  previewConfig?: {
    adults: number
    children: number
    withDates: boolean
    startDate?: string
    template: number
    customerName?: string
  }
  itineraryId?: string | null
  itineraryType?: string
  _id?: string
  headerFooter?: {
    headerImage?: string
    footerImage?: string
    contactInfo?: string
    showOnAllPages?: boolean
  }
  agencyDetails?: {
    logo?: string
    name?: string
    address?: string
    phone?: string
    email?: string
    gst?: string
  }
}

export default function ItineraryPreviewPage() {
  const [itinerary, setItinerary] = useState<PreviewItinerary | null>(null)
  const [allCompanies, setAllCompanies] = useState<any[]>([])
  const [isDetailedView, setIsDetailedView] = useState(true)
  const [showPrices, setShowPrices] = useState(true)
  const [showItemizedPrices, setShowItemizedPrices] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<number>(4) // Default to new Branded template
  const [pricingCurrency, setPricingCurrency] = useState("USD")
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [collapsedDays, setCollapsedDays] = useState<Record<number, boolean>>({})

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const ratesData = await getExchangeRates()
        setExchangeRates(ratesData.rates)
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error)
      }
    }
    fetchRates()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const previewData = localStorage.getItem("itinerary-preview")
      if (previewData) {
        try {
          const parsedData = JSON.parse(previewData)
          
          // Fetch settings to get company list
          try {
            const res = await fetch("/api/settings")
            if (res.ok) {
              const settings = await res.json()
              let companies = settings.companies || []
              
              // Ensure global branding is in the list as well if it has a name
              if (settings.branding?.companyName) {
                const defaultExists = companies.some((c: any) => c.id === "default" || c.companyName === settings.branding.companyName)
                if (!defaultExists) {
                  companies = [{ ...settings.branding, id: settings.branding.id || "default", isDefaultBrand: true }, ...companies]
                }
              }
              
              setAllCompanies(companies)

              // If branding is missing, use default
              if (!parsedData.branding || !parsedData.branding.companyName) {
                parsedData.branding = settings.branding || {}
              }
            }
          } catch (err) {
            console.error("Failed to fetch settings:", err)
          }

          setItinerary(parsedData)
          if (parsedData.previewConfig?.template) {
            setSelectedTemplate(parsedData.previewConfig.template)
          }
          if (parsedData.currency) {
            setPricingCurrency(parsedData.currency)
          }
        } catch (error) {
          console.error("Failed to parse preview data:", error)
        }
      }
    }
    loadData()
  }, [])

  const handleCompanyChange = (companyId: string) => {
    const selected = allCompanies.find(c => c.id === companyId)
    if (selected && itinerary) {
      const updated = {
        ...itinerary,
        branding: {
          ...selected,
          socialLinks: selected.socialLinks || {}
        }
      }
      setItinerary(updated)
      localStorage.setItem("itinerary-preview", JSON.stringify(updated))
      toast({
        title: "Brand Updated",
        description: `Switched to ${selected.companyName}`
      })
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const printContent = document.getElementById("preview-content")
      if (!printContent) throw new Error("Preview content not found")

      const printWindow = window.open("", "_blank")
      if (!printWindow) throw new Error("Failed to open print window")

      const styles = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
          @media print {
            @page { margin: 0.5in; size: A4; }
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Inter', sans-serif; }
            .no-print { display: none !important; }
          }
        </style>
      `

      const clonedContent = printContent.cloneNode(true) as HTMLElement
      printWindow.document.write(`
        <html>
          <head>
            <title>${itinerary?.title || "Itinerary"}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            ${styles}
          </head>
          <body>${clonedContent.innerHTML}</body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast({ title: "Link Copied", description: "Preview link copied to clipboard!" })
    } finally {
      setIsSharing(false)
    }
  }

  const handleEdit = () => {
    const id = itinerary?._id || itinerary?.itineraryId
    const type = itinerary?.itineraryType || "customized-package"
    const mode = (itinerary as any)?.mode || "itinerary"
    const quotationId = (itinerary as any)?.quotationId

    if (mode === "quotation" && quotationId) {
      router.push(`/quotation-builder/${quotationId}`)
    } else if (id) {
      router.push(`/itinerary/builder?id=${id}&mode=edit&type=${type}`)
    } else {
      router.push(`/itinerary/builder`)
    }
  }

  const handleBackToLibrary = () => {
    router.push("/library")
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white border-b px-6 py-4 no-print sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()} size="sm" className="h-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1" /> {/* Divider */}
            <Button variant="ghost" onClick={handleEdit} size="sm">
              <Edit className="h-4 w-4 mr-2 text-blue-600" />
              Editor
            </Button>
            <Button variant="ghost" onClick={handleBackToLibrary} size="sm">
              <Layout className="h-4 w-4 mr-2 text-purple-600" />
              Library
            </Button>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-lg border">
            {/* 1. Template Select */}
            <Select value={selectedTemplate.toString()} onValueChange={(v) => setSelectedTemplate(parseInt(v))}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-white font-medium">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Minimalist</SelectItem>
                <SelectItem value="2">Classic</SelectItem>
                <SelectItem value="3">Editorial</SelectItem>
                <SelectItem value="4">Branded Premium</SelectItem>
                <SelectItem value="5">Elite Elegance</SelectItem>
              </SelectContent>
            </Select>

            {/* 2. Entity (Agency Profile) */}
            {allCompanies.length > 0 && (
              <Select 
                value={(itinerary?.branding as any)?.id || ""} 
                onValueChange={handleCompanyChange}
              >
                <SelectTrigger className="w-[150px] h-8 text-xs bg-white border-emerald-200 text-emerald-700 font-medium">
                  <SelectValue placeholder="Switch Brand" />
                </SelectTrigger>
                <SelectContent>
                  {allCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* 3. INR (Currency) */}
            <Select value={pricingCurrency} onValueChange={setPricingCurrency}>
              <SelectTrigger className="w-[80px] h-8 text-xs bg-white font-bold border-amber-200 text-amber-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>

            {/* 4. Price Toggle */}
            <div className="flex items-center gap-2 px-2 border-l border-r">
              <span className="text-[10px] font-bold uppercase text-slate-500">Price</span>
              <Switch checked={showPrices} onCheckedChange={setShowPrices} />
            </div>

            {/* 5. Details Toggle */}
            <div className="flex items-center gap-2 px-2">
              <span className="text-[10px] font-bold uppercase text-slate-500">Details</span>
              <Switch checked={isDetailedView} onCheckedChange={setIsDetailedView} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm" onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Preview Content */}
      <div id="preview-content" className="max-w-5xl mx-auto py-8 px-4">
        {selectedTemplate === 1 && (
          <MinimalistTemplate itinerary={itinerary} showPrices={showPrices} showItemizedPrices={showItemizedPrices} isDetailed={isDetailedView} currency={pricingCurrency} exchangeRates={exchangeRates} />
        )}
        {selectedTemplate === 2 && (
          <ClassicTemplate itinerary={itinerary} showPrices={showPrices} showItemizedPrices={showItemizedPrices} isDetailed={isDetailedView} currency={pricingCurrency} exchangeRates={exchangeRates} />
        )}
        {selectedTemplate === 3 && (
          <LondonItinerary itinerary={itinerary} showPrices={showPrices} showItemizedPrices={showItemizedPrices} isDetailed={isDetailedView} currency={pricingCurrency} exchangeRates={exchangeRates} />
        )}
        {selectedTemplate === 4 && (
          <BrandedPremiumTemplate itinerary={itinerary} showPrices={showPrices} showItemizedPrices={showItemizedPrices} isDetailed={isDetailedView} currency={pricingCurrency} exchangeRates={exchangeRates} />
        )}
        {selectedTemplate === 5 && (
          <EliteEleganceTemplate itinerary={itinerary} showPrices={showPrices} showItemizedPrices={showItemizedPrices} isDetailed={isDetailedView} currency={pricingCurrency} exchangeRates={exchangeRates} />
        )}
      </div>
    </div>
  )
}
