"use client"

import { Car, Hotel, Camera, Utensils, PlaneTakeoff, MapPin, Clock } from "lucide-react"

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
