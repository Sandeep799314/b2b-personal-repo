"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Trash2, 
  GripVertical,
  Type,
  List,
  Image as ImageIcon,
  Minus,
  Quote,
  Table,
  Eye,
  Code,
  ChevronUp,
  ChevronDown,
  Loader2,
  Undo,
  Redo,
  FileText,
  Smartphone,
  Monitor
} from "lucide-react"
import { IHtmlBlock } from "@/models/Itinerary"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/client-auth"
import { GalleryUpload } from "./itinerary-builder/gallery-upload"
import type { IGalleryItem } from "@/models/Itinerary"

interface HtmlEditorBuilderProps {
  itineraryId?: string
  onBack: () => void
}

const BLOCK_TYPES = [
  { type: "heading", label: "Heading", icon: Type, description: "Add a heading (H1-H6)" },
  { type: "paragraph", label: "Paragraph", icon: Type, description: "Add a text paragraph" },
  { type: "list", label: "List", icon: List, description: "Add ordered or unordered list" },
  { type: "image", label: "Image", icon: ImageIcon, description: "Add an image with caption" },
  { type: "divider", label: "Divider", icon: Minus, description: "Add a horizontal line" },
  { type: "quote", label: "Quote", icon: Quote, description: "Add a blockquote" },
  { type: "table", label: "Table", icon: Table, description: "Add a simple table" },
] as const

