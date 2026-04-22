"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Upload, 
  X, 
  Images, 
  Loader2, 
  Eye,
  Edit3,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IGalleryItem } from "@/models/Itinerary"

interface GalleryUploadProps {
  gallery: IGalleryItem[]
  onGalleryUpdate: (gallery: IGalleryItem[]) => void
}

export function GalleryUpload({ gallery, onGalleryUpdate }: GalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState("")
  const [editAltText, setEditAltText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Validate file type
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')
        
        if (!isImage && !isVideo) {
          throw new Error(`File ${file.name} is not a supported image or video format`)
        }

        // Validate file size (7MB limit)
        if (file.size > 7 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 7MB`)
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        
        const galleryItem: IGalleryItem = {
          id: `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: result.url,
          type: isImage ? 'image' : 'video',
          caption: '',
          altText: file.name,
          fileName: result.filename,
          uploadedAt: new Date(),
        }

        return galleryItem
      } catch (error) {
        console.error('Upload error:', error)
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload file",
          variant: "destructive",
        })
        return null
      }
    })

    try {
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter((item): item is IGalleryItem => item !== null)
      
      if (successfulUploads.length > 0) {
        onGalleryUpdate([...gallery, ...successfulUploads])
        toast({
          title: "Upload Successful",
          description: `${successfulUploads.length} file(s) uploaded successfully`,
        })
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Some files failed to upload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveItem = (itemId: string) => {
    onGalleryUpdate(gallery.filter(item => item.id !== itemId))
    toast({
      title: "Item Removed",
      description: "Gallery item has been removed",
    })
  }

  const handleEditItem = (item: IGalleryItem) => {
    setEditingItem(item.id)
    setEditCaption(item.caption || '')
    setEditAltText(item.altText || '')
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    const updatedGallery = gallery.map(item => 
      item.id === editingItem 
        ? { ...item, caption: editCaption, altText: editAltText }
        : item
    )
    
    onGalleryUpdate(updatedGallery)
    setEditingItem(null)
    setEditCaption('')
    setEditAltText('')
    
    toast({
      title: "Item Updated",
      description: "Gallery item has been updated",
    })
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditCaption('')
    setEditAltText('')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Images className="h-5 w-5" />
          Gallery Section
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload images and videos to showcase in your itinerary preview. These will appear above the day-wise itinerary.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mb-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500">
                Drag and drop files here, or click to select
              </p>
              <p className="text-xs text-gray-400">
                Supports images and videos (max 7MB each)
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Items */}
        {gallery.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Gallery Items ({gallery.length})
            </Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div key={item.id} className="relative group">
                  <Card className="overflow-hidden">
                    <div className="aspect-video relative">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.altText}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                        />
                      )}
                      
                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Item Info */}
                    <CardContent className="p-3">
                      {editingItem === item.id ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Caption"
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            className="text-xs"
                          />
                          <Input
                            placeholder="Alt text"
                            value={editAltText}
                            onChange={(e) => setEditAltText(e.target.value)}
                            className="text-xs"
                          />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={handleSaveEdit} className="text-xs">
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="text-xs">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-medium truncate">
                            {item.caption || item.fileName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {item.type}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
