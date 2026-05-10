import { Type, List, Image as ImageIcon, Minus, Quote, Table, Info, MoveVertical, Layout, Video } from "lucide-react"

export const BLOCK_TYPES = [
  { type: "heading", label: "Heading", icon: Type, description: "Add a heading (H1-H6)" },
  { type: "paragraph", label: "Paragraph", icon: Type, description: "Add a text paragraph" },
  { type: "list", label: "List", icon: List, description: "Add ordered or unordered list" },
  { type: "image", label: "Image", icon: ImageIcon, description: "Add an image with caption" },
  { type: "gallery", label: "Gallery", icon: Layout, description: "Add multiple images in a row" },
  { type: "video", label: "Video", icon: Video, description: "Embed a YouTube or Vimeo video" },
  { type: "callout", label: "Callout", icon: Info, description: "Add an information or note box" },
  { type: "spacer", label: "Spacer", icon: MoveVertical, description: "Add vertical space between blocks" },
  { type: "divider", label: "Divider", icon: Minus, description: "Add a horizontal line" },
  { type: "quote", label: "Quote", icon: Quote, description: "Add a blockquote" },
  { type: "table", label: "Table", icon: Table, description: "Add a simple table" },
] as const

export const AVAILABLE_FONTS = [
  { label: "Calibri", value: "font-sans" },
  { label: "Arial", value: "font-sans font-normal" },
  { label: "Times New Roman", value: "font-serif" },
  { label: "Courier New", value: "font-mono" },
  { label: "Georgia", value: "font-serif font-light" },
]

export const AVAILABLE_COLORS = [
  { label: "Automatic", value: "#000000" },
  { label: "Dark Red", value: "#C00000" },
  { label: "Red", value: "#FF0000" },
  { label: "Orange", value: "#FFC000" },
  { label: "Yellow", value: "#FFFF00" },
  { label: "Light Green", value: "#92D050" },
  { label: "Green", value: "#00B050" },
  { label: "Light Blue", value: "#00B0F0" },
  { label: "Blue", value: "#0070C0" },
  { label: "Dark Blue", value: "#002060" },
  { label: "Purple", value: "#7030A0" },
]
