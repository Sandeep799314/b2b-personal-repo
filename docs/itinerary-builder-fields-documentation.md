# 📋 Itinerary Builder - Complete Field Documentation

**Version:** 1.0  
**Last Updated:** January 01, 2026  
**Author:** Development Team

---

## 📌 Overview

This documentation provides a complete mapping of all fields used in the **Customized Package Builder / Itinerary Builder** components. Each section includes the UI field label, database field name, data type, and whether it's mandatory or optional.

---

# 🏠 SECTION 1: ITINERARY (ROOT DOCUMENT)

**MongoDB Collection:** `itineraries`

## Core Fields

| # | UI Label | Database Field | Type | Required | Notes |
|---|----------|----------------|------|----------|-------|
| 1 | ID | `_id` | ObjectId | Auto | MongoDB auto-generated |
| 2 | Product ID | `productId` | String | ✅ Yes | Unique identifier |
| 3 | Product Reference Code | `productReferenceCode` | String | ❌ No | Optional reference |
| 4 | Title | `title` | String | ✅ Yes | Package title |
| 5 | Description | `description` | String | ✅ Yes | Package description |
| 6 | Destination | `destination` | String | ✅ Yes | Primary destination |
| 7 | Countries | `countries` | String[] | ❌ No | List of countries |
| 8 | Duration | `duration` | String | ✅ Yes | e.g., "5 Days 4 Nights" |
| 9 | Total Price | `totalPrice` | Number | ✅ Yes | Total cost (default: 0) |
| 10 | Currency | `currency` | String | ✅ Yes | Default: "USD" |
| 11 | Status | `status` | Enum | ❌ No | "published" / "archived" / "draft" |
| 12 | Type | `type` | Enum | ✅ Yes | "customized-package" / "fixed-group-tour" |
| 13 | Created By | `createdBy` | String | ✅ Yes | User ID |
| 14 | Last Updated By | `lastUpdatedBy` | String | ❌ No | User ID |
| 15 | Created At | `createdAt` | Date | Auto | Timestamp |
| 16 | Updated At | `updatedAt` | Date | Auto | Timestamp |

## Branding Object

**Database Path:** `branding.*`

| # | UI Label | Database Field | Type | Notes |
|---|----------|----------------|------|-------|
| 1 | Header Logo | `branding.headerLogo` | String | Logo URL |
| 2 | Header Text | `branding.headerText` | String | Header text |
| 3 | Footer Logo | `branding.footerLogo` | String | Logo URL |
| 4 | Footer Text | `branding.footerText` | String | Footer text |
| 5 | Primary Color | `branding.primaryColor` | String | Hex color |
| 6 | Secondary Color | `branding.secondaryColor` | String | Hex color |

---

# 📅 SECTION 2: ITINERARY DAY

**Database Path:** `days[]`

| # | UI Label | Database Field | Type | Required | Notes |
|---|----------|----------------|------|----------|-------|
| 1 | Day Number | `day` | Number | ✅ Yes | 1-indexed |
| 2 | Date | `date` | String | ✅ Yes | ISO format |
| 3 | Title | `title` | String | ✅ Yes | Day title |
| 4 | Description | `description` | String | ❌ No | Brief description |
| 5 | Detailed Description | `detailedDescription` | String | ❌ No | Full description |
| 6 | Events | `events` | Object[] | ✅ Yes | Array of events |
| 7 | Nights | `nights` | Number | ❌ No | Nights count |
| 8 | Meals | `meals` | String[] | ❌ No | Included meals |

---

# 🎫 SECTION 3: EVENT (BASE FIELDS)

**Common fields for ALL event types**

| # | UI Label | Database Field | Type | Required | Notes |
|---|----------|----------------|------|----------|-------|
| 1 | ID | `id` | String | ✅ Yes | Unique event ID |
| 2 | Category | `category` | Enum | ✅ Yes | See allowed values |
| 3 | Title | `title` | String | ✅ Yes | Event title |
| 4 | Description | `description` | String | ✅ Yes | Event description |
| 5 | Time | `time` | String | ❌ No | HH:MM format |
| 6 | Location | `location` | String | ❌ No | Event location |
| 7 | Price | `price` | Number | ❌ No | Default: 0 |
| 8 | Currency | `currency` | String | ❌ No | Default: "INR" |
| 9 | Component Source | `componentSource` | Enum | ❌ No | "manual" / "my-library" / etc. |
| 10 | Highlights | `highlights` | String[] | ❌ No | Key features |
| 11 | Image URL | `imageUrl` | String | ❌ No | Associated image |

