"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Edit3 } from "lucide-react"
import type { IItineraryEvent } from "@/models/Itinerary"
import { EventSourceBadge } from "./source-badge"

interface ImageEventProps {
  event: IItineraryEvent
  isDetailedView: boolean
  onClick?: () => void
  onUpdate?: (updatedEvent: IItineraryEvent) => void
}

export function ImageEvent({ event, isDetailedView, onClick, onUpdate }: ImageEventProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      // Create a temporary URL for immediate display
      const imageUrl = URL.createObjectURL(file)

      // Update event with new image URL
      const updatedEvent = {
        ...event,
        imageUrl,
        imageAlt: event.imageAlt || event.title,
        imageCaption: event.imageCaption || `Image for ${event.title}`,
      }

      // Call onUpdate to save changes
      if (onUpdate) {
        onUpdate(updatedEvent)
      }

      console.log("[v0] Image uploaded successfully:", imageUrl)
    } catch (error) {
      console.error("Failed to upload image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }

      handleImageUpload(file)
    }
  }

  return (
    <Card className="border-l-4 border-l-pink-400 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Camera className="h-5 w-5 text-pink-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                {event.componentSource && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      event.componentSource === "manual"
                        ? "bg-blue-100 text-blue-700"
                        : event.componentSource === "my-library"
                          ? "bg-green-100 text-green-700"
                          : event.componentSource === "global-library"
                            ? "bg-purple-100 text-purple-700"
                            : event.componentSource === "my-library-edited"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {event.componentSource.replace("-", " ")}
                  </span>
                )}
              </div>
              {event.time && <p className="text-sm text-gray-500 mt-1">📅 {event.time}</p>}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Display */}
        <div className="mt-4">
          {event.imageUrl ? (
            <div className="relative">
              <img
                src={event.imageUrl || "/placeholder.svg"}
                alt={event.imageAlt || event.title}
                className="w-full h-28 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=192&width=400&text=Image+Not+Found"
                }}
              />
              {event.imageCaption && <p className="text-sm text-gray-600 mt-2 italic">{event.imageCaption}</p>}
              <div className="absolute top-2 right-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isUploading}
                  onClick={(e) => {
                    e.stopPropagation()
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = "image/*"
                    input.onchange = handleFileSelect
                    input.click()
                  }}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Click to add image</p>
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation()
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "image/*"
                  input.onchange = handleFileSelect
                  input.click()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          )}
        </div>

        {isDetailedView && event.description && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{event.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