export function HtmlEditorBuilder({ itineraryId, onBack }: HtmlEditorBuilderProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("New HTML Itinerary")
  const [description, setDescription] = useState("")
  const [productId, setProductId] = useState(`HTM-${Date.now().toString(36).toUpperCase()}`)
  const [htmlBlocks, setHtmlBlocks] = useState<IHtmlBlock[]>([])
  const [showAddBlockForm, setShowAddBlockForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<IHtmlBlock | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [blockForm, setBlockForm] = useState({
    type: "paragraph" as IHtmlBlock["type"],
    content: "",
    level: 1,
    listType: "unordered" as "ordered" | "unordered",
    items: [""],
    imageUrl: "",
    imageCaption: "",
  })

  // Gallery state
  const [gallery, setGallery] = useState<IGalleryItem[]>([])

  // Load existing HTML data if editing
  useEffect(() => {
    if (itineraryId) {
      loadHtmlData()
    } else {
      initializeFromParams()
    }
  }, [itineraryId])

  const loadHtmlData = async () => {
    try {
      const authHeaders = await getAuthHeaders()
      const response = await fetch(`/api/itineraries/${itineraryId}`, {
        headers: authHeaders,
      })
      if (response.ok) {
        const data = await response.json()
        setTitle(data.title || "HTML Itinerary")
        setDescription(data.description || "")
        setProductId(data.productId || productId)
        setHtmlBlocks(data.htmlBlocks || [])
        setGallery(data.gallery || [])
      }
    } catch (error) {
      console.error("Failed to load HTML data:", error)
      toast({
        title: "Error",
        description: "Failed to load HTML data",
        variant: "destructive",
      })
    }
  }

  const initializeFromParams = () => {
    const params = new URLSearchParams(window.location.search)
    setTitle(params.get("name") || "New HTML Itinerary")
    setDescription(params.get("description") || "")
    setProductId(params.get("productId") || productId)
  }

  const handleAddBlock = () => {
    if (!blockForm.content && blockForm.type !== "divider") {
      toast({
        title: "Validation Error",
        description: "Please add content for the block",
        variant: "destructive",
      })
      return
    }

    const newBlock: IHtmlBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockForm.type,
      content: blockForm.content,
      order: htmlBlocks.length,
      createdAt: new Date(),
      ...(blockForm.type === "heading" && { level: blockForm.level }),
      ...(blockForm.type === "list" && { 
        listType: blockForm.listType,
        items: blockForm.items.filter(item => item.trim())
      }),
      ...(blockForm.type === "image" && { 
        imageUrl: blockForm.imageUrl,
        imageCaption: blockForm.imageCaption
      }),
    }

    setHtmlBlocks([...htmlBlocks, newBlock])
    resetBlockForm()
    setShowAddBlockForm(false)

    toast({
      title: "Success",
      description: "Block added successfully",
    })
  }

  const handleEditBlock = (block: IHtmlBlock) => {
    setEditingBlock(block)
    setBlockForm({
      type: block.type,
      content: block.content,
      level: block.level || 1,
      listType: block.listType || "unordered",
      items: block.items || [""],
      imageUrl: block.imageUrl || "",
      imageCaption: block.imageCaption || "",
    })
    setShowAddBlockForm(true)
  }

  const handleUpdateBlock = () => {
    if (!editingBlock || (!blockForm.content && blockForm.type !== "divider")) {
      toast({
        title: "Validation Error",
        description: "Please add content for the block",
        variant: "destructive",
      })
      return
    }

    const updatedBlocks = htmlBlocks.map(block => 
      block.id === editingBlock.id 
        ? {
            ...block,
            content: blockForm.content,
            ...(blockForm.type === "heading" && { level: blockForm.level }),
            ...(blockForm.type === "list" && { 
              listType: blockForm.listType,
              items: blockForm.items.filter(item => item.trim())
            }),
            ...(blockForm.type === "image" && { 
              imageUrl: blockForm.imageUrl,
              imageCaption: blockForm.imageCaption
            }),
          }
        : block
    )

    setHtmlBlocks(updatedBlocks)
    resetBlockForm()
    setShowAddBlockForm(false)
    setEditingBlock(null)

    toast({
      title: "Success",
      description: "Block updated successfully",
    })
  }

  const handleDeleteBlock = (blockId: string) => {
    setHtmlBlocks(htmlBlocks.filter(block => block.id !== blockId))
    toast({
      title: "Success",
      description: "Block deleted successfully",
    })
  }

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const currentIndex = htmlBlocks.findIndex(block => block.id === blockId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= htmlBlocks.length) return

    const newBlocks = [...htmlBlocks]
    const [movedBlock] = newBlocks.splice(currentIndex, 1)
    newBlocks.splice(newIndex, 0, movedBlock)

    // Update order values
    const updatedBlocks = newBlocks.map((block, index) => ({ ...block, order: index }))
    setHtmlBlocks(updatedBlocks)
  }

  const resetBlockForm = () => {
    setBlockForm({
      type: "paragraph",
      content: "",
      level: 1,
      listType: "unordered",
      items: [""],
      imageUrl: "",
      imageCaption: "",
    })
  }

  const handleSave = async () => {
    try {
      const itineraryData = {
        productId,
        title,
        description,
        type: "html-editor",
        destination: "Custom",
        duration: "Variable",
        totalPrice: 0,
        currency: "USD",

        createdBy: "agent-user",
        lastUpdatedBy: "agent-user",
        countries: [],
        days: [],
        highlights: [],
        images: [],
        gallery,
        htmlBlocks: htmlBlocks.sort((a, b) => a.order - b.order),
        htmlContent: generateHtmlContent(),
      }

      const url = itineraryId ? `/api/itineraries/${itineraryId}` : "/api/itineraries"
      const method = itineraryId ? "PUT" : "POST"

      const authHeaders = await getAuthHeaders()
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          ...authHeaders
        },
        body: JSON.stringify(itineraryData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `HTML Itinerary ${itineraryId ? "updated" : "created"} successfully`,
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save HTML itinerary",
        variant: "destructive",
      })
    }
  }

  const generateHtmlContent = () => {
    return htmlBlocks
      .sort((a, b) => a.order - b.order)
      .map(block => {
        switch (block.type) {
          case "heading":
            return `<h${block.level || 1}>${block.content}</h${block.level || 1}>`
          case "paragraph":
            return `<p>${block.content}</p>`
          case "list":
            const listTag = block.listType === "ordered" ? "ol" : "ul"
            const listItems = block.items?.map(item => `<li>${item}</li>`).join("") || ""
            return `<${listTag}>${listItems}</${listTag}>`
          case "image":
            return `<figure><img src="${block.imageUrl}" alt="${block.imageCaption || ''}" />${block.imageCaption ? `<figcaption>${block.imageCaption}</figcaption>` : ""}</figure>`
          case "divider":
            return "<hr />"
          case "quote":
            return `<blockquote>${block.content}</blockquote>`
          case "table":
            // Simple table implementation
            return `<table><tbody><tr><td>${block.content}</td></tr></tbody></table>`
          default:
            return `<p>${block.content}</p>`
        }
      })
      .join("\n")
  }

  const renderBlockPreview = (block: IHtmlBlock) => {
    switch (block.type) {
      case "heading":
        const level = block.level || 1
        if (level === 1) return <h1 className="text-3xl font-bold">{block.content}</h1>
        if (level === 2) return <h2 className="text-2xl font-bold">{block.content}</h2>
        if (level === 3) return <h3 className="text-xl font-bold">{block.content}</h3>
        if (level === 4) return <h4 className="text-lg font-bold">{block.content}</h4>
        if (level === 5) return <h5 className="text-base font-bold">{block.content}</h5>
        return <h6 className="text-sm font-bold">{block.content}</h6>
      case "paragraph":
        return <p className="text-gray-700">{block.content}</p>
      case "list":
        const ListTag = block.listType === "ordered" ? "ol" : "ul"
        return (
          <ListTag className={block.listType === "ordered" ? "list-decimal pl-6" : "list-disc pl-6"}>
            {block.items?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ListTag>
        )
      case "image":
        return (
          <figure>
            {block.imageUrl ? (
              <img src={block.imageUrl} alt={block.imageCaption || ""} className="max-w-full h-auto rounded" />
            ) : (
              <div className="bg-gray-200 p-8 text-center rounded">
                <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">Image placeholder</p>
              </div>
            )}
            {block.imageCaption && <figcaption className="text-sm text-gray-600 mt-2">{block.imageCaption}</figcaption>}
          </figure>
        )
      case "divider":
        return <hr className="border-gray-300" />
      case "quote":
        return <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">{block.content}</blockquote>
      case "table":
        return (
          <table className="border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">{block.content}</td>
              </tr>
            </tbody>
          </table>
        )
      default:
        return <p>{block.content}</p>
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">HTML Editor</h1>
            <p className="text-sm text-gray-500">Build itineraries using HTML blocks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Information */}
          {!previewMode && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter itinerary title"
                  />
                </div>
                <div>
                  <Label>Product ID</Label>
                  <Input
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Enter product ID"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* HTML Blocks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {previewMode ? "Preview" : `Content Blocks (${htmlBlocks.length})`}
                </CardTitle>
                {!previewMode && (
                  <Button onClick={() => setShowAddBlockForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {htmlBlocks.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No content blocks</p>
                  {!previewMode && (
                    <Button 
                      onClick={() => setShowAddBlockForm(true)}
                      className="mt-4"
                    >
                      Add First Block
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {htmlBlocks
                    .sort((a, b) => a.order - b.order)
                    .map((block, index) => (
                      <div
                        key={block.id}
                        className={`border rounded-lg p-4 ${previewMode ? '' : 'flex items-start justify-between'}`}
                      >
                        {previewMode ? (
                          <div className="prose max-w-none">
                            {renderBlockPreview(block)}
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {block.type.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Block {index + 1}
                                </span>
                              </div>
                              <div className="prose max-w-none">
                                {renderBlockPreview(block)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveBlock(block.id, "up")}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveBlock(block.id, "down")}
                                disabled={index === htmlBlocks.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditBlock(block)}
                              >
                                <Type className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBlock(block.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        {!previewMode && (
          <div className="space-y-6">
            {/* Gallery Upload */}
            <GalleryUpload
              gallery={gallery}
              onGalleryUpdate={setGallery}
            />

            {/* Add Block Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Add Content Block</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {BLOCK_TYPES.map((blockType) => {
                    const IconComponent = blockType.icon
                    return (
                      <Button
                        key={blockType.type}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => {
                          setBlockForm(prev => ({ ...prev, type: blockType.type }))
                          setShowAddBlockForm(true)
                        }}
                      >
                        <IconComponent className="h-4 w-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{blockType.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {blockType.description}
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Block Summary */}
            {htmlBlocks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Content Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      htmlBlocks.reduce((acc, block) => {
                        acc[block.type] = (acc[block.type] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="capitalize">{type}s:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Block Modal */}
      {showAddBlockForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingBlock ? "Edit Block" : "Add New Block"}
            </h3>
            <div className="space-y-4">
              {!editingBlock && (
                <div>
                  <Label>Block Type</Label>
                  <select
                    value={blockForm.type}
                    onChange={(e) => setBlockForm(prev => ({ ...prev, type: e.target.value as IHtmlBlock["type"] }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {BLOCK_TYPES.map(type => (
                      <option key={type.type} value={type.type}>{type.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {blockForm.type === "heading" && (
                <div>
                  <Label>Heading Level</Label>
                  <select
                    value={blockForm.level}
                    onChange={(e) => setBlockForm(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {[1, 2, 3, 4, 5, 6].map(level => (
                      <option key={level} value={level}>H{level}</option>
                    ))}
                  </select>
                </div>
              )}

              {blockForm.type !== "divider" && blockForm.type !== "list" && blockForm.type !== "image" && (
                <div>
                  <Label>Content *</Label>
                  <Textarea
                    value={blockForm.content}
                    onChange={(e) => setBlockForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter content"
                    rows={4}
                  />
                </div>
              )}

              {blockForm.type === "list" && (
                <>
                  <div>
                    <Label>List Type</Label>
                    <select
                      value={blockForm.listType}
                      onChange={(e) => setBlockForm(prev => ({ ...prev, listType: e.target.value as "ordered" | "unordered" }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="unordered">Unordered (bullets)</option>
                      <option value="ordered">Ordered (numbers)</option>
                    </select>
                  </div>
                  <div>
                    <Label>List Items</Label>
                    {blockForm.items.map((item, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const newItems = [...blockForm.items]
                            newItems[index] = e.target.value
                            setBlockForm(prev => ({ ...prev, items: newItems }))
                          }}
                          placeholder={`Item ${index + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newItems = blockForm.items.filter((_, i) => i !== index)
                            setBlockForm(prev => ({ ...prev, items: newItems }))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBlockForm(prev => ({ ...prev, items: [...prev.items, ""] }))}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </>
              )}

              {blockForm.type === "image" && (
                <>
                  <div>
                    <Label>Image URL *</Label>
                    <Input
                      value={blockForm.imageUrl}
                      onChange={(e) => setBlockForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Enter image URL"
                    />
                  </div>
                  <div>
                    <Label>Caption</Label>
                    <Input
                      value={blockForm.imageCaption}
                      onChange={(e) => setBlockForm(prev => ({ ...prev, imageCaption: e.target.value }))}
                      placeholder="Enter image caption"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddBlockForm(false)
                  setEditingBlock(null)
                  resetBlockForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingBlock ? handleUpdateBlock : handleAddBlock}>
                {editingBlock ? "Update" : "Add"} Block
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