**Allowed Category Values:**
```
flight, hotel, activity, transfer, meal, ancillaries, 
cruise, note, image, heading, paragraph, list, other
```

---

# ✈️ SECTION 4: FLIGHT COMPONENT

**Category:** `flight`

## 4.1 Mandatory Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Title | `title` | String | "Mumbai to Delhi Flight" |
| 2 | From | `fromCity` | String | "Mumbai" |
| 3 | To | `toCity` | String | "Delhi" |
| 4 | Airline | `airlines` | String | "IndiGo" |
| 5 | Departure Time | `startTime` | String | "09:00" |
| 6 | Arrival Time | `endTime` | String | "11:30" |
| 7 | Class | `flightClass` | String | "Economy" / "Business" / "First" |
| 8 | Price | `price` | Number | 5500 |
| 9 | Currency | `currency` | String | "INR" |

## 4.2 Optional Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Flight Number | `flightNumber` | String | "6E-2341" |
| 2 | Duration | `duration` | String | "2h 30m" (auto-calculated) |
| 3 | No. of Stops | `numberOfStops` | Number | 0 = Non-stop |
| 4 | Stop Locations | `stopLocations` | String[] | ["Jaipur"] |
| 5 | Checkin Bags | `checkinBags` | Number | 1 |
| 6 | Checkin Bag Weight | `checkinBagWeight` | String | "23kg" |
| 7 | Cabin Bags | `cabinBags` | Number | 1 |
| 8 | Cabin Bag Weight | `cabinBagWeight` | String | "7kg" |
| 9 | PNR | `pnr` | String | "ABC123" |
| 10 | Refundable | `refundable` | String | "Yes" / "No" |
| 11 | Booking ID | `bookingId` | String | "BK12345" |
| 12 | Seat Number | `seatNumber` | String | "12A" |
| 13 | In-Flight Meals | `inFlightMeals` | String | "Veg Meal" |
| 14 | Description | `description` | String | Additional notes |
| 15 | Main Point | `mainPoint` | String | Key highlight |

---

# 🏨 SECTION 5: HOTEL COMPONENT

**Category:** `hotel`

## 5.1 Mandatory Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Hotel Name | `hotelName` | String | "Taj Palace Hotel" |
| 2 | Location | `location` | String | "New Delhi" |
| 3 | Check-In Time | `checkIn` | String | "14:00" |
| 4 | Check-Out Time | `checkOut` | String | "11:00" |
| 5 | No. of Nights | `nights` | Number | 3 |
| 6 | Room Category | `roomCategory` | String | "Deluxe Room" |
| 7 | Price | `price` | Number | 8500 (per night) |
| 8 | Currency | `currency` | String | "INR" |

## 5.2 Optional Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Star Rating | `hotelRating` | Number | 5 (1-5) |
| 2 | Property Type | `propertyType` | String | "Hotel" / "Resort" / "Villa" |
| 3 | Meal Plan | `mealPlan` | String | "CP" / "MAP" / "AP" / "EP" |
| 4 | Adults | `adults` | Number | 2 |
| 5 | Children | `children` | Number | 1 |
| 6 | Address | `address` | String | Full address |
| 7 | Amenities | `amenities` | String[] | ["WiFi", "Pool", "Spa"] |
| 8 | Notes | `hotelNotes` | String | Additional notes |
| 9 | Booking Link | `hotelLink` | String | URL |
| 10 | Confirmation No. | `confirmationNumber` | String | "CONF123" |
| 11 | Highlights | `highlights` | String[] | Key features |

## 5.3 Multi-Night Tracking Fields (Internal)

| # | Database Field | Type | Purpose |
|---|----------------|------|---------|
| 1 | `hotelGroupId` | String | Groups same hotel across days |
| 2 | `hotelNightIndex` | Number | Night number (1, 2, 3...) |
| 3 | `hotelTotalNights` | Number | Total nights in stay |

---

# 🎯 SECTION 6: ACTIVITY COMPONENT

**Category:** `activity`

## 6.1 Mandatory Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Title | `title` | String | "City Walking Tour" |
| 2 | Description | `description` | String | Tour description |
| 3 | Location | `location` | String | "Old Delhi" |
| 4 | Duration | `duration` | String | "4 hours" |
| 5 | Price | `price` | Number | 2500 |
| 6 | Currency | `currency` | String | "INR" |

## 6.2 Optional Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Start Time | `time` | String | "09:00" |
| 2 | Difficulty | `difficulty` | String | "Easy" / "Moderate" / "Hard" |
| 3 | Max Capacity | `capacity` | Number | 15 |
| 4 | Highlights | `highlights` | String[] | Key features |
| 5 | Images | `images` | String[] | Image URLs |

