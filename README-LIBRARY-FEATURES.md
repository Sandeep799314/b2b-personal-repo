# Library Management System - New Features

## Overview
The library management system has been enhanced with new sections and functionality to provide better organization and customization options.

## New Features

### 1. Organized Sections
The library item form is now organized into clear sections:

#### Left Column - Details Section
- **Basic Information**: Title and description
- **Details**: Provider and confirmation number
- **Pricing**: Price and currency (separate section)
- **Availability**: Date ranges, status, and capacity management

#### Right Column
- **Category-specific Details**: Fields specific to each category
- **Extra Fields**: Custom fields that customers can add
- **Media Upload**: File upload functionality

### 2. Extra Fields Functionality
- **Add Custom Fields**: Customers can add unlimited custom fields with name-value pairs
- **Dynamic Storage**: Extra fields are stored in JSON format in the database
- **Easy Management**: Add/remove extra fields with simple UI
- **Display**: Extra fields are shown in library item cards (first 2 fields with "more" indicator)

### 3. Availability Section
New availability management features:
- **Date Range**: Available from/to dates
- **Status**: Available, Limited, or Unavailable
- **Capacity Management**: Maximum capacity and current bookings tracking
- **Visual Indicators**: Status badges and booking counters in library cards

### 4. Enhanced Pricing Section
- Dedicated pricing section separate from other details
- Currency selection (USD, SGD, EUR)
- Clear price display in library cards

## Database Changes

### New Columns Added:
\`\`\`sql
-- Availability section
available_from DATE
available_to DATE
availability_status VARCHAR(20) DEFAULT 'available'
max_capacity INTEGER
current_bookings INTEGER DEFAULT 0

-- Extra custom fields
extra_fields JSONB DEFAULT '{}'

-- Media URLs (if not exists)
media_urls TEXT[] DEFAULT '{}'
\`\`\`

## Migration

To update your existing database with the new features:

\`\`\`bash
npm run migrate-library
\`\`\`

This will add the new columns to your existing `library_items` table without affecting existing data.

## Usage

### Adding Extra Fields
1. In the library item form, scroll to the "Extra Fields" section
2. Enter a field name and value
3. Click the "+" button to add the field
4. Remove fields by clicking the "×" button next to each field

### Setting Availability
1. In the "Availability" section, set date ranges
2. Choose availability status (Available/Limited/Unavailable)
3. Set maximum capacity and current bookings for capacity management

### Viewing in Library
- Library cards now show availability status with color-coded badges
- Booking progress is displayed (e.g., "25/100 booked")
- Extra fields are shown in a separate section (first 2 fields + count)
- Pricing is prominently displayed

## Technical Implementation

### Components Updated:
- `add-edit-event-modal.tsx`: Enhanced with new sections and extra fields functionality
- `library-view.tsx`: Updated to display new information
- `database.ts`: Updated types to include new fields

### Database Schema:
- `schema.sql`: Updated with new columns
- `migrate-library.sql`: Migration script for existing databases

### New Files:
- `migrate-library.js`: Migration execution script
- `README-LIBRARY-FEATURES.md`: This documentation

## Benefits

1. **Better Organization**: Clear separation of different types of information
2. **Flexibility**: Custom fields allow for category-specific or unique requirements
3. **Availability Management**: Better control over bookings and availability
4. **Enhanced UX**: Cleaner, more intuitive interface with logical grouping
5. **Scalability**: JSON-based extra fields allow for unlimited customization without schema changes
