"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Eye, Lock, Calendar, MapPin, DollarSign, Users, Clock, Loader2, Share2, Download, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IPublicShare } from "@/models/PublicShare"
import { IItinerary } from "@/models/Itinerary"
import { ImageCollage } from "@/components/image-collage"
import { convertCurrency, formatCurrencyWithSymbol } from "@/lib/currency-utils"
import { getExchangeRates } from "@/lib/pricing-calculator"

interface PublicShareData extends IPublicShare {
  itinerary?: IItinerary
  itineraries?: IItinerary[]
}

export default function PublicSharePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [shareData, setShareData] = useState<PublicShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  const shareId = params.shareId as string

  useEffect(() => {
    if (shareId) {
      fetchShareData()
    }
  }, [shareId])

  const fetchShareData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/shares/${shareId}`)

      if (response.status === 404) {
        setError("Share not found or has been removed")
        return
      }

      if (response.status === 410) {
        setError("This share has expired")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch share data")
      }

      const data = await response.json()
      const share = data.share as PublicShareData

      if (share.passwordProtected && !verified) {
        setPasswordRequired(true)
        setShareData(share)
      } else {
        setShareData(share)
        // Track view
        trackView()
      }
    } catch (err) {
      console.error("Error fetching share:", err)
      setError("Failed to load share data")
    } finally {
      setLoading(false)
    }
  }

  const trackView = async () => {
    try {
      await fetch(`/api/shares/${shareId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
    } catch (err) {
      console.error("Error tracking view:", err)
    }
  }

  const verifyPassword = async () => {
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the password to access this share",
        variant: "destructive"
      })
      return
    }

    try {
      setVerifying(true)
      const response = await fetch(`/api/shares/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      })

      if (response.status === 401) {
        toast({
          title: "Invalid Password",
          description: "The password you entered is incorrect",
          variant: "destructive"
        })
        return
      }

      if (!response.ok) {
        throw new Error("Failed to verify password")
      }

      setVerified(true)
      setPasswordRequired(false)
      trackView()

      toast({
        title: "Access Granted",
        description: "Password verified successfully"
      })
    } catch (err) {
      console.error("Error verifying password:", err)
      toast({
        title: "Verification Failed",
        description: "Failed to verify password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleShare = async () => {
    try {
      const shareInfo = {
        title: `${shareData?.title} - Travel Itinerary`,
        text: shareData?.description || "Check out this amazing travel itinerary!",
        url: window.location.href,
      }

      if (navigator.share && navigator.canShare(shareInfo)) {
        await navigator.share(shareInfo)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard!"
        })
      }
    } catch (err) {
      console.error("Share failed:", err)
      toast({
        title: "Share Failed",
        description: "Failed to share. Please try again.",
        variant: "destructive"
      })
    }
  }

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(price)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      "fixed-group-tour": "bg-blue-100 text-blue-800",
      "customized-package": "bg-green-100 text-green-800",
      "cart-combo": "bg-purple-100 text-purple-800",
      "html-editor": "bg-orange-100 text-orange-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      "fixed-group-tour": "Fixed Group Tour",
      "customized-package": "Customized Package",
      "cart-combo": "Cart/Combo",
      "html-editor": "Custom Content"
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shared content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Lock className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (passwordRequired && !verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-blue-500 mb-4">
              <Lock className="h-12 w-12 mx-auto" />
            </div>
            <CardTitle>Protected Content</CardTitle>
            <p className="text-gray-600">This content is password protected</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && verifyPassword()}
              />
            </div>
            <Button
              onClick={verifyPassword}
              disabled={verifying}
              className="w-full"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Access Content"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No data available</p>
      </div>
    )
  }

  const branding = shareData.settings.customBranding ||
    (shareData.shareType === "individual" ? shareData.itinerary?.branding : null)

  // Helper to safely get branding properties
  const getBrandingProp = (prop: string) => {
    if (shareData.settings.customBranding) {
      return (shareData.settings.customBranding as any)[prop]
    }
    if (shareData.shareType === "individual" && shareData.itinerary?.branding) {
      // Map itinerary branding to custom branding structure
      const itineraryBranding = shareData.itinerary.branding
      switch (prop) {
        case 'logo':
          return itineraryBranding.headerLogo
        case 'primaryColor':
          return itineraryBranding.primaryColor
        case 'companyName':
          return itineraryBranding.headerText
        default:
          return undefined
      }
    }
    return undefined
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white shadow-sm border-b"
        style={{
          backgroundColor: getBrandingProp('primaryColor') || "#ffffff",
          color: getBrandingProp('primaryColor') ? "#ffffff" : "#1f2937"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getBrandingProp('logo') && (
                <img
                  src={getBrandingProp('logo')}
                  alt="Logo"
                  className="h-10 w-auto"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{shareData.title}</h1>
                {shareData.description && (
                  <p className="text-sm opacity-80">{shareData.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {shareData.globalEnquireLink && (
                <Button
                  onClick={() => window.open(shareData.globalEnquireLink, '_blank')}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Enquire Now
                </Button>
              )}
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="bg-white text-gray-700 hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {shareData.shareType === "individual" && shareData.itinerary ? (
          <IndividualItineraryView
            itinerary={shareData.itinerary}
            settings={shareData.settings}
            pricingOptions={shareData.pricingOptions}
            globalEnquireLink={shareData.globalEnquireLink}
          />
        ) : shareData.shareType === "collection" && shareData.itineraries ? (
          <CollectionView
            itineraries={shareData.itineraries}
            settings={shareData.settings}
            pricingOptions={shareData.pricingOptions}
            perItinerarySettings={shareData.perItinerarySettings}
            globalEnquireLink={shareData.globalEnquireLink}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No content available</p>
          </div>
        )}
      </main>

      {/* Footer */}
      {shareData.settings.showContactInfo && getBrandingProp('companyName') && (
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{getBrandingProp('companyName')}</h3>
              {getBrandingProp('contactEmail') && (
                <p className="text-gray-600">Email: {getBrandingProp('contactEmail')}</p>
              )}
              {getBrandingProp('contactPhone') && (
                <p className="text-gray-600">Phone: {getBrandingProp('contactPhone')}</p>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

function IndividualItineraryView({
  itinerary,
  settings,
  pricingOptions,
  globalEnquireLink
}: {
  itinerary: IItinerary
  settings: any
  pricingOptions?: {
    markupType: "percentage" | "fixed"
    markupValue: number
    showOriginalPrice: boolean
    showIndividualPricing?: boolean
    pricingCurrency?: string
  }
  globalEnquireLink?: string
}) {
  // Get exchange rates for currency conversion
  const { rates: exchangeRates, baseCurrency } = getExchangeRates()
  const targetCurrency = pricingOptions?.pricingCurrency || itinerary.currency || "INR"
  const showIndividualPricing = pricingOptions?.showIndividualPricing !== false // Default true

  // Convert and format price with currency conversion and optional markup
  const formatPriceWithConversion = (price: number, fromCurrency: string = "INR") => {
    // Convert to target currency
    const convertedPrice = convertCurrency(
      price,
      fromCurrency,
      targetCurrency,
      exchangeRates,
      baseCurrency
    )
    // Apply markup
    let finalPrice = convertedPrice
    if (pricingOptions?.markupValue) {
      if (pricingOptions.markupType === "percentage") {
        finalPrice = convertedPrice * (1 + pricingOptions.markupValue / 100)
      } else {
        // For fixed markup, convert the markup value too
        const convertedMarkup = convertCurrency(
          pricingOptions.markupValue,
          baseCurrency,
          targetCurrency,
          exchangeRates,
          baseCurrency
        )
        finalPrice = convertedPrice + convertedMarkup
      }
    }
    return formatCurrencyWithSymbol(finalPrice, targetCurrency)
  }

  // Format original price (for strikethrough display)
  const formatOriginalPrice = (price: number, fromCurrency: string = "INR") => {
    const convertedPrice = convertCurrency(
      price,
      fromCurrency,
      targetCurrency,
      exchangeRates,
      baseCurrency
    )
    return formatCurrencyWithSymbol(convertedPrice, targetCurrency)
  }

  // Legacy formatPrice for non-converted display
  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(price)
  }

  // Apply markup to price (for individual events)
  const applyMarkup = (price: number): number => {
    if (!pricingOptions || !pricingOptions.markupValue) return price
    if (pricingOptions.markupType === "percentage") {
      return price * (1 + pricingOptions.markupValue / 100)
    } else {
      return price + pricingOptions.markupValue
    }
  }

  // Get the display price (with conversion and markup)
  const getDisplayPrice = (price: number, currency: string = "INR") => {
    return formatPriceWithConversion(price, currency)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      "fixed-group-tour": "bg-blue-100 text-blue-800",
      "customized-package": "bg-green-100 text-green-800",
      "cart-combo": "bg-purple-100 text-purple-800",
      "html-editor": "bg-orange-100 text-orange-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      "fixed-group-tour": "Fixed Group Tour",
      "customized-package": "Customized Package",
      "cart-combo": "Cart/Combo",
      "html-editor": "Custom Content"
    }
    return labels[type as keyof typeof labels] || type
  }
  return (
    <div className="space-y-8">
      {/* Header Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold">{itinerary.title}</h2>
                <Badge className={getTypeColor(itinerary.type)}>
                  {getTypeLabel(itinerary.type)}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{itinerary.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{itinerary.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{itinerary.duration}</span>
                </div>
                {settings.showPricing && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">
                      {getDisplayPrice(itinerary.totalPrice, itinerary.currency)}
                    </span>
                    {pricingOptions?.showOriginalPrice && pricingOptions.markupValue > 0 && (
                      <span className="text-gray-400 line-through text-sm">
                        {formatOriginalPrice(itinerary.totalPrice, itinerary.currency)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {itinerary.gallery && itinerary.gallery.length > 0 && (
              <div>
                <ImageCollage gallery={itinerary.gallery} className="max-h-[300px]" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Global Enquire Button (Mobile/Prominent placement) */}
      {/* If globalEnquireLink is present, we already showed it in header, but we can also show it here or keep it just in header. 
          The user requested "right top of each weblink", which is the header. 
          For individual view, they also said "view detail option on each itinerary in it i want you to add a enquire now button also in each itinerary over there".
          Since this is the Individual View itself, the header button serves this purpose. 
      */}

      {/* Highlights */}
      {itinerary.highlights && itinerary.highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-2">
              {itinerary.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Days */}
      {itinerary.days && itinerary.days.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Detailed Itinerary</h3>
          {itinerary.days.map((day, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Day {day.day}: {day.title}
                  </CardTitle>
                  <Badge variant="outline">{day.date}</Badge>
                </div>
                {day.description && (
                  <p className="text-gray-600">{day.description}</p>
                )}
              </CardHeader>
              <CardContent>
                {day.events && day.events.length > 0 && (
                  <div className="space-y-4">
                    {day.events.map((event, eventIndex) => {
                      // Category-specific styling
                      const categoryColors: Record<string, string> = {
                        flight: "border-sky-400 bg-sky-50",
                        hotel: "border-emerald-400 bg-emerald-50",
                        activity: "border-purple-400 bg-purple-50",
                        transfer: "border-orange-400 bg-orange-50",
                        meal: "border-amber-400 bg-amber-50",
                        ancillaries: "border-indigo-400 bg-indigo-50",
                        cruise: "border-cyan-400 bg-cyan-50",
                        others: "border-slate-400 bg-slate-50",
                        other: "border-slate-400 bg-slate-50",
                        note: "border-yellow-400 bg-yellow-50",
                      }
                      const colorClass = categoryColors[event.category] || "border-gray-300 bg-gray-50"

                      return (
                        <div key={eventIndex} className={`border-l-4 ${colorClass} p-4 rounded-r-lg`}>
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="capitalize">{event.category}</Badge>
                            <span className="font-semibold text-lg">{event.title}</span>
                          </div>

                          {/* Description */}
                          {event.description && event.description !== "No description provided" && (
                            <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                          )}

                          {/* ========== FLIGHT ========== */}
                          {event.category === "flight" && (
                            <div className="space-y-2 text-sm">
                              {/* Route */}
                              {(event.fromCity || event.toCity) && (
                                <div className="flex items-center gap-2 font-medium">
                                  <span className="text-sky-600">{event.fromCity}</span>
                                  <span>→</span>
                                  <span className="text-sky-600">{event.toCity}</span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                                {event.airlines && <span>✈️ {event.airlines}</span>}
                                {event.flightNumber && <span>Flight: {event.flightNumber}</span>}
                                {event.flightClass && <span>Class: {event.flightClass}</span>}
                                {event.startTime && <span>Departure: {event.startTime}</span>}
                                {event.endTime && <span>Arrival: {event.endTime}</span>}
                                {event.pnr && <span>PNR: {event.pnr}</span>}
                                {event.numberOfStops !== undefined && (
                                  <span>Stops: {event.numberOfStops === 0 ? "Non-stop" : event.numberOfStops}</span>
                                )}
                                {event.refundable && <span>Refundable: {event.refundable}</span>}
                              </div>
                              {/* Baggage */}
                              {(event.checkinBags || event.cabinBags || event.baggage) && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Baggage: </span>
                                  {event.checkinBags && <span>Check-in: {event.checkinBags} bag(s) {event.checkinBagWeight && `@ ${event.checkinBagWeight}`}</span>}
                                  {event.cabinBags && <span> | Cabin: {event.cabinBags} bag(s) {event.cabinBagWeight && `@ ${event.cabinBagWeight}`}</span>}
                                  {event.baggage && !event.checkinBags && <span>{event.baggage}</span>}
                                </div>
                              )}
                              {event.flightNotes && <p className="text-gray-500 italic">{event.flightNotes}</p>}
                            </div>
                          )}

                          {/* ========== HOTEL ========== */}
                          {event.category === "hotel" && (
                            <div className="space-y-2 text-sm">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                                {event.hotelName && <span className="font-medium col-span-full">🏨 {event.hotelName}</span>}
                                {event.roomCategory && <span>Room: {event.roomCategory}</span>}
                                {event.hotelRating && <span>Rating: {"⭐".repeat(event.hotelRating)}</span>}
                                {event.mealPlan && <span>Meals: {event.mealPlan}</span>}
                                {event.checkIn && <span>Check-in: {event.checkIn}</span>}
                                {event.checkOut && <span>Check-out: {event.checkOut}</span>}
                                {event.nights && <span>Nights: {event.nights}</span>}
                                {event.adults && <span>Adults: {event.adults}</span>}
                                {event.children && <span>Children: {event.children}</span>}
                                {event.propertyType && <span>Type: {event.propertyType}</span>}
                                {event.confirmationNumber && <span>Confirmation: {event.confirmationNumber}</span>}
                              </div>
                              {event.address && <p className="text-gray-600">📍 {event.address}</p>}
                              {event.amenities && event.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {event.amenities.map((amenity, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{amenity}</Badge>
                                  ))}
                                </div>
                              )}
                              {event.hotelNotes && <p className="text-gray-500 italic">{event.hotelNotes}</p>}
                            </div>
                          )}

                          {/* ========== TRANSFER ========== */}
                          {event.category === "transfer" && (
                            <div className="space-y-2 text-sm">
                              {/* Route */}
                              {(event.fromLocation || event.toLocation) && (
                                <div className="flex items-center gap-2 font-medium text-orange-600">
                                  <span>{event.fromLocation || "Pickup"}</span>
                                  <span>→</span>
                                  <span>{event.toLocation || "Drop"}</span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                                {event.transferCategory && <span>Type: {event.transferCategory.replace(/-/g, " ")}</span>}
                                {event.vehicleType && <span>🚗 {event.vehicleType}</span>}
                                {event.carModel && <span>Model: {event.carModel}</span>}
                                {event.transferType && <span className="capitalize">{event.transferType} Transfer</span>}
                                {event.pickupTime && <span>Pickup: {event.pickupTime}</span>}
                                {event.dropTime && <span>Drop: {event.dropTime}</span>}
                                {event.airportName && <span>Airport: {event.airportName}</span>}
                                {event.noOfHours && <span>Hours: {event.noOfHours}</span>}
                                {event.noOfDays && <span>Days: {event.noOfDays}</span>}
                                {event.trainNumber && <span>Train: {event.trainNumber}</span>}
                                {event.busNumber && <span>Bus: {event.busNumber}</span>}
                                {event.transferClass && <span>Class: {event.transferClass}</span>}
                                {event.transmission && <span>Transmission: {event.transmission}</span>}
                                {event.fuelType && <span>Fuel: {event.fuelType}</span>}
                              </div>
                              {event.stopsList && event.stopsList.length > 0 && (
                                <div className="text-gray-600">
                                  <span className="font-medium">Stops: </span>
                                  {event.stopsList.join(" → ")}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ========== ACTIVITY ========== */}
                          {event.category === "activity" && (
                            <div className="space-y-2 text-sm">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600">
                                {event.duration && <span>⏱️ Duration: {event.duration}</span>}
                                {event.difficulty && <span>Difficulty: {event.difficulty}</span>}
                                {event.capacity && <span>Capacity: {event.capacity}</span>}
                                {event.time && <span>Time: {event.time}</span>}
                                {event.location && <span>📍 {event.location}</span>}
                              </div>
                              {event.highlights && event.highlights.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-medium text-gray-700">Highlights:</span>
                                  <ul className="list-disc list-inside text-gray-600 mt-1">
                                    {event.highlights.map((h, idx) => <li key={idx}>{h}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ========== MEAL ========== */}
                          {event.category === "meal" && (
                            <div className="space-y-2 text-sm">
                              <div className="flex flex-wrap gap-2">
                                {event.meals && event.meals.map((meal, idx) => (
                                  <Badge key={idx} className="capitalize bg-amber-100 text-amber-800">{meal}</Badge>
                                ))}
                              </div>
                              {event.customMealDescription && (
                                <p className="text-gray-600">{event.customMealDescription}</p>
                              )}
                              {event.time && <span className="text-gray-500">Time: {event.time}</span>}
                              {event.location && <span className="text-gray-500 ml-2">📍 {event.location}</span>}
                            </div>
                          )}

                          {/* ========== ANCILLARIES (Visa, Forex, Insurance) ========== */}
                          {event.category === "ancillaries" && (
                            <div className="space-y-2 text-sm text-gray-600">
                              {/* Visa */}
                              {event.visaType && (
                                <div className="grid grid-cols-2 gap-2">
                                  <span>🛂 Visa Type: {event.visaType}</span>
                                  {event.country && <span>Country: {event.country}</span>}
                                  {event.visaDuration && <span>Duration: {event.visaDuration}</span>}
                                  {event.entryMethod && <span>Entry: {event.entryMethod}</span>}
                                  {event.departureDate && <span>Departure: {event.departureDate}</span>}
                                  {event.returnDate && <span>Return: {event.returnDate}</span>}
                                </div>
                              )}
                              {/* Forex */}
                              {(event.forexCurrency || event.amount) && (
                                <div className="grid grid-cols-2 gap-2">
                                  <span>💱 Forex Currency: {event.forexCurrency}</span>
                                  {event.amount && <span>Amount: {event.amount}</span>}
                                  {event.baseCurrency && <span>Base: {event.baseCurrency}</span>}
                                </div>
                              )}
                              {/* Insurance */}
                              {event.insuranceType && (
                                <div className="grid grid-cols-2 gap-2">
                                  <span>🛡️ Insurance: {event.insuranceType}</span>
                                  {event.sumInsured && <span>Sum Insured: {event.sumInsured}</span>}
                                  {event.noOfTravellers && <span>Travellers: {event.noOfTravellers}</span>}
                                  {event.startDate && <span>From: {event.startDate}</span>}
                                  {event.endDate && <span>To: {event.endDate}</span>}
                                  {event.destinations && event.destinations.length > 0 && (
                                    <span>Destinations: {event.destinations.join(", ")}</span>
                                  )}
                                </div>
                              )}
                              {event.insuranceNotes && <p className="text-gray-500 italic">{event.insuranceNotes}</p>}
                            </div>
                          )}

                          {/* ========== CRUISE ========== */}
                          {event.category === "cruise" && (
                            <div className="space-y-2 text-sm text-gray-600">
                              {event.duration && <span>Duration: {event.duration}</span>}
                              {event.time && <span className="ml-2">Time: {event.time}</span>}
                              {event.location && <span className="ml-2">📍 {event.location}</span>}
                            </div>
                          )}

                          {/* ========== OTHERS ========== */}
                          {(event.category === "others" || event.category === "other") && (
                            <div className="space-y-2 text-sm text-gray-600">
                              {event.subCategory && <span>Category: {event.subCategory}</span>}
                              {event.travelGears && event.travelGears.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-medium">Travel Gears:</span>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    {event.travelGears.map((gear, idx) => (
                                      <div key={idx} className="bg-gray-100 p-2 rounded">
                                        <span className="font-medium">{gear.name}</span>
                                        {gear.price && <span className="ml-2">{gear.currency || "INR"} {gear.price}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ========== GENERIC (Note, Image, etc.) ========== */}
                          {event.category === "image" && event.imageUrl && (
                            <img src={event.imageUrl} alt={event.imageAlt || event.title} className="max-h-48 rounded-lg mt-2" />
                          )}

                          {/* Price (if applicable and individual pricing enabled) */}
                          {settings.showPricing && showIndividualPricing && event.price && event.price > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="font-semibold text-green-600">
                                {getDisplayPrice(event.price, event.currency || itinerary.currency)}
                              </span>
                              {pricingOptions?.showOriginalPrice && pricingOptions.markupValue > 0 && (
                                <span className="text-gray-400 line-through text-sm ml-2">
                                  {formatOriginalPrice(event.price, event.currency || itinerary.currency)}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Time & Location fallback for categories without specific display */}
                          {!["flight", "hotel", "transfer", "activity", "meal", "ancillaries"].includes(event.category) && (
                            <div className="flex gap-4 text-sm text-gray-500 mt-2">
                              {event.time && <span>⏰ {event.time}</span>}
                              {event.location && <span>📍 {event.location}</span>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CollectionView({
  itineraries,
  settings,
  pricingOptions,
  perItinerarySettings
}: {
  itineraries: IItinerary[]
  settings: any
  pricingOptions?: {
    markupType: "percentage" | "fixed"
    markupValue: number
    showOriginalPrice: boolean
    showIndividualPricing?: boolean
    pricingCurrency?: string
  }
  perItinerarySettings?: Array<{
    itineraryId: string
    enquireLink?: string
  }>
  globalEnquireLink?: string
}) {
  const [selectedItinerary, setSelectedItinerary] = useState<IItinerary | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Get exchange rates for currency conversion
  const { rates: exchangeRates, baseCurrency } = getExchangeRates()
  const targetCurrency = pricingOptions?.pricingCurrency || "INR"
  const showIndividualPricing = pricingOptions?.showIndividualPricing !== false // Default true

  // Convert and format price with currency conversion and optional markup
  const formatPriceWithConversion = (price: number, fromCurrency: string = "INR") => {
    const convertedPrice = convertCurrency(
      price,
      fromCurrency,
      targetCurrency,
      exchangeRates,
      baseCurrency
    )
    let finalPrice = convertedPrice
    if (pricingOptions?.markupValue) {
      if (pricingOptions.markupType === "percentage") {
        finalPrice = convertedPrice * (1 + pricingOptions.markupValue / 100)
      } else {
        const convertedMarkup = convertCurrency(
          pricingOptions.markupValue,
          baseCurrency,
          targetCurrency,
          exchangeRates,
          baseCurrency
        )
        finalPrice = convertedPrice + convertedMarkup
      }
    }
    return formatCurrencyWithSymbol(finalPrice, targetCurrency)
  }

  // Format original price (for strikethrough display)
  const formatOriginalPrice = (price: number, fromCurrency: string = "INR") => {
    const convertedPrice = convertCurrency(
      price,
      fromCurrency,
      targetCurrency,
      exchangeRates,
      baseCurrency
    )
    return formatCurrencyWithSymbol(convertedPrice, targetCurrency)
  }

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(price)
  }

  // Apply markup to price
  const applyMarkup = (price: number): number => {
    if (!pricingOptions || !pricingOptions.markupValue) return price
    if (pricingOptions.markupType === "percentage") {
      return price * (1 + pricingOptions.markupValue / 100)
    } else {
      return price + pricingOptions.markupValue
    }
  }

  // Get the display price (with currency conversion and markup)
  const getDisplayPrice = (price: number, currency: string = "INR") => {
    return formatPriceWithConversion(price, currency)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      "fixed-group-tour": "bg-blue-100 text-blue-800",
      "customized-package": "bg-green-100 text-green-800",
      "cart-combo": "bg-purple-100 text-purple-800",
      "html-editor": "bg-orange-100 text-orange-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      "fixed-group-tour": "Fixed Group Tour",
      "customized-package": "Customized Package",
      "cart-combo": "Cart/Combo",
      "html-editor": "Custom Content"
    }
    return labels[type as keyof typeof labels] || type
  }

  const handleViewItinerary = (itinerary: IItinerary) => {
    setSelectedItinerary(itinerary)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedItinerary(null)
    setShowModal(false)
  }
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Travel Collection</h2>
        <p className="text-gray-600">
          Explore {itineraries.length} carefully curated travel experiences
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            {itinerary.gallery && itinerary.gallery.length > 0 && (
              <div className="h-48 overflow-hidden">
                <img
                  src={itinerary.gallery[0].url}
                  alt={itinerary.gallery[0].altText || itinerary.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-lg">{itinerary.title}</h3>
                <Badge className={getTypeColor(itinerary.type)} variant="secondary">
                  {getTypeLabel(itinerary.type)}
                </Badge>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {itinerary.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{itinerary.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{itinerary.duration}</span>
                </div>
                {settings.showPricing && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">
                      {getDisplayPrice(itinerary.totalPrice, itinerary.currency)}
                    </span>
                    {pricingOptions?.showOriginalPrice && pricingOptions.markupValue > 0 && (
                      <span className="text-gray-400 line-through text-xs">
                        {formatOriginalPrice(itinerary.totalPrice, itinerary.currency)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {itinerary.highlights && itinerary.highlights.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Key Highlights:</h4>
                  <ul className="space-y-1">
                    {itinerary.highlights.slice(0, 3).map((highlight, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        {highlight}
                      </li>
                    ))}
                    {itinerary.highlights.length > 3 && (
                      <li className="text-xs text-gray-500">
                        +{itinerary.highlights.length - 3} more highlights
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* View Details Button */}
              <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                {/* View Details Button */}
                <Button
                  onClick={() => handleViewItinerary(itinerary)}
                  className="flex-1"
                  size="sm"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>

                {/* Enquire Button */}
                {(perItinerarySettings?.find(s => s.itineraryId === itinerary._id)?.enquireLink || globalEnquireLink) && (
                  <Button
                    onClick={() => {
                      const link = perItinerarySettings?.find(s => s.itineraryId === itinerary._id)?.enquireLink || globalEnquireLink
                      if (link) window.open(link, '_blank')
                    }}
                    className="flex-1"
                    size="sm"
                  >
                    Enquire
                  </Button>
                )}

                {/* WhatsApp Button */}
                {(settings.customBranding?.whatsapp || settings.customBranding?.contactPhone) && (
                  <Button
                    onClick={() => {
                      const phoneNumber = settings.customBranding?.whatsapp || settings.customBranding?.contactPhone
                      // Clean phone number (remove non-digits, ensure country code if needed - simple trim for now)
                      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '')
                      const message = `Hi, I would like to enquire on ${itinerary.title}`
                      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
                      window.open(whatsappUrl, '_blank')
                    }}
                    className="flex-none bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                    title="Enquire on WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Individual Itinerary Modal */}
      {showModal && selectedItinerary && (
        <Dialog open={showModal} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">{selectedItinerary.title}</DialogTitle>
                <Badge className={getTypeColor(selectedItinerary.type)}>
                  {getTypeLabel(selectedItinerary.type)}
                </Badge>
              </div>
              <p className="text-gray-600">{selectedItinerary.description}</p>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="font-medium">{selectedItinerary.destination}</p>
                  </div>
                </div>
                {/* Enquire Button inside Details Modal */}
                {perItinerarySettings?.find(s => s.itineraryId === selectedItinerary._id)?.enquireLink && (
                  <div className="col-span-2 md:col-span-4 flex justify-end">
                    <Button
                      onClick={() => window.open(perItinerarySettings?.find(s => s.itineraryId === selectedItinerary._id)?.enquireLink, '_blank')}
                      size="sm"
                    >
                      Enquire Now
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium">{selectedItinerary.duration}</p>
                  </div>
                </div>
                {settings.showPricing && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-medium">
                        {getDisplayPrice(selectedItinerary.totalPrice, selectedItinerary.currency)}
                      </p>
                      {pricingOptions?.showOriginalPrice && pricingOptions.markupValue > 0 && (
                        <p className="text-gray-400 line-through text-xs">
                          {formatOriginalPrice(selectedItinerary.totalPrice, selectedItinerary.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Days</p>
                    <p className="font-medium">{selectedItinerary.days?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              {selectedItinerary.gallery && selectedItinerary.gallery.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Gallery</h4>
                  <ImageCollage gallery={selectedItinerary.gallery} className="max-h-[300px]" />
                </div>
              )}

              {/* Highlights */}
              {selectedItinerary.highlights && selectedItinerary.highlights.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Highlights</h4>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {selectedItinerary.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Days Itinerary */}
              {selectedItinerary.days && selectedItinerary.days.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Day-by-Day Itinerary</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedItinerary.days.map((day, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Day {day.day}: {day.title}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">{day.date}</Badge>
                          </div>
                          {day.description && (
                            <p className="text-sm text-gray-600">{day.description}</p>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          {day.events && day.events.length > 0 && (
                            <div className="space-y-3">
                              {day.events.map((event, eventIndex) => {
                                // Category-specific styling (compact version)
                                const categoryColors: Record<string, string> = {
                                  flight: "border-sky-400 bg-sky-50",
                                  hotel: "border-emerald-400 bg-emerald-50",
                                  activity: "border-purple-400 bg-purple-50",
                                  transfer: "border-orange-400 bg-orange-50",
                                  meal: "border-amber-400 bg-amber-50",
                                  ancillaries: "border-indigo-400 bg-indigo-50",
                                  cruise: "border-cyan-400 bg-cyan-50",
                                  others: "border-slate-400 bg-slate-50",
                                  other: "border-slate-400 bg-slate-50",
                                  note: "border-yellow-400 bg-yellow-50",
                                }
                                const colorClass = categoryColors[event.category] || "border-gray-300 bg-gray-50"

                                return (
                                  <div key={eventIndex} className={`border-l-2 ${colorClass} pl-3 py-2 rounded-r`}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs capitalize">{event.category}</Badge>
                                      <span className="font-medium text-sm">{event.title}</span>
                                    </div>

                                    {event.description && event.description !== "No description provided" && (
                                      <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                                    )}

                                    {/* Flight Details */}
                                    {event.category === "flight" && (
                                      <div className="text-xs text-gray-600 space-y-1">
                                        {(event.fromCity || event.toCity) && (
                                          <p className="font-medium text-sky-600">{event.fromCity} → {event.toCity}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                          {event.airlines && <span>✈️ {event.airlines}</span>}
                                          {event.flightNumber && <span>#{event.flightNumber}</span>}
                                          {event.startTime && event.endTime && (
                                            <span>{event.startTime} - {event.endTime}</span>
                                          )}
                                          {event.flightClass && <span>Class: {event.flightClass}</span>}
                                        </div>
                                      </div>
                                    )}

                                    {/* Hotel Details */}
                                    {event.category === "hotel" && (
                                      <div className="text-xs text-gray-600 space-y-1">
                                        {event.hotelName && <p className="font-medium">🏨 {event.hotelName}</p>}
                                        <div className="flex flex-wrap gap-2">
                                          {event.roomCategory && <span>Room: {event.roomCategory}</span>}
                                          {event.hotelRating && <span>{"⭐".repeat(event.hotelRating)}</span>}
                                          {event.mealPlan && <span>Meals: {event.mealPlan}</span>}
                                          {event.checkIn && <span>Check-in: {event.checkIn}</span>}
                                        </div>
                                      </div>
                                    )}

                                    {/* Transfer Details */}
                                    {event.category === "transfer" && (
                                      <div className="text-xs text-gray-600 space-y-1">
                                        {(event.fromLocation || event.toLocation) && (
                                          <p className="font-medium text-orange-600">{event.fromLocation} → {event.toLocation}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                          {event.vehicleType && <span>🚗 {event.vehicleType}</span>}
                                          {event.transferCategory && <span>{event.transferCategory.replace(/-/g, " ")}</span>}
                                          {event.transferType && <span className="capitalize">{event.transferType}</span>}
                                        </div>
                                      </div>
                                    )}

                                    {/* Activity Details */}
                                    {event.category === "activity" && (
                                      <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                                        {event.duration && <span>⏱️ {event.duration}</span>}
                                        {event.difficulty && <span>Difficulty: {event.difficulty}</span>}
                                        {event.location && <span>📍 {event.location}</span>}
                                      </div>
                                    )}

                                    {/* Meal Details */}
                                    {event.category === "meal" && event.meals && (
                                      <div className="flex flex-wrap gap-1">
                                        {event.meals.map((meal, idx) => (
                                          <Badge key={idx} className="text-[10px] capitalize bg-amber-100 text-amber-800">{meal}</Badge>
                                        ))}
                                      </div>
                                    )}

                                    {/* Ancillaries (Visa/Forex/Insurance) */}
                                    {event.category === "ancillaries" && (
                                      <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                                        {event.visaType && <span>🛂 {event.visaType}</span>}
                                        {event.forexCurrency && <span>💱 {event.forexCurrency}</span>}
                                        {event.insuranceType && <span>🛡️ {event.insuranceType}</span>}
                                      </div>
                                    )}

                                    {/* Fallback for other categories */}
                                    {!["flight", "hotel", "transfer", "activity", "meal", "ancillaries"].includes(event.category) && (
                                      <div className="flex gap-4 text-xs text-gray-500">
                                        {event.time && <span>⏰ {event.time}</span>}
                                        {event.location && <span>📍 {event.location}</span>}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Type-specific content */}
              {selectedItinerary.type === "fixed-group-tour" && selectedItinerary.fixedDates && (
                <div>
                  <h4 className="font-semibold mb-3">Tour Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{new Date(selectedItinerary.fixedDates.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">{new Date(selectedItinerary.fixedDates.endDate).toLocaleDateString()}</p>
                    </div>
                    {selectedItinerary.fixedDates.maxParticipants && (
                      <div>
                        <p className="text-sm text-gray-600">Capacity</p>
                        <p className="font-medium">
                          {selectedItinerary.fixedDates.currentBookings || 0} / {selectedItinerary.fixedDates.maxParticipants} participants
                        </p>
                      </div>
                    )}
                    {selectedItinerary.fixedDates.availableDates && selectedItinerary.fixedDates.availableDates.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Available Dates</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedItinerary.fixedDates.availableDates.slice(0, 3).map((date, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {new Date(date).toLocaleDateString()}
                            </Badge>
                          ))}
                          {selectedItinerary.fixedDates.availableDates.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedItinerary.fixedDates.availableDates.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedItinerary.type === "cart-combo" && selectedItinerary.cartItems && selectedItinerary.cartItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Cart Items</h4>
                  <div className="space-y-2">
                    {selectedItinerary.cartItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.description}</p>
                          <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">${item.price}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItinerary.type === "html-editor" && selectedItinerary.htmlBlocks && selectedItinerary.htmlBlocks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Content Blocks</h4>
                  <div className="space-y-3">
                    {selectedItinerary.htmlBlocks.map((block, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{block.type}</Badge>
                          {block.level && <span className="text-xs text-gray-500">Level {block.level}</span>}
                        </div>
                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: block.content }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