---

# 🍽️ SECTION 7: MEAL COMPONENT

**Category:** `meal`

## 7.1 Mandatory Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Title | `title` | String | "Dinner at Hotel" |
| 2 | Meal Types | `meals` | String[] | ["breakfast", "dinner"] |
| 3 | Price | `price` | Number | 1500 |
| 4 | Currency | `currency` | String | "INR" |

## 7.2 Meal Type Options

| ID | Display Label |
|----|---------------|
| `breakfast` | Breakfast |
| `lunch` | Lunch |
| `dinner` | Dinner |
| `highTea` | High Tea |
| `halfBoard` | Half Board (Breakfast + Lunch/Dinner) |
| `fullBoard` | Full Board (Breakfast + Lunch + Dinner) |
| `allInclusive` | All inclusive (All meals + snacks + drinks) |
| `others` | Others (Custom) |

## 7.3 Optional Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Custom Description | `customMealDescription` | String | When "Others" selected |
| 2 | Description | `description` | String | Additional notes |
| 3 | Location | `location` | String | Restaurant name |

---

# 🚗 SECTION 8: TRANSFER COMPONENT

**Category:** `transfer`

## 8.0 Transfer Subcategories

| ID | Display Label | Icon |
|----|---------------|------|
| `airport-transfer` | Airport Transfer | ✈️ |
| `car-hire-hourly` | Car Hire - Hourly | 🕐 |
| `car-hire-outstation` | Car Hire - Outstation (One Way) | 🛣️ |
| `car-hire-roundtrip` | Car Hire - Round Trip | 🔄 |
| `car-hire-selfdrive` | Car Hire - Self Drive | 🚗 |
| `bus` | Bus | 🚌 |
| `train` | Train | 🚆 |

---

## 8.1 Airport Transfer

### Mandatory Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Pickup/Drop | `pickupDrop` | Enum | "pickup" / "drop" |
| 2 | Airport Name | `airportName` | String | "IGI Airport" |
| 3 | From | `fromLocation` | String | Origin |
| 4 | To | `toLocation` | String | Destination |
| 5 | Title | `title` | String | Transfer title |
| 6 | Type of Transfer | `transferType` | Enum | "private" / "shared" |
| 7 | Type of Vehicle | `vehicleType` | String | "Sedan" / "SUV" / "Van" |
| 8 | Vehicle Capacity | `capacity` | Number | 3 |
| 9 | Price | `price` | Number | 2500 |
| 10 | Currency | `currency` | String | "INR" |
| 11 | Transfer Category | `transferCategory` | String | "airport-transfer" |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Add Stops | `stopsList` | String[] |
| 2 | Additional Vehicles | `additionalVehicles` | Object[] |
| 3 | Description | `description` | String |

---

## 8.2 Car Hire - Hourly

### Mandatory Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | From | `fromLocation` | String |
| 2 | To | `toLocation` | String |
| 3 | Pickup Time | `pickupTime` | String (HH:MM) |
| 4 | No. of Hours | `noOfHours` | Number |
| 5 | Car Type | `vehicleType` | String |
| 6 | Capacity | `capacity` | Number |
| 7 | Price | `price` | Number |
| 8 | Currency | `currency` | String |
| 9 | Transfer Category | `transferCategory` | String = "car-hire-hourly" |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Fuel Type | `fuelType` | String |
| 2 | Car Model | `carModel` | String |
| 3 | Transmission | `transmission` | String ("automatic" / "manual") |

---

## 8.3 Car Hire - Outstation (One Way)

### Mandatory Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | From | `fromLocation` | String |
| 2 | To | `toLocation` | String |
| 3 | Pickup Time | `pickupTime` | String (HH:MM) |
| 4 | Private/Shared | `transferType` | Enum |
| 5 | Car Type | `vehicleType` | String |
| 6 | Capacity | `capacity` | Number |
| 7 | Price | `price` | Number |
| 8 | Currency | `currency` | String |
| 9 | Transfer Category | `transferCategory` | String = "car-hire-outstation" |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Fuel Type | `fuelType` | String |
| 2 | Car Model | `carModel` | String |
| 3 | Transmission | `transmission` | String |

---

## 8.4 Car Hire - Round Trip

