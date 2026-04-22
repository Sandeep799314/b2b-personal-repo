# Itinerary Flow Categorization - Implementation Guide

## Overview
The itinerary system has been enhanced to support four distinct types of itinerary flows, each tailored for different use cases in the travel B2B platform.

## Four Itinerary Types

### 1. Fixed Group Tours
**Purpose**: Tours with predetermined dates and fixed group sizes
**Features**:
- Fixed start and end dates
- Maximum participant limits
- Current booking tracking
- Alternative available dates
- Booking progress visualization
- Group size management

**Key Fields**:
- `fixedDates.startDate` - Tour start date
- `fixedDates.endDate` - Tour end date  
- `fixedDates.maxParticipants` - Maximum group size
- `fixedDates.currentBookings` - Current bookings count
- `fixedDates.availableDates[]` - Alternative tour dates

**Use Case**: Group tours to popular destinations with fixed departure dates

### 2. Customized Package (Default)
**Purpose**: Traditional day-by-day itinerary building
**Features**: 
- Day-by-day itinerary structure
- Drag-and-drop builder
- Event management per day
- Library integration
- Detailed event information

**Use Case**: Custom tailored itineraries for individual clients

### 3. Build a Cart/Combo  
**Purpose**: Individual service items without specific dates
**Features**:
- Individual item management (hotels, flights, activities, etc.)
- No date constraints
- Quantity-based pricing
- Category-wise organization
- Product ID generation for each item

**Key Fields**:
- `cartItems[]` - Array of individual items
- `cartItems[].name` - Item name
- `cartItems[].productId` - Unique product identifier
- `cartItems[].description` - Item description
- `cartItems[].category` - Item type (activity, hotel, flight, etc.)
- `cartItems[].price` - Item price
- `cartItems[].quantity` - Item quantity
- `cartItems[].nights` - Number of nights (hotels only)

**Use Case**: A la carte service selections, modular packages

### 4. HTML Text Editor
**Purpose**: Block-based rich content creation  
**Features**:
- HTML block-based editor
- Rich text components (headings, paragraphs, lists, images)
- Drag and reorder blocks
- Live preview mode
- Export to HTML

**Key Fields**:
- `htmlBlocks[]` - Array of content blocks
- `htmlBlocks[].type` - Block type (heading, paragraph, list, image, etc.)
- `htmlBlocks[].content` - Block content
- `htmlBlocks[].order` - Display order
- `htmlContent` - Generated HTML output

**Block Types Available**:
- Headings (H1-H6)
- Paragraphs  
- Ordered/Unordered Lists
- Images with captions
- Dividers
- Blockquotes
- Tables

**Use Case**: Marketing materials, detailed destination guides, custom presentations

## Data Model Updates

### Itinerary Schema Changes
```typescript
interface IItinerary {
  // ... existing fields
  type: "fixed-group-tour" | "customized-package" | "cart-combo" | "html-editor"
  lastUpdatedBy?: string
  
  // Fixed Group Tour fields
  fixedDates?: {
    startDate: string
    endDate: string
    availableDates: string[]
    maxParticipants?: number
    currentBookings?: number
  }
  
  // Cart/Combo fields
  cartItems?: ICartItem[]
  
  // HTML Editor fields
  htmlContent?: string
  htmlBlocks?: IHtmlBlock[]
}
```

### New Interfaces
```typescript
interface ICartItem {
  id: string
  productId: string
  name: string
  description: string
  category: "activity" | "hotel" | "flight" | "transfer" | "meal" | "other"
  price: number
  nights?: number
  quantity: number
  addedAt: Date
}

interface IHtmlBlock {
  id: string
  type: "heading" | "paragraph" | "list" | "image" | "divider" | "quote" | "table"
  content: string
  level?: number
  listType?: "ordered" | "unordered"
  items?: string[]
  imageUrl?: string
  imageCaption?: string
  order: number
  createdAt: Date
}
```

## Creator & Timestamp Tracking

All itinerary types now track:
- `createdBy` - Original creator
- `lastUpdatedBy` - Last person to modify  
- `createdAt` - Creation timestamp
- `updatedAt` - Last modification timestamp
- Date format: DD-MMM-YY display format

## Component Architecture

### New Components Created:
1. **`FixedGroupTourBuilder.tsx`** - Fixed group tour management
2. **`CartComboBuilder.tsx`** - Cart/combo item management  
3. **`HtmlEditorBuilder.tsx`** - Block-based HTML editor
4. **Enhanced `ItinerarySetupModal.tsx`** - Type selection during creation

### Updated Components:
1. **`ItineraryList.tsx`** - Shows type badges and type-specific information
2. **`app/itinerary/page.tsx`** - Routing based on itinerary type
3. **`app/itinerary/builder/page.tsx`** - Component routing logic

## Usage Instructions

### Creating New Itineraries:
1. Click "Create New" in itinerary list
2. Select itinerary type from modal
3. Fill type-specific information
4. Click "Create Itinerary" 
5. System routes to appropriate builder

### Type-Specific Workflows:

**Fixed Group Tours:**
- Set fixed start/end dates
- Define maximum participants
- Add alternative tour dates
- Track current bookings
- Monitor booking progress

**Customized Package:**  
- Build day-by-day itinerary
- Use drag-and-drop interface
- Add events from library
- Customize event details

**Cart/Combo:**
- Add individual service items
- Set quantities and pricing
- Organize by categories
- No date restrictions

**HTML Editor:**
- Add content blocks sequentially
- Use rich text components
- Preview rendered output
- Export HTML content

## API Compatibility

All existing API endpoints remain compatible. New fields are optional and backward compatible. The system gracefully handles itineraries without type specification (defaults to "customized-package").

## Benefits

1. **Specialized Workflows**: Each type optimized for its specific use case
2. **Improved UX**: Type-appropriate interfaces and features  
3. **Better Organization**: Clear categorization in itinerary listings
4. **Flexible Pricing**: Different pricing models per type
5. **Enhanced Tracking**: Detailed metadata and user tracking
6. **Professional Output**: HTML editor for marketing materials

## Future Enhancements

- Role-based permissions per itinerary type
- Advanced booking management for group tours
- Template library for HTML blocks
- Integration with external booking systems
- Advanced reporting per itinerary type
