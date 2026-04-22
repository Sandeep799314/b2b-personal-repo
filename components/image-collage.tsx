"use client"

import { useState } from "react"
import { IGalleryItem } from "@/models/Itinerary"
import { ChevronLeft, ChevronRight, X, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageCollageProps {
  gallery: IGalleryItem[]
  className?: string
}

export function ImageCollage({ gallery, className = "" }: ImageCollageProps) {
  const [selectedImage, setSelectedImage] = useState<IGalleryItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!gallery || gallery.length === 0) {
    return null
  }

  const openLightbox = (item: IGalleryItem, index: number) => {
    setSelectedImage(item)
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + gallery.length) % gallery.length
      : (currentIndex + 1) % gallery.length
    
    setCurrentIndex(newIndex)
    setSelectedImage(gallery[newIndex])
  }

  const renderCollage = () => {
    if (gallery.length === 1) {
      return (
        <div className="relative w-full">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            {gallery[0].type === 'image' ? (
              <img
                src={gallery[0].url}
                alt={gallery[0].altText}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => openLightbox(gallery[0], 0)}
              />
            ) : (
              <video
                src={gallery[0].url}
                className="w-full h-full object-cover cursor-pointer"
                controls
                poster={gallery[0].url + "?t=1"}
              />
            )}
            {gallery[0].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <p className="text-white text-sm">{gallery[0].caption}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (gallery.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {gallery.slice(0, 2).map((item, index) => (
            <div key={item.id} className="aspect-video relative rounded-lg overflow-hidden">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.altText}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => openLightbox(item, index)}
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover cursor-pointer"
                  controls
                  poster={item.url + "?t=1"}
                />
              )}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-white text-xs">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (gallery.length === 3) {
      return (
        <div className="grid grid-cols-3 gap-2">
          {gallery.slice(0, 3).map((item, index) => (
            <div key={item.id} className="aspect-video relative rounded-lg overflow-hidden">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.altText}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => openLightbox(item, index)}
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover cursor-pointer"
                  controls
                  poster={item.url + "?t=1"}
                />
              )}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-white text-xs">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    // For 4+ images, use a 2x2 grid with overflow indicator
    return (
      <div className="grid grid-cols-2 gap-2">
        {gallery.slice(0, 3).map((item, index) => (
          <div key={item.id} className="aspect-video relative rounded-lg overflow-hidden">
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.altText}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => openLightbox(item, index)}
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover cursor-pointer"
                controls
                poster={item.url + "?t=1"}
              />
            )}
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-white text-xs">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
        
        {/* Last slot with overflow indicator */}
        <div 
          className="aspect-video relative rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openLightbox(gallery[3], 3)}
        >
          {gallery[3].type === 'image' ? (
            <img
              src={gallery[3].url}
              alt={gallery[3].altText}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <video
              src={gallery[3].url}
              className="w-full h-full object-cover"
              poster={gallery[3].url + "?t=1"}
            />
          )}
          
          {gallery.length > 4 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="text-2xl font-bold">+{gallery.length - 4}</p>
                <p className="text-sm">more</p>
              </div>
            </div>
          )}
          
          {gallery[3].caption && gallery.length === 4 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
              <p className="text-white text-xs">{gallery[3].caption}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {renderCollage()}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation Buttons */}
            {gallery.length > 1 && (
              <>
                <Button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                  size="sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Main Content */}
            <div className="w-full h-full flex items-center justify-center">
              {selectedImage.type === 'image' ? (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.altText}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={selectedImage.url}
                  className="max-w-full max-h-full object-contain"
                  controls
                  autoPlay
                />
              )}
            </div>

            {/* Caption */}
            {selectedImage.caption && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black bg-opacity-50 rounded px-4 py-2 inline-block">
                  <p className="text-white text-sm">{selectedImage.caption}</p>
                </div>
              </div>
            )}

            {/* Image Counter */}
            {gallery.length > 1 && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded px-3 py-1">
                <p className="text-white text-sm">
                  {currentIndex + 1} of {gallery.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}