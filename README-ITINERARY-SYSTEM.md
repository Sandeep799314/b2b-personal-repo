# Itinerary Management System

## Overview
The itinerary system provides a comprehensive solution for travel agents to create, manage, and customize travel itineraries for their clients. It features a drag-and-drop builder, library integration, and database persistence.

## Features

### 1. Itinerary Listing Page
- **Location**: `/itinerary`
- **Purpose**: Shows all saved itineraries with filtering and search capabilities
- **Features**:
  - Grid view of all itineraries
  - Status badges (Draft, Published, Archived)
  - Quick actions (View, Edit, Delete, Duplicate)
  - Sample data included for demonstration

### 2. Drag-and-Drop Itinerary Builder
- **Location**: `/itinerary?mode=create` or `/itinerary?mode=edit&id={id}`
- **Purpose**: State-of-the-art itinerary builder with drag-and-drop functionality
- **Features**:
  - Native HTML5 drag-and-drop (React 19 compatible)
  - Add/remove days dynamically
  - Drag events between days
  - Library integration for adding pre-saved items
  - Real-time preview mode
  - Auto-save functionality

### 3. Itinerary Viewer
- **Location**: `/itinerary?id={id}&mode=view`
- **Purpose**: Read-only view of completed itineraries
- **Features**:
  - Detailed day-by-day breakdown
  - Event timeline view
  - Pricing information
  - Export and sharing options

### 4. Library Integration
- **Purpose**: Use saved library items in itineraries
- **Features**:
  - Browse personal library items
  - Drag items from library to itinerary days
  - Automatic event creation from library items
  - Category-based filtering

## Database Schema

### Itinerary Model
\`\`\`typescript
interface IItinerary {
  _id?: string
  title: string
  description: string
  destination: string
  duration: string
  totalPrice: number
  currency: string
  status: 'draft' | 'published' | 'archived'
  createdBy: string
  createdAt: Date
  updatedAt: Date
  days: IItineraryDay[]
  highlights: string[]
  images: string[]
}
\`\`\`

### Itinerary Day Model
\`\`\`typescript
interface IItineraryDay {
  day: number
  date: string
  title: string
  events: IItineraryEvent[]
}
\`\`\`

### Itinerary Event Model
\`\`\`typescript
interface IItineraryEvent {
  id: string
  time: string
  category: 'flight' | 'hotel' | 'activity' | 'transfer' | 'meal' | 'other'
  title: string
  description: string
  location?: string
  inclusions: string[]
  price: number
  duration?: string
  libraryItemId?: string
}
\`\`\`

## API Endpoints

### Itineraries
- `GET /api/itineraries` - Get all itineraries
- `POST /api/itineraries` - Create new itinerary
- `GET /api/itineraries/[id]` - Get specific itinerary
- `PUT /api/itineraries/[id]` - Update itinerary
- `DELETE /api/itineraries/[id]` - Delete itinerary

## Components

### Core Components
1. **ItineraryList** - Main listing page with grid view
2. **DragDropBuilder** - Drag-and-drop itinerary builder
3. **ItineraryBuilder** - Read-only viewer (existing component)
4. **CreateItineraryModal** - Quick creation modal

### Supporting Components
- **EventCard** - Individual event display with drag handles
- **LibraryItem** - Library item display for selection
- **PricingPanel** - Real-time pricing calculations

## Usage Instructions

### For Agents
1. **Creating New Itinerary**:
   - Click "Create New Itinerary" button
   - Fill in basic details (title, destination, duration)
   - Use the drag-and-drop builder to add events
   - Save and publish when ready

2. **Using Library Items**:
   - Click "Add Event" on any day
   - Browse library items by category
   - Click to add items to the day
   - Customize event details as needed

3. **Managing Itineraries**:
   - View all itineraries on the main page
   - Filter by status (Draft, Published, Archived)
   - Edit existing itineraries
   - Duplicate successful itineraries for reuse

### For Clients
- Agents can share read-only itinerary views
- Clients see detailed day-by-day breakdown
- Pricing and inclusions clearly displayed
- Export options for offline viewing

## Technical Implementation

### Drag-and-Drop
- Uses native HTML5 drag-and-drop API
- Compatible with React 19
- Visual feedback during drag operations
- Supports reordering within days and moving between days

### State Management
- React hooks for local state
- Custom hooks for API integration
- Real-time updates and persistence

### Database Integration
- MongoDB with Mongoose ODM
- Automatic timestamps
- Validation and error handling
- Sample data seeding script

## Setup Instructions

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Seed Sample Data**:
   \`\`\`bash
   npm run seed:itineraries
   \`\`\`

3. **Start Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access Itinerary System**:
   - Navigate to `/itinerary` to see the listing page
   - Click "Create New Itinerary" to start building

## Future Enhancements

1. **Advanced Features**:
   - Collaborative editing
   - Version history
   - Template system
   - Bulk operations

2. **Integration**:
   - Calendar integration
   - Payment processing
   - Email notifications
   - Mobile app support

3. **Analytics**:
   - Usage tracking
   - Popular destinations
   - Conversion metrics
   - Client feedback integration
