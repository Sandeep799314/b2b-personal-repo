# Library-Itinerary Integration Testing Guide

## Manual Testing Checklist

### Prerequisites
1. ✅ Development server running (`npm run dev`)
2. ✅ MongoDB connection established
3. ✅ Library items exist in database
4. ✅ Access to itinerary builder page

### Test Scenarios

#### 1. Basic Library Integration
- [ ] Navigate to itinerary builder
- [ ] Click on "Library" tab in sidebar
- [ ] Verify library items are displayed
- [ ] Check search functionality works
- [ ] Test category filtering

#### 2. Drag & Drop Functionality
- [ ] Drag a library item from sidebar
- [ ] Drop onto an itinerary day
- [ ] Verify event is created with library data
- [ ] Check libraryItemId is set in event
- [ ] Confirm original library item data is preserved

#### 3. Category-Specific Conversion
- [ ] Test flight library item conversion
  - [ ] Origin/destination fields populated
  - [ ] Flight-specific data preserved
- [ ] Test hotel library item conversion
  - [ ] Check-in/check-out times set
  - [ ] Meal options preserved
- [ ] Test activity library item conversion
  - [ ] Highlights and descriptions preserved
  - [ ] Location data correctly mapped

#### 4. Integration Panel
- [ ] Check "Library Integration" panel appears
- [ ] Verify used library items are listed
- [ ] Test "View" library item functionality
- [ ] Test "Remove" library item functionality
- [ ] Check usage count is accurate

#### 5. Usage Statistics
- [ ] Verify statistics show correct totals
- [ ] Check library utilization percentage
- [ ] Confirm event integration percentage
- [ ] Test real-time updates when items added/removed

#### 6. Mixed Workflow
- [ ] Create events using manual components
- [ ] Add events using library items
- [ ] Switch between Components and Library tabs
- [ ] Verify both types of events work together

#### 7. Data Validation
- [ ] Test with incomplete library items
- [ ] Check validation warnings appear
- [ ] Verify conversion still works with warnings
- [ ] Test error handling for invalid data

### Expected Results

#### Library Sidebar
\`\`\`
✓ Shows all library items with proper formatting
✓ Search filters items correctly
✓ Category filter works as expected
✓ Drag handles are visible and functional
✓ Item previews show relevant information
\`\`\`

#### Event Conversion
\`\`\`
✓ Library items convert to proper event types
✓ All relevant data is preserved
✓ Category-specific fields are populated
✓ libraryItemId reference is maintained
\`\`\`

#### Integration Tracking
\`\`\`
✓ Integration panel shows used items
✓ Statistics are accurate and update in real-time
✓ Usage percentages calculate correctly
✓ Remove functionality works properly
\`\`\`

### Performance Tests
- [ ] Test with 50+ library items
- [ ] Check scroll performance in library sidebar
- [ ] Verify drag/drop responsiveness
- [ ] Test search performance with large datasets

### Edge Cases
- [ ] Library item with missing required fields
- [ ] Very long library item titles/descriptions
- [ ] Library items with no multimedia
- [ ] Library items with extensive extra fields
- [ ] Network connectivity issues during drag/drop

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Mobile Responsiveness
- [ ] Touch drag and drop (if supported)
- [ ] Sidebar layout on mobile
- [ ] Integration panel on smaller screens

## Automated Testing

### Unit Tests to Create
\`\`\`javascript
// Library converter tests
describe('LibraryToItineraryConverter', () => {
  test('converts flight library item correctly')
  test('converts hotel library item with meals')
  test('handles missing optional fields')
  test('validates library item data')
})

// Integration hook tests
describe('useLibraryIntegration', () => {
  test('filters items by search query')
  test('filters items by category')
  test('tracks used library items')
  test('calculates usage statistics')
})
\`\`\`

### Integration Tests
\`\`\`javascript
// End-to-end workflow tests
describe('Library Integration E2E', () => {
  test('complete drag and drop workflow')
  test('library item to itinerary conversion')
  test('statistics update after changes')
  test('mixed manual and library workflow')
})
\`\`\`

## Troubleshooting Common Issues

### Library Items Not Showing
1. Check MongoDB connection
2. Verify API endpoint `/api/library` returns data
3. Check browser console for errors
4. Ensure library items exist in database

### Drag and Drop Not Working
1. Verify drag handlers are present
2. Check browser developer tools for JavaScript errors
3. Test with different library item types
4. Ensure drop zones are properly configured

### Data Not Converting Properly
1. Check LibraryToItineraryConverter mapping
2. Verify library item has required fields
3. Check category mapping in converter
4. Review conversion logic for specific categories

### Statistics Showing Incorrect Values
1. Verify calculation logic in component
2. Check if libraryItemId is properly set
3. Ensure used items are correctly identified
4. Test with known data sets

## Success Metrics

### Functionality
- ✅ 100% of library items can be converted to events
- ✅ All category-specific data is preserved
- ✅ Statistics are accurate within 1% margin
- ✅ No data loss during conversion

### Performance
- ✅ Library loads within 2 seconds
- ✅ Drag operations complete within 500ms
- ✅ Search results appear within 300ms
- ✅ Statistics update within 100ms

### User Experience
- ✅ Intuitive drag and drop interaction
- ✅ Clear visual feedback during operations
- ✅ Helpful validation messages
- ✅ Seamless workflow integration
