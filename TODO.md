# Itinerary Builder All Inclusions View Implementation

## Current Task: Implement All Inclusions Button Functionality

## Plan
- [ ] Add view mode state to track current view (itinerary vs all-inclusions)
- [ ] Add click handlers for Itinerary and All Inclusions buttons
- [ ] Create grouped view rendering logic that combines events by category
- [ ] Display events in category sections without day structure
- [ ] Ensure existing itinerary view remains unchanged

## Implementation Details
- **All Inclusions View**: Groups all events by category (flight, hotel, activity, transfer, etc.)
- **Category Sections**: Each category gets its own section with all related events
- **No Day Cards**: Removes day-based structure, shows all components together
- **Preserve Existing**: Keep current itinerary mode exactly as is

## Files to Modify
- components/itinerary-builder/index.tsx

## Next Steps After Implementation
- [ ] Test the All Inclusions view functionality
- [ ] Verify that itinerary view remains unchanged
- [ ] Check for any TypeScript errors or runtime issues
- [ ] Ensure proper styling and layout in both views
