"use client"

import { Car, Hotel, Camera, Utensils, PlaneTakeoff, MapPin, Clock, Globe, Phone, Mail } from "lucide-react"
import { useState, useEffect } from "react"

interface PrebuiltRendererProps {
  element: any
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: any) => void
  onDelete: () => void
  onDuplicate: () => void
}

export function PrebuiltRenderer({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate
}: PrebuiltRendererProps) {
  const [branding, setBranding] = useState<any>(null)

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          setBranding(data.branding)
        }
      } catch (error) {
        console.error("Failed to fetch branding for renderer", error)
      }
    }
    fetchBranding()
  }, [])
  
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'car': return <Car className="h-5 w-5" />
      case 'hotel': return <Hotel className="h-5 w-5" />
      case 'activity': return <Camera className="h-5 w-5" />
      case 'flight': return <PlaneTakeoff className="h-5 w-5" />
      case 'dining': return <Utensils className="h-5 w-5" />
      default: return <MapPin className="h-5 w-5" />
    }
  }

  const renderElement = () => {
    switch (element.type) {
      case 'brand-header':
        return (
          <div className="w-full h-full bg-white border-b border-gray-100 rounded-t-lg overflow-hidden">
            {branding?.headerImage && (
              <div className="w-full">
                <img src={branding.headerImage} alt="Header Banner" className="w-full h-auto object-cover max-h-[80px]" />
              </div>
            )}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {branding?.logo ? (
                  <img src={branding.logo} alt="Logo" className="h-12 w-auto object-contain" />
                ) : (
                  <div className="h-12 w-12 bg-slate-100 rounded flex items-center justify-center">
                    <Globe className="h-6 w-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-lg text-slate-900 leading-tight">
                    {branding?.companyName || "Your Company Name"}
                  </h2>
                  <p className="text-xs text-slate-500 italic">
                    {branding?.address || "Company Address"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-[10px] text-slate-400 font-medium">
                {branding?.contactPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{branding.contactPhone}</span>
                  </div>
                )}
                {branding?.contactEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{branding.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'day-header':
        return (
          <div className="bg-yellow-400 text-white rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold">{element.content.day}</span>
              <h3 className="font-bold text-lg">{element.content.title}</h3>
            </div>
            <div className="text-2xl font-bold">{element.content.date}</div>
          </div>
        )

      case 'transfer-block':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded">
                {getIcon(element.content.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{element.content.title}</h4>
                <p className="text-sm font-medium text-gray-700">{element.content.subtitle}</p>
                <p className="text-sm text-blue-600">{element.content.details}</p>
                <p className="text-xs text-gray-500 mt-1">{element.content.description}</p>
              </div>
            </div>
          </div>
        )

      case 'hotel-block':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-gray-100 rounded">
                {getIcon(element.content.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{element.content.title}</h4>
                <p className="text-sm font-medium text-gray-700">{element.content.subtitle}</p>
                <p className="text-sm text-blue-600">{element.content.details}</p>
                <p className="text-xs text-gray-500 mt-1">{element.content.description}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-3 text-sm">
              <div>
                <span className="text-gray-600">Check In</span>
                <div className="font-medium">{element.content.checkIn}</div>
              </div>
              <div>
                <span className="text-gray-600">Check Out</span>
                <div className="font-medium">{element.content.checkOut}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-yellow-100 p-2 rounded text-center">
                <Utensils className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                <div className="text-xs font-medium">Breakfast</div>
                <div className="text-xs text-gray-600">{element.content.meals.breakfast}</div>
              </div>
              <div className="bg-yellow-100 p-2 rounded text-center">
                <Utensils className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                <div className="text-xs font-medium">Lunch</div>
                <div className="text-xs text-gray-600">{element.content.meals.lunch}</div>
              </div>
              <div className="bg-yellow-100 p-2 rounded text-center">
                <Utensils className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                <div className="text-xs font-medium">Dinner</div>
                <div className="text-xs text-gray-600">{element.content.meals.dinner}</div>
              </div>
            </div>
          </div>
        )

      case 'activity-block':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded">
                {getIcon(element.content.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{element.content.title}</h4>
                <p className="text-sm font-medium text-gray-700">{element.content.subtitle}</p>
                <p className="text-sm text-blue-600">{element.content.details}</p>
                <p className="text-xs text-gray-500 mt-1">{element.content.description}</p>
              </div>
            </div>
          </div>
        )

      case 'flight-block':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded">
                {getIcon(element.content.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{element.content.title}</h4>
                <p className="text-sm font-medium text-gray-700">{element.content.subtitle}</p>
                <p className="text-sm text-blue-600">{element.content.details}</p>
                <p className="text-xs text-gray-500 mt-1">{element.content.description}</p>
                <div className="flex space-x-4 mt-2 text-xs">
                  <span><Clock className="h-3 w-3 inline mr-1" />Departure: {element.content.departure}</span>
                  <span><Clock className="h-3 w-3 inline mr-1" />Arrival: {element.content.arrival}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'dining-block':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded">
                {getIcon(element.content.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{element.content.title}</h4>
                <p className="text-sm font-medium text-gray-700">{element.content.subtitle}</p>
                <p className="text-sm text-blue-600">{element.content.details}</p>
                <p className="text-xs text-gray-500 mt-1">{element.content.description}</p>
                <div className="flex space-x-4 mt-2 text-xs">
                  <span><Clock className="h-3 w-3 inline mr-1" />{element.content.time}</span>
                  <span>Duration: {element.content.duration}</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Unknown component</div>
    }
  }

  return (
    <div
      className={`absolute cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: 'auto',
        minHeight: element.size.height
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {renderElement()}
    </div>
  )
}
