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



interface PreviewItinerary {

  title: string

  description: string

  productId: string

  country: string

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
  currency?: string
  _id?: string
}



export default function ItineraryPreviewPage() {

  const [itinerary, setItinerary] = useState<PreviewItinerary | null>(null)

  const [isDetailedView, setIsDetailedView] = useState(true)

  const [showPrices, setShowPrices] = useState(true)
  const [showItemizedPrices, setShowItemizedPrices] = useState(true)

  const [selectedTemplate, setSelectedTemplate] = useState<number>(2)
  const [pricingCurrency, setPricingCurrency] = useState("USD")
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})

  useEffect(() => {
    // Fetch exchange rates
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
    if (itinerary?.currency) {
      setPricingCurrency(itinerary.currency)
    }
  }, [itinerary])



  const [isExporting, setIsExporting] = useState(false)

  const [isSharing, setIsSharing] = useState(false)

  const [collapsedDays, setCollapsedDays] = useState<Record<number, boolean>>({})

  const router = useRouter()

  const { toast } = useToast()



  useEffect(() => {

    const previewData = localStorage.getItem("itinerary-preview")

    if (previewData) {

      try {

        const parsedData = JSON.parse(previewData)

        setItinerary(parsedData)
        if (parsedData.previewConfig?.template) {
          setSelectedTemplate(parsedData.previewConfig.template)
        }

      } catch (error) {

        console.error("Failed to parse preview data:", error)

        toast({

          title: "Preview Error",

          description: "Failed to load preview data. Please try again.",

          variant: "destructive",

        })

      }

    }

  }, [toast])



  const handleExportPDF = async () => {

    setIsExporting(true)

    try {

      const printContent = document.getElementById("preview-content")

      if (!printContent) {

        throw new Error("Preview content not found")

      }



      const printWindow = window.open("", "_blank")

      if (!printWindow) {

        throw new Error("Failed to open print window")

      }



      const styles = `

        <style>

          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

          @media print {

            @page { 

              margin: 0.75in; 

              size: A4;

            }

            body { 

              -webkit-print-color-adjust: exact !important;

              print-color-adjust: exact !important;

              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

              line-height: 1.6;

              color: #1a1a1a;

              background: white;

            }

            .no-print { display: none !important; }

            .page-break { page-break-before: always; }

            .avoid-break { page-break-inside: avoid; }

            .hero-title { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 700; }

            .section-title { font-family: 'Playfair Display', serif; font-size: 1.75rem; font-weight: 600; }

            .day-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 600; }

            .event-card { 

              border: none;

              border-left: 4px solid #e5e7eb;

              border-radius: 0;

              padding: 1.5rem;

              margin-bottom: 1.5rem;

              background: #fefefe;

              box-shadow: 0 2px 8px rgba(0,0,0,0.08);

            }

            .luxury-gradient {

              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

              color: white;

            }

            .price-tag {

              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);

              color: white;

              padding: 0.5rem 1rem;

              border-radius: 25px;

              font-weight: 600;

              font-size: 0.9rem;

            }

            .gallery-grid {

              display: grid;

              gap: 0.5rem;

              margin: 1rem 0;

            }

            /* Template 2 Specific Styles */

            .timeline-dot {

              width: 4rem;

              height: 4rem;

              border-radius: 50%;

              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);

              display: flex;

              align-items: center;

              justify-content: center;

              color: white;

              font-weight: bold;

              font-size: 1.25rem;

              box-shadow: 0 4px 12px rgba(0,0,0,0.15);

              border: 4px solid white;

            }

            .timeline-line {

              position: absolute;

              left: 2rem;

              top: 6rem;

              width: 2px;

              background: linear-gradient(to bottom, #3b82f6, #8b5cf6);

              z-index: 0;

            }

            .event-card-t2 {

              background: white;

              border-radius: 1rem;

              box-shadow: 0 4px 12px rgba(0,0,0,0.08);

              border: 1px solid #e5e7eb;

              padding: 1.5rem;

              margin-bottom: 1rem;

            }

            .category-icon {

              width: 3rem;

              height: 3rem;

              border-radius: 0.75rem;

              display: flex;

              align-items: center;

              justify-content: center;

              color: white;

              font-size: 1.125rem;

              box-shadow: 0 2px 8px rgba(0,0,0,0.1);

            }

          }

          body { 

            margin: 0; 

            padding: 0;

            background: white;

            font-family: 'Inter', sans-serif;

          }

          /* Template 2 Print Adjustments */

          @media print {

            .timeline-line { display: none; }

            .timeline-dot { 

              width: 3rem; 

              height: 3rem; 

              font-size: 1rem;

              margin-bottom: 1rem;

            }

            .event-card-t2 {

              box-shadow: none;

              border: 1px solid #d1d5db;

              margin-bottom: 1.5rem;

            }

            .category-icon {

              width: 2.5rem;

              height: 2.5rem;

              font-size: 1rem;

            }

          }

        </style>

      `



      const clonedContent = printContent.cloneNode(true) as HTMLElement

      const interactiveElements = clonedContent.querySelectorAll("button, .no-print")

      interactiveElements.forEach((el) => el.remove())



      printWindow.document.write(`

        <!DOCTYPE html>

        <html>
          <head>
            <title>${itinerary?.title || "Itinerary"} - ${itinerary?.productId}</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['Inter', 'sans-serif'],
                      serif: ['Playfair Display', 'serif'],
                    },
                    colors: {
                      border: "hsl(var(--border))",
                      input: "hsl(var(--input))",
                      ring: "hsl(var(--ring))",
                      background: "hsl(var(--background))",
                      foreground: "hsl(var(--foreground))",
                    }
                  }
                }
              }
            </script>
            ${styles}
          </head>
          <body>
            ${clonedContent.innerHTML}
          </body>
        </html>
      `)





      printWindow.document.close()



      setTimeout(() => {

        printWindow.print()

        printWindow.onafterprint = () => printWindow.close()

      }, 1000)



      toast({

        title: "Export Started",

        description: "PDF export dialog opened. Choose 'Save as PDF' in the print dialog.",

      })

    } catch (error) {

      console.error("Export failed:", error)

      toast({

        title: "Export Failed",

        description: "Failed to export PDF. Please try again.",

        variant: "destructive",

      })

    } finally {

      setIsExporting(false)

    }

  }



  const handleShare = async () => {

    setIsSharing(true)

    try {

      const shareData = {

        title: `${itinerary?.title} - Travel Itinerary`,

        text: `Check out this ${itinerary?.days?.length} -day travel itinerary: ${itinerary?.description} `,

        url: window.location.href,

      }



      if (navigator.share && navigator.canShare(shareData)) {

        await navigator.share(shareData)

        toast({

          title: "Shared Successfully",

          description: "Itinerary shared successfully!",

        })

      } else {

        const shareText = `${shareData.title} \n${shareData.text} \n${shareData.url} `

        await navigator.clipboard.writeText(shareText)

        toast({

          title: "Copied to Clipboard",

          description: "Itinerary details copied to clipboard!",

        })

      }

    } catch (error) {

      console.error("Share failed:", error)

      toast({

        title: "Share Failed",

        description: "Failed to share itinerary. Please try again.",

        variant: "destructive",

      })

    } finally {

      setIsSharing(false)

    }

  }



  const handleEdit = () => {
    // If no itinerary data, try to recover from local storage or fail safe
    const type = itinerary?.itineraryType || "customized-package"
    // Prefer the ID from the object, but if missing (e.g. new preview), check URL or storage
    let rawId = itinerary?.itineraryId || itinerary?._id

    if (!rawId && typeof window !== "undefined") {
      // Fallback to what might have been stored during the builder session
      const fallbackId = window.localStorage.getItem("currentItineraryId")
      if (fallbackId) {
        rawId = fallbackId
      }
    }

    if (rawId) {
      router.push(`/itinerary/builder?id=${rawId.toString()}&mode=edit&type=${type}`)
    } else {
      // If we really don't have an ID, we might be previewing a fresh unsaved state?
      // But typically we should have an ID. If not, just go back to builder base.
      router.push(`/itinerary/builder?mode=edit&type=${type}`)
    }
  }



  const getEventIcon = (category: string) => {

    const icons = {

      flight: "âœˆ",

      hotel: "ðŸ¨",

      activity: "ðŸŽ¯",

      transfer: "ðŸš—",

      meal: "ðŸ½",

      image: "ðŸ“·",

      heading: "ðŸ“",

      paragraph: "ðŸ“„",

      list: "ðŸ“‹",

    }

    return icons[category as keyof typeof icons] || "ðŸ“"

  }



  const formatPrice = (price: number) => {

    return new Intl.NumberFormat("en-US", {

      style: "currency",

      currency: "USD",

    }).format(price)

  }







  const toggleDayCollapse = (dayNumber: number) => {
    setCollapsedDays((previous) => ({
      ...previous,
      [dayNumber]: !previous[dayNumber],
    }))
  }

  const getDayDate = (dayNumber: number) => {
    if (!itinerary?.previewConfig?.withDates || !itinerary.previewConfig?.startDate) {
      return null
    }
    const baseDate = new Date(itinerary.previewConfig.startDate)
    baseDate.setDate(baseDate.getDate() + (dayNumber - 1))
    return baseDate
  }






  if (!itinerary) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <div className="text-center">

          <h2 className="text-xl font-semibold mb-2">No Preview Data</h2>

          <p className="text-gray-600 mb-4">Please generate a preview from the itinerary builder.</p>

          <Button onClick={() => router.back()}>

            <ArrowLeft className="h-4 w-4 mr-2" />

            Go Back

          </Button>

        </div>

      </div>

    )

  }



  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* Header */}

      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 no-print sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleEdit} className="hover:bg-gray-100/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            {/* Title block removed as per user request to save space */}
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1.5 border border-gray-200">
            <div className="flex items-center space-x-2 px-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                Detailed
              </label>
              <Switch checked={isDetailedView} onCheckedChange={setIsDetailedView} className="scale-75 origin-left" />
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-2 px-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                Pricing
              </label>
              <Switch checked={showPrices} onCheckedChange={setShowPrices} className="scale-75 origin-left" />
            </div>
            {showPrices && (
              <>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2 px-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 whitespace-nowrap">
                    Itemized
                  </label>
                  <Switch checked={showItemizedPrices} onCheckedChange={setShowItemizedPrices} className="scale-75 origin-left" />
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <Select
                  value={pricingCurrency}
                  onValueChange={setPricingCurrency}
                >
                  <SelectTrigger className="w-[85px] h-8 bg-transparent border-0 focus:ring-0 px-2 text-xs font-semibold text-gray-700">
                    <SelectValue placeholder="INR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
            <label className="text-sm font-medium text-gray-700">Template</label>
            <Select
              value={selectedTemplate.toString()}
              onValueChange={(val) => setSelectedTemplate(parseInt(val))}
            >
              <SelectTrigger className="w-[110px] h-8 bg-white text-xs">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Minimalist</SelectItem>
                <SelectItem value="2">Classic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={handleEdit} className="hover:bg-gray-50">

            <Edit className="h-4 w-4 mr-2" />

            Edit

          </Button>

          <Button variant="outline" onClick={handleShare} disabled={isSharing} className="hover:bg-gray-50">

            {isSharing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}

            Share

          </Button>

          <Button onClick={handleExportPDF} disabled={isExporting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">

            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}

            Export PDF

          </Button>

        </div>

      </div>




      {/* Content */}

      <div id="preview-content" className="max-w-5xl mx-auto p-4 space-y-6">

        {selectedTemplate === 1 ? (
          <MinimalistTemplate
            itinerary={itinerary}
            showPrices={showPrices}
            showItemizedPrices={showItemizedPrices}
            isDetailed={isDetailedView}
            currency={pricingCurrency}
            exchangeRates={exchangeRates}
          />
        ) : (
          <ClassicTemplate
            itinerary={itinerary}
            showPrices={showPrices}
            showItemizedPrices={showItemizedPrices}
            isDetailed={isDetailedView}
            currency={pricingCurrency}
            exchangeRates={exchangeRates}
          />
        )}

      </div>

    </div >

  )

}









