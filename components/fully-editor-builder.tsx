"use client"

import { useState, useEffect, useRef } from "react"
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
  ChevronUp,
  ChevronDown,
  Loader2,
  Check,
  Settings,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  MoreVertical,
  Copy,
  Layout,
  ListOrdered,
  FileText,
  Home,
  Type as TypeIcon,
  Printer,
  Share2,
  Undo2,
  Redo2,
  Search,
  Maximize2,
  Download,
  Strikethrough,
  Highlighter,
  Baseline,
  ChevronDown as ChevronDownIcon,
  Scissors,
  Clipboard,
  Eraser,
  Subscript,
  Superscript,
  CaseSensitive,
  MoreHorizontal,
  Indent,
  Outdent,
  SortAsc,
  Pilcrow,
  FileBox,
  FolderOpen,
  Info,
  Code,
  Video,
  ExternalLink,
  Zap,
  MoveVertical
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/client-auth"
import { GalleryUpload } from "./itinerary-builder/gallery-upload"
import { IHtmlBlock, IGalleryItem } from "@/models/Itinerary"
import { cn } from "@/lib/utils"
import { TiptapEditor } from "./tiptap-editor"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AVAILABLE_FONTS as DEFAULT_FONTS, AVAILABLE_COLORS as DEFAULT_COLORS, BLOCK_TYPES as DEFAULT_BLOCK_TYPES } from "../lib/editor-constants"

interface FullyEditorBuilderProps {
  itineraryId?: string
  quotationId?: string
  mode?: "itinerary" | "quotation"
  onBack: () => void
  onSave?: (data?: any) => Promise<void>
  readOnly?: boolean
  initialHtmlBlocks?: IHtmlBlock[]
  initialTitle?: string
  initialDescription?: string
}

const PAGE_HEIGHT = 1122; // A4 height in px at 96dpi (standard A4 is 297mm ≈ 1122px)

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const DEFAULT_ITINERARY_TEMPLATE = (productId: string): IHtmlBlock[] => [
  // --- PAGE 1: COVER PAGE ---
  {
    id: `p1-hero`,
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1506929113675-b92417bbbe50?q=80&w=2000&auto=format&fit=crop",
    imageCaption: "A World of Luxury Awaits",
    width: "100%",
    order: 0,
    createdAt: new Date(),
  },
  { id: `p1-spacer-1`, type: "spacer", height: "60px", order: 1, createdAt: new Date() },
  {
    id: `p1-title`,
    type: "heading",
    level: 1,
    content: "The Eternal Horizon: 7-Day Luxury Escape",
    align: "center",
    fontSize: "52px",
    color: "#0f172a",
    bold: true,
    fontFamily: "font-serif",
    order: 2,
    createdAt: new Date(),
  },
  {
    id: `p1-meta`,
    type: "paragraph",
    content: `CURATED EXCLUSIVELY FOR OUR ESTEEMED GUESTS\nReference: ${productId} | Premium Suite Experience`,
    align: "center",
    fontSize: "16px",
    color: "#64748b",
    bold: true,
    order: 3,
    createdAt: new Date(),
  },
  { id: `p1-divider`, type: "divider", order: 4, createdAt: new Date() },
  {
    id: `p1-welcome`,
    type: "callout",
    calloutType: "info",
    content: "Welcome to a journey where every detail is a masterpiece. We have meticulously designed this week to offer you the perfect blend of high-octane adventure and soul-soothing relaxation.",
    order: 5,
    createdAt: new Date(),
  },
];