### Mandatory Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | From | `fromLocation` | String |
| 2 | To | `toLocation` | String |
| 3 | Pickup Time | `pickupTime` | String (HH:MM) |
| 4 | Drop Time | `dropTime` | String (HH:MM) |
| 5 | No. of Days | `noOfDays` | Number |
| 6 | Car Type | `vehicleType` | String |
| 7 | Capacity | `capacity` | Number |
| 8 | Price | `price` | Number |
| 9 | Currency | `currency` | String |
| 10 | Transfer Category | `transferCategory` | String = "car-hire-roundtrip" |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Fuel Type | `fuelType` | String |
| 2 | Car Model | `carModel` | String |
| 3 | Transmission | `transmission` | String |

---

## 8.5 Car Hire - Self Drive

### Mandatory Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Pickup From | `fromLocation` | String |
| 2 | Pickup Time | `pickupTime` | String (HH:MM) |
| 3 | Car Type | `vehicleType` | String |
| 4 | Capacity | `capacity` | Number |
| 5 | No. of Days | `noOfDays` | Number |
| 6 | Price | `price` | Number |
| 7 | Currency | `currency` | String |
| 8 | Transfer Category | `transferCategory` | String = "car-hire-selfdrive" |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Fuel Type | `fuelType` | String |
| 2 | Car Model | `carModel` | String |
| 3 | Transmission | `transmission` | String |

---

## 8.6 Bus

### Mandatory Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | From | `fromLocation` | String |
| 2 | To | `toLocation` | String |
| 3 | Travel Duration | `duration` | String (e.g., "5h 30m") |
| 4 | Class | `transferClass` | String (Sleeper/AC/Semi-Sleeper) |
| 5 | Departure Time | `startTime` | String (HH:MM) |
| 6 | Arrival Time | `endTime` | String (HH:MM) |
| 7 | Price | `price` | Number |
| 8 | Currency | `currency` | String |
| 9 | Transfer Category | `transferCategory` | String = "bus" |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Bus No. | `busNumber` | String |
| 2 | PNR Number | `pnr` | String |
| 3 | Amenities | `amenities` | String[] |
| 4 | Refundable | `refundable` | String |
| 5 | Description | `description` | String |
| 6 | Booking Link | `transferLink` | String |

---

## 8.7 Train

### Mandatory Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | From | `fromLocation` | String |
| 2 | To | `toLocation` | String |
| 3 | Travel Duration | `duration` | String (e.g., "8h 15m") |
| 4 | Class | `transferClass` | String (1AC/2AC/3AC/Sleeper) |
| 5 | Departure Time | `startTime` | String (HH:MM) |
| 6 | Arrival Time | `endTime` | String (HH:MM) |
| 7 | Price | `price` | Number |
| 8 | Currency | `currency` | String |
| 9 | Transfer Category | `transferCategory` | String = "train" |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Train No. | `trainNumber` | String |
| 2 | PNR Number | `pnr` | String |
| 3 | Description | `description` | String |
| 4 | Booking Link | `transferLink` | String |

---

# 🛡️ SECTION 9: ANCILLARIES COMPONENT

**Category:** `ancillaries`

## 9.0 Ancillaries Subcategories

| ID | Display Label | Icon |
|----|---------------|------|
| `visa` | Visa | 📋 |
| `forex` | Forex | 💱 |
| `travel-insurance` | Travel Insurance | 🛡️ |

---

## 9.1 Visa

### Mandatory Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Title | `title` | String | "US Tourist Visa" |
| 2 | Country | `country` | String | "United States" |
| 3 | Visa Type | `visaType` | String | "Tourist" / "Business" / "Transit" |
| 4 | Duration | `visaDuration` | String | "30 days" / "90 days" |
| 5 | Price | `price` | Number | 15000 |
| 6 | Service Fee | `serviceCharge` | Number | 2000 |
| 7 | Currency | `currency` | String | "INR" |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Length of Stay | `lengthOfStay` | String |
| 2 | Entry Method | `entryMethod` | String (Single/Multiple Entry) |
| 3 | Departure Date | `departureDate` | String (Date) |
| 4 | Return Date | `returnDate` | String (Date) |

---

## 9.2 Forex

### Mandatory Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Title | `title` | String | "USD Currency Exchange" |
| 2 | Forex Currency | `forexCurrency` | String | "USD" |
| 3 | Base Currency | `baseCurrency` | String | "INR" |
| 4 | Amount | `amount` | Number | 1000 |
| 5 | Service Fee | `serviceCharge` | Number | 500 |
| 6 | Currency | `currency` | String | "INR" |

### Forex Currency Options

```
USD, EUR, GBP, AED, JPY, AUD, CAD, SGD
```

---

## 9.3 Travel Insurance

### Mandatory Fields

