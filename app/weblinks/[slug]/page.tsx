"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Eye, Lock, Calendar, MapPin, DollarSign, Users, Clock, Loader2, Share2, Download, MessageCircle, Plane, X, Sparkles, Bed, Car, Utensils, Mountain, FileText, Ship, File } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IPublicShare } from "@/models/PublicShare"
import { IItinerary } from "@/models/Itinerary"
import { ImageCollage } from "@/components/image-collage"
import { convertCurrency, formatCurrencyWithSymbol } from "@/lib/currency-utils"
import { getExchangeRates } from "@/lib/pricing-calculator"

interface PublicShareData extends IPublicShare {
  itinerary?: IItinerary
  itineraries?: IItinerary[]
  globalEnquireLink?: string
  perItinerarySettings?: Array<{
    itineraryId: string
    enquireLink?: string
  }>
}

export default function PublicWeblinkPage() {
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

  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      fetchShareData()
    }
  }, [slug])

  const fetchShareData = async () => {
    try {
      setLoading(true)
      // Fetch by slug (URL-encoded to handle special characters)
      const response = await fetch(`/api/shares/by-slug/${encodeURIComponent(slug)}`)

      if (response.status === 404) {
        setError("Share not found or has been removed")
        return
      }

      if (response.status === 410) {
        // Get expiry data with share details for contact info
        const expiredData = await response.json()
        const share = expiredData.share as PublicShareData
        setShareData(share) // Store the share data even though it's expired
        setError(expiredData.expiryMessage || "This weblink has expired. Please contact the provider for updated information.")
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
      // Use shareId from loaded data for tracking
      await fetch(`/api/shares/${shareData?.shareId}/view`, {
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
      // Use shareId from loaded data for verification
      const response = await fetch(`/api/shares/${shareData?.shareId}/verify`, {
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
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
    // Helper to safely get branding properties
    const getBrandingProp = (prop: string) => {
      if (shareData?.settings.customBranding) {
        return (shareData.settings.customBranding as any)[prop]
      }
      if (shareData?.shareType === "individual" && shareData.itinerary?.branding) {
        const itineraryBranding = shareData.itinerary.branding
        switch (prop) {
          case 'logo':
            return itineraryBranding.headerLogo
          case 'primaryColor':
            return itineraryBranding.primaryColor
          case 'companyName':
            return itineraryBranding.headerText
          // Contact info comes from customBranding only, not itinerary branding
          default:
            return undefined
        }
      }
      return undefined
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardContent className="pt-8 pb-6">
            {/* Logo/Company Name */}
            {(getBrandingProp('logo') || getBrandingProp('companyName')) && (
              <div className="text-center mb-6 pb-4 border-b border-gray-200">
                {getBrandingProp('logo') && (
                  <img
                    src={getBrandingProp('logo')}
                    alt="Company Logo"
                    className="h-16 w-auto mx-auto mb-4"
                  />
                )}
                {getBrandingProp('companyName') && (
                  <h3 className="text-2xl font-bold text-gray-900">
                    {getBrandingProp('companyName')}
                  </h3>
                )}
              </div>
            )}

            {/* Expiry Icon and Message */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-4">
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Link Expired
              </h2>
              <p className="text-gray-600 text-lg">
                {error}
              </p>

              {/* Expiry Date if available */}
              {shareData?.expiresAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Expired on: {new Date(shareData.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Get Updated Information
              </h3>

              <div className="space-y-3 mb-6">
                {getBrandingProp('contactEmail') && (
                  <div className="flex items-center justify-center gap-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${getBrandingProp('contactEmail')}`} className="text-blue-600 hover:underline">
                        {getBrandingProp('contactEmail')}
                      </a>
                    </div>
                  </div>
                )}

                {getBrandingProp('contactPhone') && (
                  <div className="flex items-center justify-center gap-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${getBrandingProp('contactPhone')}`} className="text-green-600 hover:underline">
                        {getBrandingProp('contactPhone')}
                      </a>
                    </div>
                  </div>
                )}

                {!getBrandingProp('contactEmail') && !getBrandingProp('contactPhone') && (
                  <p className="text-center text-gray-500 text-sm">
                    Please contact the travel provider who shared this link with you.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <a href="https://ticketing.aivialabs.com/forms/enquire-now-from-weblinks" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enquire Now
                  </a>
                </Button>
                <Button onClick={() => router.push("/")} variant="outline">
                  Go Home
                </Button>
              </div>
            </div>
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
    <div className="min-h-screen bg-slate-50 selection:bg-brand-primary-100 selection:text-brand-primary-900 font-sans relative">
      {/* Hero Background Image */}
      {/* Hero Background Image */}
      {getBrandingProp('heroImage') && (
        <div className="absolute top-0 left-0 right-0 h-[600px] z-0 overflow-hidden animate-fade-in">
          <img
            src={getBrandingProp('heroImage')}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-slate-50" />
        </div>
      )}

      {/* Premium Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-blue-100 blur-3xl opacity-50 mix-blend-multiply filter animate-blob" />
        <div className="absolute top-[20%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-purple-100 blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[45rem] h-[45rem] rounded-full bg-yellow-50 blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-4000" />
      </div>

      {/* Premium Sticky Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 transition-all duration-300"
      >
        {/* Gradient Top Border */}
        <div
          className="h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-50"
          style={{ color: getBrandingProp('primaryColor') || '#eab308' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-4">
            {/* Left: Branding */}
            <div className="flex items-center gap-4">
              {getBrandingProp('logo') && (
                <img
                  src={getBrandingProp('logo')}
                  alt="Logo"
                  className="h-12 w-auto object-contain hover:scale-105 transition-transform duration-300"
                />
              )}
              {getBrandingProp('companyName') && (
                <h1
                  className="text-xl font-bold tracking-tight hidden md:block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
                >
                  {getBrandingProp('companyName')}
                </h1>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {(shareData.globalEnquireLink || getBrandingProp('contactPhone')) && (
                <Button
                  onClick={() => window.open(shareData.globalEnquireLink || `tel:${getBrandingProp('contactPhone')}`, '_blank')}
                  className="hidden md:flex bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 rounded-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enquire
                </Button>
              )}
              <Button
                className="hidden md:flex bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 rounded-full"
                onClick={() => alert('Book Now feature coming soon!')}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Book Now
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="icon"
                className="rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <Share2 className="h-4 w-4 text-gray-600" />
              </Button>

              {/* Mobile Menu Button - could be added here if needed */}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div
          className={`inline-flex items-center justify-center p-1 rounded-full mb-6 backdrop-blur-sm shadow-sm animate-fade-in ${getBrandingProp('heroImage')
            ? 'bg-white/10 border border-white/20'
            : 'bg-white/50 border border-white/50'
            }`}
        >
          <span className={`px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getBrandingProp('heroImage')
            ? 'bg-white/20 text-white border-transparent'
            : 'bg-white text-gray-900 border-gray-100 border'
            }`}>
            Exclusive Collection
          </span>
        </div>

        <h1
          className={`text-4xl md:text-6xl font-black mb-6 tracking-tight drop-shadow-sm animate-slide-in ${getBrandingProp('heroImage') ? 'text-white' : 'text-gray-900'
            }`}
          style={!getBrandingProp('heroImage') ? {
            backgroundImage: getBrandingProp('primaryColor')
              ? `linear-gradient(135deg, #111827 0%, ${getBrandingProp('primaryColor')} 100%)`
              : undefined,
            backgroundClip: getBrandingProp('primaryColor') ? 'text' : undefined,
            WebkitBackgroundClip: getBrandingProp('primaryColor') ? 'text' : undefined,
            color: getBrandingProp('primaryColor') ? 'transparent' : '#111827'
          } : { textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        >
          {shareData.title}
        </h1>

        {shareData.description && (
          <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in delay-100 ${getBrandingProp('heroImage') ? 'text-gray-100 drop-shadow-md' : 'text-gray-600'
            }`}>
            {shareData.description}
          </p>
        )}

        {/* Mobile Action Bar (Visible only on small screens) */}
        <div className="mt-8 flex md:hidden justify-center gap-3 animate-fade-in delay-200">
          <Button
            asChild
            className="flex-1 max-w-[140px] bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full"
          >
            <a href="https://ticketing.aivialabs.com/forms/enquire-now-from-weblinks" target="_blank" rel="noopener noreferrer">
              Enquire
            </a>
          </Button>
          <Button
            className="flex-1 max-w-[140px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full"
            onClick={() => alert('Book Now feature coming soon!')}
          >
            Book Now
          </Button>
        </div>
      </div>

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

      {/* Footer - Premium Design with Social Media */}
      {shareData.settings.showContactInfo && (getBrandingProp('companyName') || getBrandingProp('contactEmail') || getBrandingProp('contactPhone')) && (
        <footer className="relative mt-16 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Company Info */}
              <div>
                {getBrandingProp('companyName') && (
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {getBrandingProp('companyName')}
                  </h3>
                )}
                <div className="space-y-3">
                  {getBrandingProp('contactEmail') && (
                    <a
                      href={`mailto:${getBrandingProp('contactEmail')}`}
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                    >
                      <div className="p-2 bg-white/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">{getBrandingProp('contactEmail')}</span>
                    </a>
                  )}
                  {getBrandingProp('contactPhone') && (
                    <a
                      href={`tel:${getBrandingProp('contactPhone')}`}
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                    >
                      <div className="p-2 bg-white/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="font-medium">{getBrandingProp('contactPhone')}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="flex flex-col items-start md:items-end justify-center">
                <h4 className="text-lg font-semibold mb-4 text-gray-300">Connect With Us</h4>
                <div className="flex flex-wrap gap-3">
                  {getBrandingProp('instagram') && (
                    <a
                      href={getBrandingProp('instagram')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-pink-500/50"
                      title="Instagram"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {getBrandingProp('whatsapp') && (
                    <a
                      href={`https://wa.me/${getBrandingProp('whatsapp').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-green-500/50"
                      title="WhatsApp"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </a>
                  )}
                  {getBrandingProp('facebook') && (
                    <a
                      href={getBrandingProp('facebook')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-blue-500/50"
                      title="Facebook"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {getBrandingProp('twitter') && (
                    <a
                      href={getBrandingProp('twitter')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 bg-gradient-to-br from-gray-800 to-black rounded-xl hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-gray-500/50"
                      title="X (Twitter)"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                  {getBrandingProp('youtube') && (
                    <a
                      href={getBrandingProp('youtube')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 bg-gradient-to-br from-red-500 to-red-700 rounded-xl hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-red-500/50"
                      title="YouTube"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  )}
                  {getBrandingProp('website') && (
                    <a
                      href={getBrandingProp('website')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-indigo-500/50"
                      title="Website"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-700/50 text-center text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} {getBrandingProp('companyName') || 'All Rights Reserved'}. Powered by Excellence in Travel.</p>
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
    strikethroughMarkupType?: "percentage" | "fixed"
    strikethroughMarkupValue?: number
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

  // Format strikethrough price (selling price + strikethrough markup to create higher "was" price)
  const formatStrikethroughPrice = (price: number, fromCurrency: string = "INR") => {
    // First calculate the selling price (original + markup)
    const convertedPrice = convertCurrency(
      price,
      fromCurrency,
      targetCurrency,
      exchangeRates,
      baseCurrency
    )

    // Apply regular markup to get selling price
    let sellingPrice = convertedPrice
    if (pricingOptions?.markupValue) {
      if (pricingOptions.markupType === "percentage") {
        sellingPrice = convertedPrice * (1 + pricingOptions.markupValue / 100)
      } else {
        const convertedMarkup = convertCurrency(
          pricingOptions.markupValue,
          baseCurrency,
          targetCurrency,
          exchangeRates,
          baseCurrency
        )
        sellingPrice = convertedPrice + convertedMarkup
      }
    }

    // Now apply strikethrough markup on top of selling price
    let strikethroughPrice = sellingPrice
    if (pricingOptions?.strikethroughMarkupValue) {
      if (pricingOptions.strikethroughMarkupType === "percentage") {
        strikethroughPrice = sellingPrice * (1 + pricingOptions.strikethroughMarkupValue / 100)
      } else {
        const convertedStrikethroughMarkup = convertCurrency(
          pricingOptions.strikethroughMarkupValue,
          baseCurrency,
          targetCurrency,
          exchangeRates,
          baseCurrency
        )
        strikethroughPrice = sellingPrice + convertedStrikethroughMarkup
      }
    }

    return formatCurrencyWithSymbol(strikethroughPrice, targetCurrency)
  }

  // Legacy formatPrice for non-converted display
  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
                    {pricingOptions?.showOriginalPrice && (pricingOptions.strikethroughMarkupValue ?? 0) > 0 && (
                      <span className="text-gray-400 line-through text-sm">
                        {formatStrikethroughPrice(itinerary.totalPrice, itinerary.currency)}
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
                              {pricingOptions?.showOriginalPrice && (pricingOptions.markupValue ?? 0) > 0 && (
                                <span className="text-gray-400 line-through text-sm ml-2">
                                  {formatStrikethroughPrice(event.price, event.currency || itinerary.currency)}
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
  perItinerarySettings,
  globalEnquireLink
}: {
  itineraries: IItinerary[]
  settings: any
  pricingOptions?: {
    markupType: "percentage" | "fixed"
    markupValue: number
    showOriginalPrice: boolean
    strikethroughMarkupType?: "percentage" | "fixed"
    strikethroughMarkupValue?: number
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

  // Format strikethrough price (selling price + strikethrough markup to create higher "was" price)
  const formatStrikethroughPrice = (price: number, fromCurrency: string = "INR") => {
    // First calculate the selling price (original + markup)
    const convertedPrice = convertCurrency(
      price,
      fromCurrency,
      targetCurrency,
      exchangeRates,
      baseCurrency
    )

    // Apply regular markup to get selling price
    let sellingPrice = convertedPrice
    if (pricingOptions?.markupValue) {
      if (pricingOptions.markupType === "percentage") {
        sellingPrice = convertedPrice * (1 + pricingOptions.markupValue / 100)
      } else {
        const convertedMarkup = convertCurrency(
          pricingOptions.markupValue,
          baseCurrency,
          targetCurrency,
          exchangeRates,
          baseCurrency
        )
        sellingPrice = convertedPrice + convertedMarkup
      }
    }

    // Now apply strikethrough markup on top of selling price
    let strikethroughPrice = sellingPrice
    if (pricingOptions?.strikethroughMarkupValue) {
      if (pricingOptions.strikethroughMarkupType === "percentage") {
        strikethroughPrice = sellingPrice * (1 + pricingOptions.strikethroughMarkupValue / 100)
      } else {
        const convertedStrikethroughMarkup = convertCurrency(
          pricingOptions.strikethroughMarkupValue,
          baseCurrency,
          targetCurrency,
          exchangeRates,
          baseCurrency
        )
        strikethroughPrice = sellingPrice + convertedStrikethroughMarkup
      }
    }

    return formatCurrencyWithSymbol(strikethroughPrice, targetCurrency)
  }

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
    <div className="space-y-12">
      <div className="text-center relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-6 py-2 bg-slate-50 text-sm font-medium text-gray-500 uppercase tracking-widest rounded-full border border-gray-100">
            Available Packages ({itineraries.length})
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {itineraries.map((itinerary, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
            onClick={() => handleViewItinerary(itinerary)}
          >
            {/* Image Section */}
            <div className="aspect-[4/3] overflow-hidden relative">
              {itinerary.gallery && itinerary.gallery.length > 0 ? (
                <img
                  src={itinerary.gallery[0].url}
                  alt={itinerary.gallery[0].altText || itinerary.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-gray-300" />
                </div>
              )}
              {/* Type Badge Overlay */}
              <div className="absolute top-4 right-4">
                <Badge className={`${getTypeColor(itinerary.type)} backdrop-blur-md bg-opacity-90 shadow-sm border-0`}>
                  {getTypeLabel(itinerary.type)}
                </Badge>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
              <div className="mb-4">
                <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {itinerary.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                  {itinerary.description}
                </p>
              </div>

              {/* Meta Details */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="p-1.5 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate max-w-[100px]">{itinerary.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="p-1.5 bg-amber-50 rounded-full text-amber-600 group-hover:bg-amber-100 transition-colors">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <span>{itinerary.duration}</span>
                </div>
              </div>

              {/* Cart/Combo Inclusions Preview */}
              {itinerary.type === 'cart-combo' && itinerary.cartItems && itinerary.cartItems.length > 0 && (
                <div className="mb-6 flex-1">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Includes</div>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.cartItems.slice(0, 3).map((item, idx) => {
                      const categoryColors = {
                        flight: "bg-sky-50 text-sky-700 border-sky-100",
                        hotel: "bg-emerald-50 text-emerald-700 border-emerald-100",
                        activity: "bg-purple-50 text-purple-700 border-purple-100",
                        transfer: "bg-orange-50 text-orange-700 border-orange-100",
                        meal: "bg-amber-50 text-amber-700 border-amber-100",
                        other: "bg-slate-50 text-slate-700 border-slate-100",
                      } as const;
                      const colorClass = categoryColors[item.category as keyof typeof categoryColors] || "bg-gray-50 text-gray-700 border-gray-100";

                      return (
                        <span key={idx} className={`text-[10px] px-2 py-1 rounded-md font-medium border ${colorClass} capitalize`}>
                          {item.category}
                        </span>
                      );
                    })}
                    {itinerary.cartItems.length > 3 && (
                      <span className="text-[10px] px-2 py-1 rounded-md font-medium bg-gray-50 text-gray-500 border border-gray-100">
                        +{itinerary.cartItems.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Customized Package Inclusions Preview */}
              {itinerary.type === 'customized-package' && itinerary.days && itinerary.days.length > 0 && (
                <div className="mb-6 flex-1">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Includes</div>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const cats = new Set<string>()
                      itinerary.days.forEach(d => d.events?.forEach(e => e.category && cats.add(e.category)))
                      const uniqueCats = Array.from(cats)

                      if (uniqueCats.length === 0) return <span className="text-xs text-gray-400 opacity-70">View details for inclusions</span>

                      return uniqueCats.slice(0, 5).map((cat, idx) => {
                        const categoryColors: Record<string, string> = {
                          flight: "bg-sky-50 text-sky-700 border-sky-100",
                          hotel: "bg-emerald-50 text-emerald-700 border-emerald-100",
                          activity: "bg-purple-50 text-purple-700 border-purple-100",
                          transfer: "bg-orange-50 text-orange-700 border-orange-100",
                          meal: "bg-amber-50 text-amber-700 border-amber-100",
                          other: "bg-slate-50 text-slate-700 border-slate-100",
                          ancillaries: "bg-indigo-50 text-indigo-700 border-indigo-100",
                        }
                        const colorClass = categoryColors[cat.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-100"

                        return (
                          <span key={idx} className={`text-[10px] px-2 py-1 rounded-md font-medium border ${colorClass} capitalize`}>
                            {cat}
                          </span>
                        )
                      })
                    })()}
                    {(() => {
                      const totalCats = new Set<string>()
                      itinerary.days.forEach(d => d.events?.forEach(e => e.category && totalCats.add(e.category)))
                      return totalCats.size > 5 ? (
                        <span className="text-[10px] px-2 py-1 rounded-md font-medium bg-gray-50 text-gray-500 border border-gray-100">
                          +{totalCats.size - 5} more
                        </span>
                      ) : null
                    })()}
                  </div>
                </div>
              )}

              {/* Footer: Price & Action */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                {settings.showPricing && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 font-medium uppercase">Total Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900 text-heading-md">
                        {getDisplayPrice(itinerary.totalPrice, itinerary.currency)}
                      </span>
                      {pricingOptions?.showOriginalPrice && (pricingOptions.strikethroughMarkupValue ?? 0) > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatStrikethroughPrice(itinerary.totalPrice, itinerary.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs sm:text-sm border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewItinerary(itinerary);
                    }}
                  >
                    View Details
                  </Button>

                  {(perItinerarySettings?.find(s => s.itineraryId === itinerary._id)?.enquireLink || globalEnquireLink) && (
                    <Button
                      size="sm"
                      className="w-full text-xs sm:text-sm bg-orange-500 hover:bg-orange-600 text-white border-none shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = perItinerarySettings?.find(s => s.itineraryId === itinerary._id)?.enquireLink || globalEnquireLink
                        if (link) window.open(link, '_blank')
                      }}
                    >
                      Enquire
                    </Button>
                  )}

                  {(settings.customBranding?.whatsapp || settings.customBranding?.contactPhone) && (
                    <Button
                      size="sm"
                      className="w-full text-xs sm:text-sm bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const phoneNumber = settings.customBranding?.whatsapp || settings.customBranding?.contactPhone
                        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '')
                        const message = `Hi, I would like to enquire on ${itinerary.title}`
                        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
                        window.open(whatsappUrl, '_blank')
                      }}
                      title="Share on WhatsApp"
                    >
                      <span className="hidden sm:inline">WhatsApp</span>
                      <MessageCircle className="h-4 w-4 sm:hidden" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Itinerary Modal - Enhanced UI */}
      {showModal && selectedItinerary && (
        <Dialog open={showModal} onOpenChange={closeModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden flex flex-col">

            {/* Modal Header Banner (Sticky) */}
            <div className="relative h-48 md:h-64 flex-shrink-0">
              {selectedItinerary.gallery && selectedItinerary.gallery.length > 0 ? (
                <img
                  src={selectedItinerary.gallery[0].url}
                  alt={selectedItinerary.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                  <Plane className="h-16 w-16 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <Badge className={`mb-2 ${getTypeColor(selectedItinerary.type)} bg-opacity-90 backdrop-blur-sm border-none`}>
                  {getTypeLabel(selectedItinerary.type)}
                </Badge>
                <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight shadow-md">
                  {selectedItinerary.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed itinerary view for {selectedItinerary.title}
                </DialogDescription>
              </div>

              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white backdrop-blur-sm transition-colors z-20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-8 bg-gray-50/50 flex-1">

              {/* Description & Stats */}
              {selectedItinerary.type === 'cart-combo' ? (
                <div className="space-y-8">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {selectedItinerary.description}
                  </p>

                  {/* Old Stats Grid for Cart/Combo */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">No. of Items</p>
                        <p className="font-semibold text-gray-900">{selectedItinerary.cartItems?.length || 0}</p>
                      </div>
                    </div>

                    {settings.showPricing && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full">
                          <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase">Total Price</p>
                          <p className="font-semibold text-gray-900">
                            {getDisplayPrice(selectedItinerary.totalPrice, selectedItinerary.currency)}
                          </p>
                          {pricingOptions?.showOriginalPrice && (pricingOptions.strikethroughMarkupValue ?? 0) > 0 && (
                            <p className="text-gray-400 line-through text-xs">
                              {formatStrikethroughPrice(selectedItinerary.totalPrice, selectedItinerary.currency)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Duration</p>
                        <p className="font-semibold text-gray-900">
                          {new Set(selectedItinerary.cartItems?.map((i: any) => i.date).filter(Boolean)).size} Days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Old Day-by-Day Card List for Cart/Combo */}
                  {selectedItinerary.days && selectedItinerary.days.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        Detailed Itinerary
                      </h3>
                      <div className="space-y-4">
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
                                  {day.events.map((event, eventIndex) => (
                                    <div key={eventIndex} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="text-[10px] capitalize">{event.category}</Badge>
                                        <span className="font-medium text-sm">{event.title}</span>
                                      </div>
                                      {event.description && event.description !== "No description provided" && (
                                        <p className="text-xs text-gray-600">{event.description}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* New Customized Package Layout */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {selectedItinerary.description}
                      </p>
                      {/* Highlights */}
                      {selectedItinerary.highlights && selectedItinerary.highlights.length > 0 && (
                        <div className="pt-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            Trip Highlights
                          </h4>
                          <ul className="grid sm:grid-cols-2 gap-3">
                            {selectedItinerary.highlights.map((highlight, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                <div className="mt-1 w-1.5 h-1.5 bg-brand-primary-500 rounded-full flex-shrink-0" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Sidebar Stats */}
                    <div className="md:col-span-1">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4 sticky top-0">
                        <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Trip Summary</h4>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><MapPin className="h-5 w-5" /></div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Destination</p>
                            <p className="font-semibold text-gray-900">{selectedItinerary.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Clock className="h-5 w-5" /></div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Duration</p>
                            <p className="font-semibold text-gray-900">{selectedItinerary.duration}</p>
                          </div>
                        </div>

                        {settings.showPricing && (
                          <div className="flex items-center gap-3 pt-2 border-t border-dashed border-gray-200">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><DollarSign className="h-5 w-5" /></div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase">Total Price</p>
                              <p className="font-bold text-lg text-gray-900">
                                {getDisplayPrice(selectedItinerary.totalPrice, selectedItinerary.currency)}
                              </p>
                              {pricingOptions?.showOriginalPrice && (pricingOptions.strikethroughMarkupValue ?? 0) > 0 && (
                                <p className="text-gray-400 line-through text-xs">
                                  {formatStrikethroughPrice(selectedItinerary.totalPrice, selectedItinerary.currency)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* New Timeline View */}
                  {selectedItinerary.days && selectedItinerary.days.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        Detailed Itinerary
                      </h3>

                      <div className="relative pl-4 md:pl-8 space-y-8 border-l-2 border-gray-200 ml-3">
                        {selectedItinerary.days.map((day, index) => (
                          <div key={index} className="relative">
                            {/* Timeline Node */}
                            <div className="absolute -left-[25px] md:-left-[41px] top-0 bg-white border-4 border-gray-50 text-gray-400 rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm shadow-sm z-10">
                              {day.day}
                            </div>

                            <div className="mb-2">
                              <h4 className="text-lg font-bold text-gray-900">{day.title}</h4>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
                                {day.date}
                              </span>
                            </div>

                            {day.description && (
                              <p className="text-gray-600 mb-4 text-sm leading-relaxed max-w-3xl">
                                {day.description}
                              </p>
                            )}

                            {/* Events Grid */}
                            {day.events && day.events.length > 0 && (
                              <div className="grid gap-3">
                                {day.events.map((event, eventIndex) => {
                                  const categoryColors: Record<string, string> = {
                                    flight: "border-sky-200 bg-sky-50 text-sky-900 group-hover:border-sky-300",
                                    hotel: "border-emerald-200 bg-emerald-50 text-emerald-900 group-hover:border-emerald-300",
                                    activity: "border-purple-200 bg-purple-50 text-purple-900 group-hover:border-purple-300",
                                    transfer: "border-orange-200 bg-orange-50 text-orange-900 group-hover:border-orange-300",
                                    meal: "border-amber-200 bg-amber-50 text-amber-900 group-hover:border-amber-300",
                                    ancillaries: "border-indigo-200 bg-indigo-50 text-indigo-900 group-hover:border-indigo-300",
                                    cruise: "border-cyan-200 bg-cyan-50 text-cyan-900 group-hover:border-cyan-300",
                                    note: "border-yellow-200 bg-yellow-50 text-yellow-900 group-hover:border-yellow-300",
                                    other: "border-gray-200 bg-gray-50 text-gray-900 group-hover:border-gray-300",
                                  }

                                  const categoryIcons: Record<string, any> = {
                                    flight: Plane,
                                    hotel: Bed,
                                    activity: Mountain,
                                    transfer: Car,
                                    meal: Utensils,
                                    ancillaries: FileText,
                                    cruise: Ship,
                                    note: File,
                                    other: MapPin
                                  }

                                  const baseClass = categoryColors[event.category] || categoryColors.other
                                  const IconComponent = categoryIcons[event.category] || categoryIcons.other

                                  return (
                                    <div key={eventIndex} className={`group border rounded-xl p-4 transition-all hover:shadow-md ${baseClass}`}>
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1 w-full">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-white/60 rounded-full shadow-sm">
                                              <IconComponent className="h-4 w-4" />
                                            </div>
                                            <h5 className="font-semibold text-sm leading-tight ml-1">{event.title}</h5>
                                          </div>

                                          {event.description && event.description !== "No description provided" && (
                                            <div className="text-sm opacity-90 leading-relaxed font-light pl-1 border-l-2 border-current/20">
                                              {event.description}
                                            </div>
                                          )}

                                          {/* Metadata Chips - Using flex wrap for cleaner layout */}
                                          <div className="flex flex-wrap gap-2 pt-2 mt-1">
                                            {/* Flight Specifics */}
                                            {event.category === "flight" && (
                                              <>
                                                {(event.fromCity || event.toCity) && <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded border border-current/10 font-medium">{event.fromCity} ➝ {event.toCity}</span>}
                                                {event.airlines && <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded border border-current/10">✈️ {event.airlines}</span>}
                                                {event.startTime && <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded border border-current/10">🕒 {event.startTime}</span>}
                                              </>
                                            )}
                                            {/* Hotel Specifics */}
                                            {event.category === "hotel" && (
                                              <>
                                                {event.hotelName && <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded border border-current/10 font-medium">🏨 {event.hotelName}</span>}
                                                {event.roomCategory && <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded border border-current/10">🛏️ {event.roomCategory}</span>}
                                                {event.mealPlan && <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded border border-current/10">🍽️ {event.mealPlan}</span>}
                                              </>
                                            )}
                                            {/* Transfer Specifics */}
                                            {event.category === "transfer" && (
                                              <>
                                                {(event.fromLocation || event.toLocation) && <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded border border-current/10 font-medium">{event.fromLocation} ➝ {event.toLocation}</span>}
                                                {event.vehicleType && <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded border border-current/10">🚗 {event.vehicleType}</span>}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Gallery Grid at Bottom */}
              {selectedItinerary.gallery && selectedItinerary.gallery.length > 0 && (
                <div className="pt-8 border-t border-gray-100">
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Gallery</h3>
                  <ImageCollage gallery={selectedItinerary.gallery} className="rounded-xl overflow-hidden shadow-sm" />
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

              {selectedItinerary.type === 'cart-combo' && selectedItinerary.cartItems && selectedItinerary.cartItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Package Inclusions</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedItinerary.cartItems.map((item: any, index: number) => {
                      // Parse date for the "Date Box"
                      const dateObj = item.date ? new Date(item.date) : null
                      const day = dateObj ? dateObj.getDate() : ""
                      const month = dateObj ? dateObj.toLocaleString('default', { month: 'short' }).toUpperCase() : ""
                      const year = dateObj ? dateObj.getFullYear() : ""

                      // Category colors for the Date Box background
                      const categoryColors: Record<string, string> = {
                        flight: "bg-sky-500",
                        hotel: "bg-emerald-500",
                        activity: "bg-purple-500",
                        transfer: "bg-orange-500",
                        meal: "bg-amber-500",
                        ancillaries: "bg-indigo-500",
                        cruise: "bg-cyan-500",
                        others: "bg-slate-500",
                        other: "bg-slate-500",
                        note: "bg-yellow-500",
                      }
                      const boxColor = categoryColors[item.category] || "bg-blue-600"
                      const borderColor = boxColor.replace("bg-", "border-").replace("500", "200")

                      return (
                        <div key={index} className={`flex flex-col sm:flex-row gap-4 p-4 border ${borderColor} rounded-xl bg-white shadow-sm hover:shadow-md transition-all`}>
                          {/* Left: Date Box (Builder Style) */}
                          <div className={`flex-shrink-0 w-full sm:w-24 h-24 ${boxColor} rounded-lg flex flex-col items-center justify-center text-white shadow-sm`}>
                            <span className="text-3xl font-bold leading-none">{day}</span>
                            <span className="text-xs font-semibold tracking-wider mt-1">{month}</span>
                            <span className="text-[10px] opacity-80">{year}</span>
                          </div>

                          {/* Middle: Content */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-bold text-lg text-gray-800 truncate mb-1">{item.name}</h5>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5 capitalize bg-gray-100 text-gray-600 border-gray-200">
                                    {item.category}
                                  </Badge>
                                  {item.quantity && item.quantity > 1 && (
                                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                  )}
                                </div>
                              </div>
                              {/* Price on Desktop (Top Right) */}
                              {pricingOptions?.showIndividualPricing && item.price > 0 && (
                                <div className="hidden sm:block text-right">
                                  <p className="font-bold text-lg text-gray-900">
                                    {getDisplayPrice(item.price, item.currency || selectedItinerary.currency)}
                                  </p>
                                </div>
                              )}
                            </div>

                            {item.description && item.description !== "No description provided" && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                            )}

                            {/* Minute Details Block - Granular Info */}
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                              {/* Flight Details */}
                              {item.category === "flight" && (
                                <>
                                  {(item.fromCity || item.toCity) && (
                                    <div className="col-span-full font-medium text-sky-700 mb-1">
                                      🛫 {item.fromCity} ➝ {item.toCity}
                                    </div>
                                  )}
                                  <div className="space-y-0.5">
                                    {(item.airline || item.airlines) && <div>Airline: <span className="font-medium text-gray-800">{item.airline || item.airlines}</span></div>}
                                    {item.flightNumber && <div>Flight #: <span className="font-medium text-gray-800">{item.flightNumber}</span></div>}
                                    {item.flightClass && <div>Class: <span className="font-medium text-gray-800">{item.flightClass}</span></div>}
                                    {(item.startTime || item.endTime) && (
                                      <div className="col-span-full mt-1 pt-1 border-t border-gray-200">
                                        Time: <span className="font-medium text-gray-800">{item.startTime} - {item.endTime}</span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}

                              {/* Hotel Details */}
                              {item.category === "hotel" && (
                                <>
                                  {item.hotelName && <div className="col-span-full font-medium text-emerald-700 mb-1">🏨 {item.hotelName}</div>}
                                  <div className="space-y-0.5">
                                    {item.roomCategory && <div>Room: <span className="font-medium text-gray-800">{item.roomCategory}</span></div>}
                                    {item.mealPlan && <div>Meals: <span className="font-medium text-gray-800">{item.mealPlan}</span></div>}
                                    {item.checkIn && <div>Check-in: <span className="font-medium text-gray-800">{item.checkIn}</span></div>}
                                    {item.nights && <div>Duration: <span className="font-medium text-gray-800">{item.nights} Nights</span></div>}
                                  </div>
                                </>
                              )}

                              {/* Transfer Details */}
                              {item.category === "transfer" && (
                                <>
                                  {(item.fromLocation || item.toLocation) && (
                                    <div className="col-span-full font-medium text-orange-700 mb-1">🚗 {item.fromLocation} ➝ {item.toLocation}</div>
                                  )}
                                  <div className="space-y-0.5">
                                    {item.vehicleType && <div>Vehicle: <span className="font-medium text-gray-800">{item.vehicleType}</span></div>}
                                    {item.transferType && <div>Type: <span className="font-medium text-gray-800 capitalize">{item.transferType}</span></div>}
                                  </div>
                                </>
                              )}

                              {/* Default/Generic Fields for other cats */}
                              {item.duration && <div>Duration: <span className="font-medium text-gray-800">{item.duration}</span></div>}
                              {item.difficulty && <div>Difficulty: <span className="font-medium text-gray-800">{item.difficulty}</span></div>}
                              {item.meals && item.meals.length > 0 && (
                                <div className="col-span-full">Meals: <span className="font-medium text-gray-800">{item.meals.join(", ")}</span></div>
                              )}
                            </div>
                          </div>

                          {/* Price on Mobile (Bottom) */}
                          {pricingOptions?.showIndividualPricing && item.price > 0 && (
                            <div className="block sm:hidden flex justify-end pt-2 border-t mt-2">
                              <p className="font-bold text-lg text-gray-900">
                                {getDisplayPrice(item.price, item.currency || selectedItinerary.currency)}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Removed duplicate Cart Items section to use the detailed Package Inclusions section above */}

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