export function FullyEditorBuilder({ 
  itineraryId, 
  quotationId, 
  mode = "itinerary", 
  onBack, 
  onSave, 
  readOnly = false,
  initialHtmlBlocks,
  initialTitle,
  initialDescription
}: FullyEditorBuilderProps) {
  const { toast } = useToast()
  
  // Safe Fallbacks for constants
  const AVAILABLE_FONTS = DEFAULT_FONTS || [
    { label: "Calibri", value: "font-sans" },
    { label: "Arial", value: "font-sans font-normal" },
    { label: "Times New Roman", value: "font-serif" },
    { label: "Courier New", value: "font-mono" },
  ];
  
  const AVAILABLE_COLORS = DEFAULT_COLORS || [
    { label: "Automatic", value: "#000000" },
    { label: "Red", value: "#FF0000" },
    { label: "Blue", value: "#0070C0" },
  ];

  const BLOCK_TYPES = DEFAULT_BLOCK_TYPES || [];

  const [title, setTitle] = useState(initialTitle || "Document1")
  const [description, setDescription] = useState(initialDescription || "")
  const [productId, setProductId] = useState(`ITN-${Date.now().toString(36).toUpperCase()}`)
  const [htmlBlocks, setHtmlBlocks] = useState<IHtmlBlock[]>(initialHtmlBlocks || [])

  // Sync state when initial props change
  useEffect(() => {
    if (initialTitle !== undefined) {
      setTitle(initialTitle || "Document1")
    }
  }, [initialTitle])

  useEffect(() => {
    if (initialDescription !== undefined) {
      setDescription(initialDescription || "")
    }
  }, [initialDescription])
  const [previewMode, setPreviewMode] = useState(readOnly)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [gallery, setGallery] = useState<IGalleryItem[]>([])
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [imageSourceBlockId, setImageSourceBlockId] = useState<string | null>(null)
  const [videoSourceBlockId, setVideoSourceBlockId] = useState<string | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [videoUrlInput, setVideoUrlInput] = useState("")
  const [resizing, setResizing] = useState<{ 
    id: string; 
    galleryIdx?: number;
    startX: number; 
    startY: number; 
    startWidth: number; 
    startHeight: number;
    handle: 'br' | 'bl' | 'tr' | 'tl' 
  } | null>(null)
  const [moving, setMoving] = useState<{ id: string; startX: number; startY: number; initialX: number; initialY: number } | null>(null)
  const [pageCount, setPageCount] = useState(1)
  const [activePage, setActivePage] = useState(1)
  const contentRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)

  // Load existing HTML data if editing
  useEffect(() => {
    if (initialHtmlBlocks && initialHtmlBlocks.length > 0) {
      setHtmlBlocks(initialHtmlBlocks)
      return;
    }

    if (mode === "itinerary" && itineraryId) {
      loadHtmlData()
    }
  }, [itineraryId, mode, initialHtmlBlocks])

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
        if (data.htmlBlocks && data.htmlBlocks.length > 0) {
          setHtmlBlocks(data.htmlBlocks)
        } else {
          setHtmlBlocks(DEFAULT_ITINERARY_TEMPLATE(data.productId || productId))
        }
        setGallery(data.gallery || [])
      }
    } catch (error) {
      console.error("Failed to load HTML data:", error)
    }
  }

  // Handle automatic pagination and active page tracking
  useEffect(() => {
    const measureElement = contentRef.current;
    if (!measureElement) return;

    const updatePagination = () => {
      const height = measureElement.offsetHeight;
      const totalHeight = height;
      const newPageCount = Math.max(1, Math.ceil(totalHeight / PAGE_HEIGHT));
      
      setPageCount(prev => {
        if (newPageCount !== prev) return newPageCount;
        return prev;
      });
    };

    const resizeObserver = new ResizeObserver(updatePagination);
    resizeObserver.observe(measureElement);
    updatePagination();
    return () => resizeObserver.disconnect();
  }, [htmlBlocks.length]);

  const scrollToPage = (pageNum: number) => {
    if (!workspaceRef.current) return;
    const zoomFactor = zoom / 100;
    const scrollPos = (pageNum - 1) * (PAGE_HEIGHT * zoomFactor + (32 * zoomFactor)); 
    workspaceRef.current.scrollTo({
      top: scrollPos,
      behavior: 'smooth'
    });
    setActivePage(pageNum);
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const zoomFactor = zoom / 100;
    const pageFullHeight = (PAGE_HEIGHT * zoomFactor + (32 * zoomFactor));
    const pagePos = Math.floor((scrollTop + (200 * zoomFactor)) / pageFullHeight) + 1;
    if (pagePos !== activePage && pagePos > 0 && pagePos <= pageCount) {
      setActivePage(pagePos);
    }
  }

  const handleAddPage = () => {
    const pageBreakBlock: IHtmlBlock = {
       id: `block-pb-${Date.now()}`,
       type: "spacer",
       height: `${PAGE_HEIGHT}px`,
       order: htmlBlocks.length,
       createdAt: new Date(),
    }
    const newParagraph: IHtmlBlock = {
      id: `block-new-p-${Date.now()}`,
      type: "paragraph",
      content: "",
      order: htmlBlocks.length + 1,
      createdAt: new Date(),
    }
    setHtmlBlocks(prev => [...prev, pageBreakBlock, newParagraph])
    setTimeout(() => {
      toast({ title: "Page Added", description: "New page created at the end." })
      scrollToPage(pageCount + 1)
    }, 200)
  }

  useEffect(() => {
    if (!resizing && !moving) return
    const handleMouseMove = (e: MouseEvent) => {
      const zoomFactor = zoom / 100;
      if (resizing) {
        const deltaX = (e.clientX - resizing.startX) / zoomFactor
        const deltaY = (e.clientY - resizing.startY) / zoomFactor
        let newWidth = resizing.startWidth / zoomFactor
        let newHeight = resizing.startHeight / zoomFactor
        if (resizing.handle === 'br') {
          newWidth = (resizing.startWidth / zoomFactor) + deltaX
          newHeight = (resizing.startHeight / zoomFactor) + deltaY
        } else if (resizing.handle === 'bl') {
          newWidth = (resizing.startWidth / zoomFactor) - deltaX
          newHeight = (resizing.startHeight / zoomFactor) + deltaY
        } else if (resizing.handle === 'tr') {
          newWidth = (resizing.startWidth / zoomFactor) + deltaX
          newHeight = (resizing.startHeight / zoomFactor) - deltaY
        } else if (resizing.handle === 'tl') {
          newWidth = (resizing.startWidth / zoomFactor) - deltaX
          newHeight = (resizing.startHeight / zoomFactor) - deltaY
        }
        if (resizing.galleryIdx !== undefined) {
          const block = htmlBlocks.find(b => b.id === resizing.id)
          if (block && block.galleryItems) {
            const newGalleryItems = [...block.galleryItems]
            newGalleryItems[resizing.galleryIdx] = {
              ...newGalleryItems[resizing.galleryIdx],
              width: `${Math.max(50, newWidth)}px`,
              height: `${Math.max(50, newHeight)}px`
            }
            updateBlockFormatting(resizing.id, { galleryItems: newGalleryItems })
          }
        } else {
          updateBlockFormatting(resizing.id, { 
            width: `${Math.max(50, newWidth)}px`,
            height: `${Math.max(50, newHeight)}px`
          })
        }
      } else if (moving) {
        const deltaX = (e.clientX - moving.startX) / zoomFactor
        const deltaY = (e.clientY - moving.startY) / zoomFactor
        updateBlockFormatting(moving.id, { 
          x: moving.initialX + deltaX,
          y: moving.initialY + deltaY
        })
      }
    }
    const handleMouseUp = () => {
      setResizing(null)
      setMoving(null)
      document.body.style.cursor = 'default'
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, moving, htmlBlocks, zoom])

  const handleKeyDown = (e: React.KeyboardEvent, block: IHtmlBlock) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addNewBlockAfter(block.id)
    } else if (e.key === 'Backspace' && !block.content && htmlBlocks.length > 1) {
      e.preventDefault()
      deleteBlock(block.id)
    }
  }

  const addNewBlockAfter = (blockId: string) => {
    const currentIndex = htmlBlocks.findIndex(b => b.id === blockId)
    const newBlock: IHtmlBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "paragraph",
      content: "",
      order: currentIndex + 1,
      createdAt: new Date(),
      fontSize: htmlBlocks[currentIndex]?.fontSize || '16px',
      fontFamily: htmlBlocks[currentIndex]?.fontFamily || 'font-sans',
      align: 'left',
    }
    const newBlocks = [...htmlBlocks]
    newBlocks.splice(currentIndex + 1, 0, newBlock)
    const updatedBlocks = newBlocks.map((b, index) => ({ ...b, order: index }))
    setHtmlBlocks(updatedBlocks)
    setTimeout(() => {
      const element = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement
      if (element) element.focus()
    }, 10)
  }

  const addNewBlock = (type: IHtmlBlock["type"]) => {
    const newBlock: IHtmlBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: type === "divider" ? "" : (type === "callout" ? "Enter information here..." : "New " + type),
      order: htmlBlocks.length,
      createdAt: new Date(),
      fontSize: '16px',
      align: 'left',
      ...(type === "heading" && { level: 1 }),
      ...(type === "list" && { listType: "unordered", items: [""] }),
      ...(type === "gallery" && { galleryItems: [] }),
      ...(type === "callout" && { calloutType: "info" }),
      ...(type === "spacer" && { height: "40px" }),
      ...(type === "table" && { 
        tableData: [
          ["Header 1", "Header 2", "Header 3"],
          ["Cell 1", "Cell 2", "Cell 3"],
          ["Cell 4", "Cell 5", "Cell 6"]
        ] 
      }),
    }
    setHtmlBlocks([...htmlBlocks, newBlock])
    toast({ title: "Success", description: `${type} block added` })
  }

  const deleteBlock = (blockId: string) => {
    const currentIndex = htmlBlocks.findIndex(b => b.id === blockId)
    if (currentIndex > 0) {
      const prevBlockId = htmlBlocks[currentIndex - 1].id
      setHtmlBlocks(prev => prev.filter(b => b.id !== blockId))
      setTimeout(() => {
        const element = document.querySelector(`[data-block-id="${prevBlockId}"]`) as HTMLElement
        if (element) {
          element.focus()
          const range = document.createRange()
          const sel = window.getSelection()
          range.selectNodeContents(element)
          range.collapse(false)
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
      }, 10)
    } else if (htmlBlocks.length > 1) {
      setHtmlBlocks(prev => prev.filter(b => b.id !== blockId))
    }
  }

  const updateBlockFormatting = (blockId: string, updates: Partial<IHtmlBlock>) => {
    setHtmlBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const sortedBlocks = [...htmlBlocks].sort((a, b) => a.order - b.order);
      const itineraryData = {
        productId,
        title,
        description,
        type: "fully-editor",
        destination: "Custom",
        duration: "Variable",
        totalPrice: 0,
        currency: "USD",
        createdBy: "agent-user",
        gallery,
        htmlBlocks: sortedBlocks,
      }

      if (mode === "quotation" && quotationId && onSave) {
        await onSave({
          title,
          description,
          type: "fully-editor",
          htmlBlocks: sortedBlocks,
          gallery,
        });
        setIsSaving(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
        return;
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
        toast({ title: "Success", description: "Document saved" })
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 2000)
        if (onSave) onSave(itineraryData);
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({ title: "Error", description: "Failed to save", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBlur = (blockId: string, content: string) => {
    updateBlockFormatting(blockId, { content })
    if (!content.trim() && htmlBlocks.length > 1) {
      setTimeout(() => {
        setHtmlBlocks(prev => {
          if (prev.length <= 1) return prev
          const block = prev.find(b => b.id === blockId)
          if (!block) return prev
          if (block.type === 'paragraph' && !block.content.trim()) {
             return prev.filter(b => b.id !== blockId)
          }
          return prev
        })
      }, 100)
    }
    setFocusedBlockId(null)
  }

  const handleWorkspaceClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const newBlock: IHtmlBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "paragraph",
        content: "",
        order: htmlBlocks.length,
        createdAt: new Date(),
        fontSize: '16px',
        align: 'left',
      }
      setHtmlBlocks([...htmlBlocks, newBlock])
      setTimeout(() => {
        const element = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement
        element?.focus()
      }, 0)
    }
  }

  const handleDeletePage = (pageNum: number) => {
    if (pageCount <= 1) {
      toast({ title: "Cannot Delete", description: "You must have at least one page.", variant: "destructive" });
      return;
    }
    const master = contentRef.current;
    if (!master) return;
    const pageStart = (pageNum - 1) * PAGE_HEIGHT;
    const pageEnd = pageNum * PAGE_HEIGHT;
    const blocksToRemove: string[] = [];
    const blockElements = master.querySelectorAll('[data-block-id]');
    blockElements.forEach((el: any) => {
      const rect = el.getBoundingClientRect();
      const masterRect = master.getBoundingClientRect();
      const relativeTop = rect.top - masterRect.top;
      if (relativeTop >= pageStart && relativeTop < pageEnd) {
        blocksToRemove.push(el.getAttribute('data-block-id'));
      }
    });
    if (blocksToRemove.length > 0) {
      setHtmlBlocks(prev => prev.filter(b => !blocksToRemove.includes(b.id)));
      toast({ title: "Page Content Deleted", description: `Removed ${blocksToRemove.length} blocks from Page ${pageNum}.` });
    }
  };

  const renderBlock = (block: IHtmlBlock) => {
    const isFocused = focusedBlockId === block.id;
    const isHovered = hoveredBlockId === block.id;

    const style: React.CSSProperties = {
      fontWeight: block.bold ? 'bold' : 'normal',
      fontStyle: block.italic ? 'italic' : 'normal',
      textDecoration: block.underline ? 'underline' : 'none',
      textAlign: (block.align as any) || 'left',
      color: block.color || 'inherit',
      fontSize: block.fontSize && !block.fontSize.startsWith('text-') ? (block.fontSize.includes('px') ? block.fontSize : `${block.fontSize}px`) : '16px',
      fontFamily: block.fontFamily || 'inherit',
      lineHeight: '1.5',
      ...(block.x !== undefined && {
        position: 'absolute',
        left: `${block.x}px`,
        top: `${block.y}px`,
        zIndex: isFocused ? 20 : 10,
        width: block.width || '300px',
      }),
      ...((block.type === 'image' || block.type === 'gallery' || block.type === 'video') && block.x === undefined && {
        width: block.width && block.width !== '100%' ? block.width : 'fit-content',
        maxWidth: '100%',
      }),
      ...(block.float && block.float !== 'none' && {
        float: block.float,
        marginRight: block.float === 'left' ? '20px' : '0',
        marginLeft: block.float === 'right' ? '20px' : '0',
        marginBottom: '10px',
        width: block.width || '300px',
      })
    }

    const renderFloatingToolbar = () => {
      if (!isHovered && !isFocused) return null;
      if (previewMode) return null;

      const ToolbarButton = ({ children, onClick, active, variant = "ghost", className = "" }: any) => (
        <Button
          variant={variant}
          size="icon"
          className={cn("h-7 w-7", active && "bg-neutral-100 text-blue-600", className)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClick}
        >
          {children}
        </Button>
      );

      if (block.type === 'table') {
        return (
          <div className="absolute -top-12 left-0 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
             <div className="absolute top-full left-0 w-full h-4 bg-transparent" />
             <div className="flex items-center bg-white border border-neutral-200 shadow-xl rounded-md p-1 gap-0.5">
                <div className="flex items-center gap-0.5 border-r border-neutral-100 pr-1 mr-1">
                  <ToolbarButton onClick={() => {
                    const newData = [...(block.tableData || [[]])]
                    const cols = newData[0]?.length || 1
                    newData.push(new Array(cols).fill("New Cell"))
                    updateBlockFormatting(block.id, { tableData: newData })
                  }} title="Add Row">
                    <Plus className="h-3.5 w-3.5" /><span className="text-[10px] ml-1">Row</span>
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {
                    const newData = (block.tableData || [[]]).map(row => [...row, "New Cell"])
                    updateBlockFormatting(block.id, { tableData: newData })
                  }} title="Add Column">
                    <Plus className="h-3.5 w-3.5" /><span className="text-[10px] ml-1">Col</span>
                  </ToolbarButton>
                </div>
                <div className="flex items-center gap-0.5 border-r border-neutral-100 pr-1 mr-1">
                  <ToolbarButton className="text-red-500" onClick={() => {
                    const newData = [...(block.tableData || [[]])]
                    if (newData.length > 1) { newData.pop(); updateBlockFormatting(block.id, { tableData: newData }) }
                  }} title="Delete Last Row">
                    <Trash2 className="h-3.5 w-3.5" /><span className="text-[10px] ml-1">Row</span>
                  </ToolbarButton>
                  <ToolbarButton className="text-red-500" onClick={() => {
                    const newData = (block.tableData || [[]]).map(row => {
                      if (row.length > 1) { const newRow = [...row]; newRow.pop(); return newRow }
                      return row
                    })
                    updateBlockFormatting(block.id, { tableData: newData })
                  }} title="Delete Last Column">
                    <Trash2 className="h-3.5 w-3.5" /><span className="text-[10px] ml-1">Col</span>
                  </ToolbarButton>
                </div>
                <ToolbarButton className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteBlock(block.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </ToolbarButton>
             </div>
          </div>
        )
      }

      if (block.type === 'image' || block.type === 'video') {
        return (
          <div className="absolute -top-12 left-0 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="absolute top-full left-0 w-full h-4 bg-transparent" />
            <div className="flex items-center bg-white border border-neutral-200 shadow-xl rounded-md p-1 gap-0.5">
              <div className="flex items-center gap-0.5 border-r border-neutral-100 pr-1 mr-1">
                <ToolbarButton active={(block.align === 'left' || !block.align)} onClick={() => updateBlockFormatting(block.id, { align: 'left' })}><AlignLeft className="h-3.5 w-3.5" /></ToolbarButton>
                <ToolbarButton active={block.align === 'center'} onClick={() => updateBlockFormatting(block.id, { align: 'center' })}><AlignCenter className="h-3.5 w-3.5" /></ToolbarButton>
                <ToolbarButton active={block.align === 'right'} onClick={() => updateBlockFormatting(block.id, { align: 'right' })}><AlignRight className="h-3.5 w-3.5" /></ToolbarButton>
              </div>
              <div className="flex items-center gap-1 border-r border-neutral-100 pr-1 mr-1">
                <ToolbarButton onClick={() => {
                  if (block.type === 'image') { setImageSourceBlockId(block.id); setImageUrlInput(block.imageUrl || "") }
                  else { setVideoSourceBlockId(block.id); setVideoUrlInput(block.videoUrl || "") }
                }} title="Edit Link">
                  {block.type === 'image' ? <ImageIcon className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                </ToolbarButton>
                <ToolbarButton active={block.x !== undefined} onClick={() => {
                  if (block.x === undefined) updateBlockFormatting(block.id, { x: 0, y: 0, width: block.width || '300px', float: 'none' })
                  else updateBlockFormatting(block.id, { x: undefined, y: undefined, width: '100%' })
                }} title="Toggle Free Move">
                  <Maximize2 className="h-3.5 w-3.5" />
                </ToolbarButton>
                <div className="flex items-center gap-0.5 border-l border-neutral-100 pl-1 ml-1">
                   <ToolbarButton active={block.float === 'left'} onClick={() => updateBlockFormatting(block.id, { float: block.float === 'left' ? 'none' : 'left', x: undefined, y: undefined })} title="Wrap Text Left">
                    <AlignLeft className="h-3.5 w-3.5 bg-neutral-200 rounded-sm p-0.5" />
                  </ToolbarButton>
                  <ToolbarButton active={block.float === 'right'} onClick={() => updateBlockFormatting(block.id, { float: block.float === 'right' ? 'none' : 'right', x: undefined, y: undefined })} title="Wrap Text Right">
                    <AlignRight className="h-3.5 w-3.5 bg-neutral-200 rounded-sm p-0.5" />
                  </ToolbarButton>
                </div>
                <select className="text-[10px] h-7 border-none bg-neutral-50 rounded px-1 outline-none font-medium cursor-pointer" value={block.width || '100%'} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => updateBlockFormatting(block.id, { width: e.target.value, height: undefined })}>
                  <option value="25%">Small</option><option value="50%">Medium</option><option value="75%">Large</option><option value="100%">Full</option>
                </select>
              </div>
              <ToolbarButton className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteBlock(block.id)}><Trash2 className="h-3.5 w-3.5" /></ToolbarButton>
            </div>
          </div>
        )
      }

      if (block.type === 'callout') {
        return (
          <div className="absolute -top-12 left-0 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
             <div className="absolute top-full left-0 w-full h-4 bg-transparent" />
             <div className="flex items-center bg-white border border-neutral-200 shadow-xl rounded-md p-1 gap-0.5">
                <div className="flex items-center gap-0.5 border-r border-neutral-100 pr-1 mr-1">
                  <ToolbarButton active={block.calloutType === 'info'} onClick={() => updateBlockFormatting(block.id, { calloutType: 'info' })} title="Info"><Info className="h-3.5 w-3.5 text-blue-500" /></ToolbarButton>
                  <ToolbarButton active={block.calloutType === 'warning'} onClick={() => updateBlockFormatting(block.id, { calloutType: 'warning' })} title="Warning"><ChevronDownIcon className="h-3.5 w-3.5 text-orange-500" /></ToolbarButton>
                  <ToolbarButton active={block.calloutType === 'success'} onClick={() => updateBlockFormatting(block.id, { calloutType: 'success' })} title="Success"><Check className="h-3.5 w-3.5 text-green-500" /></ToolbarButton>
                  <ToolbarButton active={block.calloutType === 'error'} onClick={() => updateBlockFormatting(block.id, { calloutType: 'error' })} title="Error"><Trash2 className="h-3.5 w-3.5 text-red-500" /></ToolbarButton>
                </div>
                <ToolbarButton className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteBlock(block.id)}><Trash2 className="h-3.5 w-3.5" /></ToolbarButton>
             </div>
          </div>
        )
      }

      return (
        <div className="absolute -top-12 left-0 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="absolute top-full left-0 w-full h-4 bg-transparent" />
          <div className="flex items-center bg-white border border-neutral-200 shadow-xl rounded-md p-1 gap-0.5">
            <div className="flex items-center gap-0.5 border-r border-neutral-100 pr-1 mr-1">
              <select className="text-[10px] h-7 border-none bg-neutral-50 rounded px-1 outline-none font-medium cursor-pointer max-w-[80px]" value={block.fontFamily || "font-sans"} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => updateBlockFormatting(block.id, { fontFamily: e.target.value })}>
                {(AVAILABLE_FONTS || []).map((f, idx) => <option key={`${f.value}-${idx}`} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-0.5 border-r border-neutral-100 pr-1 mr-1">
              <ToolbarButton active={block.bold} onClick={() => updateBlockFormatting(block.id, { bold: !block.bold })}><Bold className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton active={block.italic} onClick={() => updateBlockFormatting(block.id, { italic: !block.italic })}><Italic className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton active={block.underline} onClick={() => updateBlockFormatting(block.id, { underline: !block.underline })}><Underline className="h-3.5 w-3.5" /></ToolbarButton>
            </div>
            <div className="flex items-center gap-0.5 border-r border-neutral-100 pr-1 mr-1">
              <ToolbarButton active={(block.align === 'left' || !block.align)} onClick={() => updateBlockFormatting(block.id, { align: 'left' })}><AlignLeft className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton active={block.align === 'center'} onClick={() => updateBlockFormatting(block.id, { align: 'center' })}><AlignCenter className="h-3.5 w-3.5" /></ToolbarButton>
              <ToolbarButton active={block.align === 'right'} onClick={() => updateBlockFormatting(block.id, { align: 'right' })}><AlignRight className="h-3.5 w-3.5" /></ToolbarButton>
            </div>
            <div className="flex items-center gap-1 border-r border-neutral-100 pr-1 mr-1">
              <select className="text-[10px] h-7 border-none bg-neutral-50 rounded px-1 outline-none cursor-pointer" value={block.type === 'heading' ? `h${block.level}` : 'p'} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('h')) updateBlockFormatting(block.id, { type: 'heading', level: parseInt(val[1]) as any })
                  else updateBlockFormatting(block.id, { type: 'paragraph' })
                }}>
                <option value="p">P</option><option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option>
              </select>
              <Input type="number" className="w-10 h-7 text-[10px] px-1 border-none bg-neutral-50" value={parseInt(block.fontSize || "16")} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => updateBlockFormatting(block.id, { fontSize: `${e.target.value}px` })} />
            </div>
            <div className="flex items-center gap-1">
              <input type="color" className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer" value={block.color || "#000000"} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => updateBlockFormatting(block.id, { color: e.target.value })} />
              <ToolbarButton className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteBlock(block.id)}><Trash2 className="h-3.5 w-3.5" /></ToolbarButton>
            </div>
          </div>
        </div>
      );
    }

    const renderContent = () => {
      switch (block.type) {
        case "divider": return <hr className="border-neutral-300 w-full" />
        case "spacer": return <div className="w-full relative group/spacer min-h-[10px]" style={{ height: block.height || '40px' }}>{!previewMode && <div className="absolute inset-0 flex items-center justify-center border border-dashed border-neutral-200 opacity-0 group-hover/spacer:opacity-100 transition-opacity"><span className="text-[10px] text-neutral-400 font-mono">Spacer {block.height}</span><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-500 cursor-ns-resize" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); const startY = e.clientY; const startHeight = parseInt(block.height || "40"); const handleMouseMove = (moveE: MouseEvent) => { const deltaY = moveE.clientY - startY; updateBlockFormatting(block.id, { height: `${Math.max(10, startHeight + deltaY)}px` }) }; const handleMouseUp = () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp) }; window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp) }} /></div>}</div>
        case "callout":
          const calloutStyles = { info: "bg-blue-50 border-blue-200 text-blue-800", warning: "bg-orange-50 border-orange-200 text-orange-800", success: "bg-green-50 border-green-200 text-green-800", error: "bg-red-50 border-red-200 text-red-800" }
          const CalloutIcon = block.calloutType === 'success' ? Check : block.calloutType === 'warning' ? ChevronDownIcon : block.calloutType === 'error' ? Trash2 : Info;
          return (
            <div className={cn("p-4 rounded-lg border flex gap-3 w-full", calloutStyles[block.calloutType as keyof typeof calloutStyles] || calloutStyles.info)}>
              <CalloutIcon className="h-5 w-5 shrink-0 mt-0.5 opacity-80" />
              <div contentEditable={!previewMode} suppressContentEditableWarning className="outline-none flex-1 text-sm font-medium" onBlur={(e: any) => updateBlockFormatting(block.id, { content: e.currentTarget.textContent || "" })}>{block.content}</div>
            </div>
          )
        case "video":
          const ytId = block.videoUrl ? getYoutubeId(block.videoUrl) : null;
          const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null;
          return (
            <div className={cn("space-y-2 flex flex-col relative", block.align === 'center' ? "items-center" : block.align === 'right' ? "items-end" : "items-start", block.x !== undefined ? "w-auto" : "w-full")}>
              {block.videoUrl ? (
                <div className={cn("relative group/video outline-none aspect-video bg-neutral-900 rounded overflow-hidden shadow-inner", block.x !== undefined ? "cursor-move" : "", isFocused && "ring-2 ring-blue-500 ring-offset-2")} style={{ width: block.width || '100%', maxWidth: '100%' }} onClick={() => setFocusedBlockId(block.id)} tabIndex={0}>
                  {previewMode ? <iframe src={block.videoUrl} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> :
                    <div className="w-full h-full relative group">
                       {thumbnailUrl ? <img src={thumbnailUrl} className="w-full h-full object-cover opacity-80" alt="Video Thumbnail" /> : <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800"><Video className="h-12 w-12 text-neutral-600 mb-2" /><span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Video Embed</span></div>}
                       <div className="absolute inset-0 flex items-center justify-center"><div className="w-16 h-12 bg-red-600/90 rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-colors shadow-lg"><div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" /></div></div>
                    </div>
                  }
                  {!previewMode && (isFocused || isHovered) && <div className="absolute inset-0 bg-black/10 flex items-center justify-center cursor-move z-10"><GripVertical className="h-8 w-8 text-white opacity-50" /></div>}
                </div>
              ) : <div className="bg-neutral-100 border-2 border-dashed border-neutral-300 p-8 flex flex-col items-center justify-center rounded w-full cursor-pointer hover:bg-neutral-200/50 transition-colors" onClick={() => setVideoSourceBlockId(block.id)}><Video className="h-8 w-8 text-neutral-400 mb-2" /><span className="text-xs text-neutral-500">Click to add Video URL</span></div>}
            </div>
          )
        case "gallery":
          return (
            <div className="flex flex-wrap gap-3 w-full items-start">
              {(block.galleryItems || []).map((item, idx) => (
                <div key={idx} draggable={!previewMode} onDragStart={(e) => { e.dataTransfer.setData("galleryIdx", idx.toString()); e.dataTransfer.setData("parentBlockId", block.id) }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const fromIdx = parseInt(e.dataTransfer.getData("galleryIdx")); const parentId = e.dataTransfer.getData("parentBlockId"); if (parentId !== block.id || fromIdx === idx) return; const newGalleryItems = [...(block.galleryItems || [])]; const [removed] = newGalleryItems.splice(fromIdx, 1); newGalleryItems.splice(idx, 0, removed); updateBlockFormatting(block.id, { galleryItems: newGalleryItems }) }} className="relative group/gal-img outline-none" style={{ width: item.width || '200px', height: item.height || '150px' }}>
                  <img src={item.url} className="w-full h-full object-cover rounded shadow-sm border border-neutral-100" />
                  {!previewMode && <>
                      <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover/gal-img:opacity-100 transition-opacity shadow-lg z-20" onClick={() => { const newGalleryItems = (block.galleryItems || []).filter((_, i) => i !== idx); updateBlockFormatting(block.id, { galleryItems: newGalleryItems }) }}><Trash2 className="h-3 w-3" /></Button>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-600 border border-white translate-x-1/2 translate-y-1/2 shadow-sm z-10 cursor-nwse-resize opacity-0 group-hover/gal-img:opacity-100" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); const container = e.currentTarget.parentElement as HTMLElement; setResizing({ id: block.id, galleryIdx: idx, startX: e.clientX, startY: e.clientY, startWidth: container.offsetWidth, startHeight: container.offsetHeight, handle: 'br' }) }} />
                  </>}
                </div>
              ))}
              {!previewMode && <div className="w-[150px] h-[150px] bg-neutral-50 border-2 border-dashed border-neutral-200 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-blue-500" onClick={() => setImageSourceBlockId(block.id)}><Plus className="h-6 w-6 mb-1" /><span className="text-[10px] font-medium">Add Image</span></div>}
            </div>
          )
        case "image":
          return (
            <div className={cn("space-y-2 flex flex-col relative", block.align === 'center' ? "items-center" : block.align === 'right' ? "items-end" : "items-start", block.x !== undefined ? "w-auto" : "w-full")}>
              {block.imageUrl ? (
                <div className={cn("relative group/image outline-none transition-shadow", block.x !== undefined ? "cursor-move" : "", isFocused && "ring-2 ring-blue-500 ring-offset-2 rounded")} style={{ width: block.width || 'fit-content', maxWidth: '100%', height: block.height || 'auto' }} onClick={() => setFocusedBlockId(block.id)} onMouseDown={(e) => { if (block.x !== undefined && !resizing) { e.preventDefault(); setMoving({ id: block.id, startX: e.clientX, startY: e.clientY, initialX: block.x || 0, initialY: block.y || 0 }); document.body.style.cursor = 'move' } }} tabIndex={0}>
                  <img src={block.imageUrl} alt={block.imageCaption || ""} className="w-full h-full rounded shadow-sm object-contain" />
                  {!previewMode && (isFocused || isHovered) && <>
                      <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-blue-600 border border-white -translate-x-1/2 -translate-y-1/2 shadow-sm z-10 cursor-nwse-resize" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); const img = e.currentTarget.parentElement as HTMLElement; setResizing({ id: block.id, startX: e.clientX, startY: e.clientY, startWidth: img.offsetWidth, startHeight: img.offsetHeight, handle: 'tl' }) }} />
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-600 border border-white translate-x-1/2 -translate-y-1/2 shadow-sm z-10 cursor-nesw-resize" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); const img = e.currentTarget.parentElement as HTMLElement; setResizing({ id: block.id, startX: e.clientX, startY: e.clientY, startWidth: img.offsetWidth, startHeight: img.offsetHeight, handle: 'tr' }) }} />
                      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-blue-600 border border-white -translate-x-1/2 translate-y-1/2 shadow-sm z-10 cursor-nesw-resize" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); const img = e.currentTarget.parentElement as HTMLElement; setResizing({ id: block.id, startX: e.clientX, startY: e.clientY, startWidth: img.offsetWidth, startHeight: img.offsetHeight, handle: 'bl' }) }} />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-600 border border-white translate-x-1/2 translate-y-1/2 shadow-sm z-10 cursor-nwse-resize" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); const img = e.currentTarget.parentElement as HTMLElement; setResizing({ id: block.id, startX: e.clientX, startY: e.clientY, startWidth: img.offsetWidth, startHeight: img.offsetHeight, handle: 'br' }) }} />
                  </>}
                </div>
              ) : <div className="bg-neutral-100 border-2 border-dashed border-neutral-300 p-8 flex flex-col items-center justify-center rounded w-full cursor-pointer hover:bg-neutral-200/50 transition-colors" onClick={() => setImageSourceBlockId(block.id)}><ImageIcon className="h-8 w-8 text-neutral-400 mb-2" /><span className="text-xs text-neutral-500">Click to add image URL</span></div>}
              {block.imageUrl && <div contentEditable={!previewMode} suppressContentEditableWarning className="text-sm text-center text-neutral-500 italic outline-none w-full" onBlur={(e: any) => updateBlockFormatting(block.id, { imageCaption: e.currentTarget.textContent || "" })}>{block.imageCaption || "Click to add caption"}</div>}
            </div>
          )
        case "list":
          const ListTag = block.listType === "ordered" ? "ol" : "ul"
          return (
            <ListTag className={cn("outline-none w-full pl-6", block.listType === "ordered" ? "list-decimal" : "list-disc")}>
              {(block.items || [""]).map((item, idx) => (
                <li key={idx} contentEditable={!previewMode} suppressContentEditableWarning className="outline-none" onBlur={(e: any) => { const newItems = [...(block.items || [""])]; newItems[idx] = e.currentTarget.textContent || ""; updateBlockFormatting(block.id, { items: newItems }) }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const newItems = [...(block.items || [""])]; newItems.splice(idx + 1, 0, ""); updateBlockFormatting(block.id, { items: newItems }); setTimeout(() => { const nextItem = e.currentTarget.nextElementSibling as HTMLElement; nextItem?.focus() }, 0) } else if (e.key === 'Backspace' && !item && (block.items?.length || 0) > 1) { e.preventDefault(); const newItems = (block.items || []).filter((_, i) => i !== idx); updateBlockFormatting(block.id, { items: newItems }); setTimeout(() => { const prevItem = e.currentTarget.previousElementSibling as HTMLElement; prevItem?.focus() }, 0) } }}>{item}</li>
              ))}
            </ListTag>
          )
        case "quote": return <blockquote className="border-l-4 border-neutral-300 pl-4 italic text-neutral-600 w-full"><div contentEditable={!previewMode} suppressContentEditableWarning className="outline-none" onBlur={(e: any) => updateBlockFormatting(block.id, { content: e.currentTarget.textContent || "" })}>{block.content || "Enter quote..."}</div></blockquote>
        case "table":
          return (
            <div className="overflow-x-auto w-full my-2">
              <table className="border-collapse border border-neutral-400 w-full text-sm shadow-sm">
                <tbody>
                  {(block.tableData || [["Header"]]).map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx === 0 ? "bg-neutral-50 font-bold" : ""}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="border border-neutral-300 p-3 outline-none min-w-[80px] hover:bg-blue-50/30 transition-colors" contentEditable={!previewMode} suppressContentEditableWarning onBlur={(e: any) => { const newData = (block.tableData || [[]]).map(r => [...r]); newData[rIdx][cIdx] = e.currentTarget.textContent || ""; updateBlockFormatting(block.id, { tableData: newData }) }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        default:
          const Tag = block.type === "heading" ? (`h${block.level || 1}` as any) : "p"
          return (
            <Tag contentEditable={!previewMode} suppressContentEditableWarning data-block-id={block.id} style={style} className={cn("outline-none min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-300 w-full", block.fontFamily || "font-sans", block.type === "heading" && "font-bold tracking-tight mb-2 mt-4")} data-placeholder={block.type === "heading" ? "Heading" : ""} onFocus={() => setFocusedBlockId(block.id)} onBlur={(e: any) => handleBlur(block.id, e.currentTarget.textContent || "")} onKeyDown={(e: any) => handleKeyDown(e, block)}>{block.content}</Tag>
          )
      }
    }
    
    const isFloated = block.float && block.float !== 'none';
    return (
      <div key={block.id} data-block-id={block.id} draggable={!previewMode} onMouseEnter={() => setHoveredBlockId(block.id)} onMouseLeave={() => setHoveredBlockId(null)} onClick={(e) => e.stopPropagation()} onDragStart={(e) => { setDraggedBlockId(block.id); e.dataTransfer.setData("blockId", block.id) }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const draggedId = e.dataTransfer.getData("blockId"); if (!draggedId || draggedId === block.id) return; const draggedIdx = htmlBlocks.findIndex(b => b.id === draggedId); const targetIdx = htmlBlocks.findIndex(b => b.id === block.id); const newBlocks = [...htmlBlocks]; const [dragged] = newBlocks.splice(draggedIdx, 1); newBlocks.splice(targetIdx, 0, dragged); setHtmlBlocks(newBlocks.map((b, i) => ({ ...b, order: i }))); setDraggedBlockId(null) }} className={cn("relative group transition-all duration-200 py-2 px-2 border border-transparent rounded-sm break-inside-avoid", !isFloated && "flex items-start", (isHovered || isFocused) && !previewMode && "border-dashed border-blue-400 bg-blue-50/20 z-30", draggedBlockId === block.id && "opacity-10 scale-95", isFloated && "z-20")} style={{ ...(isFloated && { float: block.float as any, width: block.width || '300px', marginRight: block.float === 'left' ? '24px' : '0', marginLeft: block.float === 'right' ? '24px' : '0', marginBottom: '12px' }), ...(block.x !== undefined && { position: 'absolute', left: `${block.x}px`, top: `${block.y}px`, zIndex: isFocused ? 40 : 30, width: block.width || '300px' }) }}>
        {renderFloatingToolbar()}
        {!previewMode && <div className={cn("absolute -left-10 top-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1.5 text-neutral-300 hover:text-blue-500 transition-all", isFloated && "-left-8")}><GripVertical className="h-4 w-4" /></div>}
        <div className={cn("w-full", !isFloated && "flex-1")}>{renderContent()}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#f3f2f1] font-sans text-neutral-900 overflow-hidden">
      <div className="bg-white border-b border-neutral-200 h-14 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-neutral-600"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <div className="h-6 w-[1px] bg-neutral-200" /><h1 className="text-lg font-semibold text-neutral-800">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)} className="text-neutral-600"><Eye className="h-4 w-4 mr-2" />{previewMode ? "Edit" : "Preview"}</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className={cn("shadow-sm transition-all", showSaved ? "bg-green-600 hover:bg-green-700" : "bg-[#2b579a] hover:bg-[#1e3e6d]")}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : showSaved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}{isSaving ? "Saving..." : showSaved ? "Saved" : "Save Changes"}</Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {!previewMode && (
          <div className="w-56 bg-neutral-100 border-r border-neutral-200 overflow-y-auto p-4 space-y-4 shrink-0 scrollbar-thin scrollbar-thumb-neutral-300">
             <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 mb-4">Pages</h3>
             <div className="flex flex-col gap-4 items-center">
                {Array.from({ length: pageCount }).map((_, i) => (
                   <div key={i} className={cn("group relative cursor-pointer transition-all duration-200", activePage === i + 1 ? "scale-105" : "hover:scale-102")} onClick={() => scrollToPage(i + 1)}>
                      {!previewMode && pageCount > 1 && <Button variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5 opacity-0 group-hover:opacity-100 z-50 shadow-md transition-opacity" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Are you sure you want to delete Page ${i + 1}?`)) handleDeletePage(i + 1) }}><Trash2 className="h-3 w-3" /></Button>}
                      <div className={cn("w-36 aspect-[1/1.41] bg-white shadow-sm border rounded-sm flex flex-col items-center justify-center relative overflow-hidden", activePage === i + 1 ? "border-[#2b579a] ring-2 ring-[#2b579a]/20 shadow-md" : "border-neutral-200 group-hover:border-neutral-300")}><div className="w-full h-full p-2 space-y-1 opacity-20 pointer-events-none"><div className="h-2 w-3/4 bg-neutral-200 rounded-full" /><div className="h-1 w-full bg-neutral-100 rounded-full" /><div className="h-1 w-full bg-neutral-100 rounded-full" /><div className="h-12 w-full bg-neutral-50 rounded mt-2" /><div className="h-1 w-2/3 bg-neutral-100 rounded-full mt-2" /></div><div className={cn("absolute bottom-1 right-1 text-[8px] font-bold px-1 rounded", activePage === i + 1 ? "bg-[#2b579a] text-white" : "bg-neutral-100 text-neutral-400")}>{i + 1}</div></div><span className={cn("block text-center mt-1.5 text-[10px] font-medium transition-colors", activePage === i + 1 ? "text-[#2b579a]" : "text-neutral-500")}>Page {i + 1}</span>
                   </div>
                ))}
             </div>
             <div className="pt-4 flex justify-center"><Button variant="outline" size="sm" className="w-36 h-10 border-dashed border-neutral-300 text-neutral-400 hover:text-[#2b579a] hover:border-[#2b579a] hover:bg-blue-50/50 group/add" onClick={handleAddPage}><Plus className="h-4 w-4 mr-2 transition-transform group-hover/add:rotate-90" /><span className="text-[10px] font-bold uppercase tracking-wider">Add Page</span></Button></div>
          </div>
        )}
        <div ref={workspaceRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-12 pb-96 flex flex-col items-center bg-[#e6e6e6] scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-transparent">
          <div style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top center', width: '816px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div ref={contentRef} className="absolute opacity-0 pointer-events-none" style={{ width: '816px', padding: '96px 96px 128px 96px' }}>
              <div className="space-y-0 relative clearfix after:content-[''] after:table after:clear-both">
                {htmlBlocks.sort((a, b) => a.order - b.order).map(block => (<div key={`m-${block.id}`} style={{ breakInside: 'avoid' }}>{renderBlock(block)}</div>))}
              </div>
            </div>
            {Array.from({ length: pageCount }).map((_, i) => (
              <div key={i} className={cn("relative bg-white shrink-0 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.12)] transition-shadow", previewMode ? "shadow-md" : "border border-neutral-300")} style={{ height: `${PAGE_HEIGHT}px`, width: '816px' }}>
                <div className="absolute inset-0 z-10 w-full" onClick={handleWorkspaceClick} style={{ padding: '96px 96px 128px 96px', transform: `translateY(-${i * PAGE_HEIGHT}px)`, height: 'auto' }}>
                  <div className="space-y-0 relative clearfix after:content-[''] after:table after:clear-both">{htmlBlocks.sort((a, b) => a.order - b.order).map(block => renderBlock(block))}</div>
                </div>
                {!previewMode && <div className="absolute top-4 right-6 text-[10px] font-bold text-neutral-200 uppercase tracking-widest z-0 pointer-events-none select-none">Page {i + 1}</div>}
              </div>
            ))}
          </div>
        </div>
        {!previewMode && (
          <div className="w-80 bg-white border-l border-neutral-200 overflow-y-auto p-6 space-y-6 shrink-0">
            <Card><CardHeader className="p-4"><CardTitle className="text-sm font-bold">Basic Information</CardTitle></CardHeader><CardContent className="p-4 pt-0 space-y-4"><div><Label className="text-xs uppercase text-neutral-500 font-bold tracking-wider">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter document title" className="mt-1 h-8 text-sm" /></div><div><Label className="text-xs uppercase text-neutral-500 font-bold tracking-wider">Product ID</Label><Input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Enter product ID" className="mt-1 h-8 text-sm" /></div><div><Label className="text-xs uppercase text-neutral-500 font-bold tracking-wider">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={3} className="mt-1 text-sm resize-none" /></div></CardContent></Card>
            <GalleryUpload gallery={gallery} onGalleryUpdate={setGallery} />
            <Card><CardHeader className="p-4"><CardTitle className="text-sm font-bold">Add Content Block</CardTitle></CardHeader><CardContent className="p-4 pt-0 space-y-2">{BLOCK_TYPES.map((blockType) => { const IconComponent = blockType.icon; return (<Button key={blockType.type} variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all" onClick={() => addNewBlock(blockType.type)}><IconComponent className="h-4 w-4 mr-3 text-neutral-500" /><div className="text-left"><div className="font-medium text-xs">{blockType.label}</div><div className="text-[10px] text-muted-foreground leading-tight">{blockType.description}</div></div></Button>) })}</CardContent></Card>
            <Card><CardHeader className="p-4 text-neutral-500"><div className="flex justify-between items-center"><CardTitle className="text-sm font-bold">Document Info</CardTitle><FileText className="h-4 w-4" /></div></CardHeader><CardContent className="p-4 pt-0 space-y-2"><div className="flex justify-between text-xs"><span className="text-neutral-600">Total Pages:</span><span className="font-bold">{pageCount}</span></div><div className="flex justify-between text-xs"><span className="text-neutral-600">A4 Dimensions:</span><span className="font-bold">210 x 297 mm</span></div></CardContent></Card>
            <div className="pt-4 border-t border-neutral-100"><div className="flex items-center justify-between text-xs text-neutral-500 mb-2"><span>Zoom</span><span className="font-bold">{zoom}%</span></div><div className="flex items-center gap-3"><button onClick={() => setZoom(Math.max(50, zoom - 10))} className="h-6 w-6 rounded border border-neutral-200 flex items-center justify-center hover:bg-neutral-50">-</button><div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden relative"><div className="absolute top-0 left-0 h-full bg-[#2b579a]" style={{ width: `${(zoom - 50) / 1.5}%` }} /></div><button onClick={() => setZoom(Math.min(200, zoom + 10))} className="h-6 w-6 rounded border border-neutral-200 flex items-center justify-center hover:bg-neutral-50">+</button></div></div>
          </div>
        )}
      </div>
      <Dialog open={!!videoSourceBlockId} onOpenChange={() => setVideoSourceBlockId(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Embed Video</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Video Embed URL</Label><Input placeholder="https://www.youtube.com/embed/..." value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setVideoSourceBlockId(null)}>Cancel</Button><Button onClick={() => { if (videoSourceBlockId && videoUrlInput) { updateBlockFormatting(videoSourceBlockId, { videoUrl: videoUrlInput }); setVideoSourceBlockId(null); setVideoUrlInput("") } }}>Embed Video</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={!!imageSourceBlockId} onOpenChange={() => setImageSourceBlockId(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Add Image from URL</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Image URL</Label><Input placeholder="https://images.unsplash.com/..." value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setImageSourceBlockId(null)}>Cancel</Button><Button onClick={() => { if (imageSourceBlockId && imageUrlInput) { const block = htmlBlocks.find(b => b.id === imageSourceBlockId); if (block?.type === 'gallery') { const newGalleryItems = [...(block.galleryItems || []), { url: imageUrlInput, width: '200px', height: '150px', order: (block.galleryItems || []).length }]; updateBlockFormatting(imageSourceBlockId, { galleryItems: newGalleryItems }) } else { updateBlockFormatting(imageSourceBlockId, { imageUrl: imageUrlInput }) }; setImageSourceBlockId(null); setImageUrlInput("") } }}>Add Image</Button></DialogFooter></DialogContent></Dialog>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville&family=Roboto:wght@300;400;700&family=Playfair+Display:wght@700&display=swap');
        [contenteditable]:focus { outline: none; }
        .font-sans { font-family: 'Segoe UI', 'Calibri', 'Arial', sans-serif; }
        .font-serif { font-family: 'Times New Roman', 'Georgia', serif; }
        .font-mono { font-family: 'Courier New', Courier, monospace; }
        @media print {
          .bg-[#f3f2f1], .bg-[#e6e6e6], .w-80, .h-14, .absolute.inset-0 { display: none !important; }
          .flex-1 { overflow: visible !important; padding: 0 !important; }
          .relative { box-shadow: none !important; border: none !important; width: 100% !important; zoom: 1 !important; }
        }
      `}</style>
    </div>
  )
}