| # | UI Label | Database Field | Type | Example |
|---|----------|----------------|------|---------|
| 1 | Title | `title` | String | "Travel Insurance - Europe" |
| 2 | Destinations | `destinations` | String[] | ["France", "Italy"] |
| 3 | Start Date | `startDate` | String | "2026-02-01" |
| 4 | End Date | `endDate` | String | "2026-02-15" |
| 5 | No. of Travellers | `noOfTravellers` | Number | 2 |
| 6 | Price | `price` | Number | 3500 |
| 7 | Currency | `currency` | String | "INR" |
| 8 | Type of Insurance | `insuranceType` | String | "Comprehensive" / "Basic" / "Premium" |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Notes | `insuranceNotes` | String |
| 2 | Sum Insured | `sumInsured` | Number |

---

# 🎁 SECTION 10: OTHERS COMPONENT

**Category:** `other` or `others`

## 10.0 Others Subcategories

| ID | Display Label | Icon |
|----|---------------|------|
| `gift-cards` | Gift Cards | 🎁 |
| `travel-gears` | Travel Gears | 🧳 |

---

## 10.1 Gift Cards

### Mandatory Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Title | `title` | String |
| 2 | Amount | `price` | Number |
| 3 | Currency | `currency` | String |

### Optional Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Service Charge | `serviceCharge` | Number |
| 2 | Subcategory | `subCategory` | String = "gift-cards" |

---

## 10.2 Travel Gears

### Mandatory Fields

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Title | `title` | String |
| 2 | Currency (Default) | `currency` | String |
| 3 | Products | `travelGears` | Object[] |

### Travel Gears Product Object

| # | Field | Database Path | Type |
|---|-------|---------------|------|
| 1 | Product Name | `travelGears[].name` | String |
| 2 | Price | `travelGears[].price` | Number |
| 3 | Description | `travelGears[].description` | String |
| 4 | Currency | `travelGears[].currency` | String (optional override) |

---

# 📝 SECTION 11: CONTENT TYPES

## 11.1 Note

**Category:** `note`

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Title | `title` | String |
| 2 | Content | `description` | String |

---

## 11.2 Image

**Category:** `image`

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Title | `title` | String |
| 2 | Image URL | `imageUrl` | String |
| 3 | Caption | `imageCaption` | String |
| 4 | Alt Text | `imageAlt` | String |

---

## 11.3 Heading

**Category:** `heading`

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Heading Text | `title` | String |

---

## 11.4 Paragraph

**Category:** `paragraph`

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Title | `title` | String |
| 2 | Content | `description` | String |

---

## 11.5 List

**Category:** `list`

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Title | `title` | String |
| 2 | List Items | `listItems` | String[] |

---

# 👤 SECTION 12: GUEST & AGENCY DETAILS

## 12.1 Guest Details

**Database Path:** `guestDetails.*`

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Name | `guestDetails.name` | String |
| 2 | Lead Reference Code | `guestDetails.leadReferenceCode` | String |
| 3 | Email | `guestDetails.email` | String |
| 4 | Mobile | `guestDetails.mobile` | String |

---

## 12.2 Agency Details

**Database Path:** `agencyDetails.*`

| # | UI Label | Database Field | Type |
|---|----------|----------------|------|
| 1 | Logo | `agencyDetails.logo` | String (URL) |
| 2 | Name | `agencyDetails.name` | String |
| 3 | Address | `agencyDetails.address` | String |
| 4 | Phone | `agencyDetails.phone` | String |
| 5 | Email | `agencyDetails.email` | String |
| 6 | GST | `agencyDetails.gst` | String |

---

# 💰 APPENDIX A: CURRENCY OPTIONS

The following currencies are supported:

| Code | Symbol | Name |
|------|--------|------|
| INR | ₹ | Indian Rupee |
| USD | $ | US Dollar |
| EUR | € | Euro |
| GBP | £ | British Pound |
| AED | د.إ | UAE Dirham |

---

# 📁 APPENDIX B: SOURCE CODE FILES

| File | Purpose |
|------|---------|
| `models/Itinerary.ts` | Database Schema |
| `components/itinerary-builder/component-source-modal.tsx` | Main Component Forms |
| `components/itinerary-builder/transfer-forms.tsx` | Transfer Subcategory Forms |
| `components/itinerary-builder/ancillaries-forms.tsx` | Ancillaries Forms |
| `components/itinerary-builder/others-forms.tsx` | Others Component Forms |
| `components/itinerary-builder/edit-event-modal.tsx` | Edit Event Modal |

---

**End of Documentation**
