"use client"

import React, { useState, useEffect } from "react"
import {
  X, Plane, Hotel, Activity, Utensils, Bus, ShoppingBag,
  FileText, Info, Ship, Box
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLibrary } from "@/hooks/use-library"
import { toast } from "sonner"
import { IItineraryEvent } from "@/models/Itinerary"

// Import Shared Forms
import { FlightForms } from "./itinerary-builder/flight-forms"
import { HotelForms } from "./itinerary-builder/hotel-forms"
import { ActivityForms } from "./itinerary-builder/activity-forms"
import { MealForms } from "./itinerary-builder/meal-forms"
import { TransferForms } from "./itinerary-builder/transfer-forms"
import { AncillariesForms } from "./itinerary-builder/ancillaries-forms"
import { OthersForms } from "./itinerary-builder/others-forms"
import {
  transferSubCategories,
  ancillariesSubCategories,
  othersSubCategories
} from "./itinerary-builder/constants"
import { NoteForms } from "./itinerary-builder/note-forms"
import { ImageForms } from "./itinerary-builder/image-forms"


interface SelectCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onItemCreated: () => void
  editingItem?: any
  defaultLibraryId?: string
}

export function SelectCategoryModal({ isOpen, onClose, onItemCreated, editingItem, defaultLibraryId }: SelectCategoryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("Flights")
  const [isSaving, setIsSaving] = useState(false)
  const { createItem, updateItem, libraries } = useLibrary()
  const [targetLibraryId, setTargetLibraryId] = useState<string>("")

  useEffect(() => {
    if (defaultLibraryId) {
      setTargetLibraryId(defaultLibraryId)
    } else if (libraries.length > 0) {
      setTargetLibraryId(libraries[0]._id)
    }
  }, [defaultLibraryId, libraries])

  // Initialize Item Form State with comprehensive defaults
  const [itemForm, setItemForm] = useState<Partial<IItineraryEvent>>({
    title: "",
    description: "",
    category: "flight",
    price: 0,
    currency: "USD",


    // Common fields
    location: "",
    duration: "",
    difficulty: "",
    startTime: "",
    endTime: "",
    flightNumber: "",

    fromCity: "",
    toCity: "",
    checkIn: "",
    checkOut: "",
    hotelName: "",
    roomCategory: "",
    nights: 0,
    vehicleType: "",
    transferType: "private",

    // Extended fields
    subCategory: "",
    country: "",
    visaType: "",
    visaDuration: "",
    entryMethod: "",
    departureDate: "",
    returnDate: "",
    imageUrl: "",
    imageCaption: "",
    imageAlt: "",
    // Arrays
    destinations: [],
    products: [],
    stopsList: [],
    additionalVehicles: [],
    amenities: [],
    highlights: [],
    stopLocations: [],
    // Extended Flight
    checkinBags: 0,
    checkinBagWeight: "",
    cabinBags: 0,
    cabinBagWeight: "",
    numberOfStops: 0,
    bookingId: "",
    seatNumber: "",
    inFlightMeals: "",
    refundable: "",
    pnr: "",
    // Extended Transfer
    pickupTime: "",
    dropTime: "",
    noOfHours: 0,
    noOfDays: 0,
    busNumber: "",
    trainNumber: "",
    transferLink: "",
    transferClass: "",
    fuelType: "",
    carModel: "",
    transmission: "",
    pickupDrop: "pickup",
    airportName: "",
    // Extended Hotel
    adults: 2,
    children: 0,
    mealPlan: "",
    propertyType: "",
    address: "",
    hotelLink: "",
    confirmationNumber: "",
    hotelRating: 0,
    // Extended Ancillaries
    forexCurrency: "",
    baseCurrency: "INR",
    amount: 0,
    insuranceProvider: "",
    policyNumber: "",
    coverageDetails: "",
    insuranceType: "",
    sumInsured: 0,
    insuranceNotes: "",
    serviceCharge: 0,
    giftAmount: 0,
    // Additional Info
    labels: "",
    notes: "",
  })

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      // Map basic fields
      const baseForm: Partial<IItineraryEvent> = {
        title: editingItem.title || "",
        category: editingItem.category || "flight",
        price: editingItem.basePrice || 0,
        currency: editingItem.currency || "USD",
        location: editingItem.city || editingItem.location || "",
        country: editingItem.country || "",
        imageUrl: editingItem.multimedia?.[0] || "",
        // ... map other base fields if they exist on LibraryItem
      }

      // Map extraFields back to top-level for the form
      if (editingItem.extraFields) {
        Object.assign(baseForm, editingItem.extraFields)
      }

      setItemForm(prev => ({ ...prev, ...baseForm }))

      // Map category to display category
      const cat = (editingItem.category || "").toLowerCase()
      const subCat = (editingItem.subCategory || editingItem.extraFields?.subCategory || "")

      if (cat === "flight") setSelectedCategory("Flights")
      else if (cat === "transfer") setSelectedCategory("Transfer")
      else if (cat === "hotel") setSelectedCategory("Hotel")
      else if (cat === "activity") setSelectedCategory("Activity")
      else if (cat === "meal") setSelectedCategory("Meals")
      else if (cat === "ancillaries") setSelectedCategory("Ancillaries")
      else if (cat === "note") {
        if (subCat === "Additional Information") setSelectedCategory("Additional Information")
        else setSelectedCategory("Notes")
      }
      else if (cat === "others") {
        if (subCat === "Cruise") setSelectedCategory("Cruise")
        else setSelectedCategory("Others")
      }
      else setSelectedCategory("Others")
    }
  }, [editingItem])

  // --- Helper Functions ---

  const handleFieldChange = (field: keyof IItineraryEvent, value: any) => {
    setItemForm(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: keyof IItineraryEvent, index: number, value: any) => {
    const currentArray = (itemForm[field] as any[]) || []
    const newArray = [...currentArray]
    newArray[index] = value
    setItemForm(prev => ({ ...prev, [field]: newArray }))
  }

  const handleArrayAdd = (field: keyof IItineraryEvent, initialValue: any = "") => {
    const currentArray = (itemForm[field] as any[]) || []
    setItemForm(prev => ({ ...prev, [field]: [...currentArray, initialValue] }))
  }

  const handleArrayRemove = (field: keyof IItineraryEvent, index: number) => {
    const currentArray = (itemForm[field] as any[]) || []
    setItemForm(prev => ({ ...prev, [field]: currentArray.filter((_, i) => i !== index) }))
  }

  const handleObjectArrayChange = (field: keyof IItineraryEvent, index: number, key: string, value: any) => {
    const currentArray = (itemForm[field] as any[]) || []
    const newArray = [...currentArray]
    newArray[index] = { ...newArray[index], [key]: value }
    setItemForm(prev => ({ ...prev, [field]: newArray }))
  }

  const calculateFlightDuration = (start: string, end: string) => {
    if (!start || !end) return ""
    const [startH, startM] = start.split(":").map(Number)
    const [endH, endM] = end.split(":").map(Number)
    let diffM = endM - startM
    let diffH = endH - startH
    if (diffM < 0) {
      diffM += 60
      diffH -= 1
    }
    if (diffH < 0) diffH += 24
    return `${diffH}h ${diffM}m`
  }

  // --- Render Logic ---

  const renderFormContent = () => {
    switch (selectedCategory) {
      case "Flights":
        return (
          <FlightForms
            manualFromCity={itemForm.fromCity || ""}
            setManualFromCity={(v) => handleFieldChange("fromCity", v)}
            manualToCity={itemForm.toCity || ""}
            setManualToCity={(v) => handleFieldChange("toCity", v)}
            manualTime={itemForm.time || itemForm.startTime || ""}
            setManualTime={(v) => handleFieldChange("startTime", v)} // Unified to startTime
            manualEndTime={itemForm.endTime || ""}
            setManualEndTime={(v) => handleFieldChange("endTime", v)}
            manualAirline={itemForm.airlines || ""}
            setManualAirline={(v) => handleFieldChange("airlines", v)}
            manualClass={itemForm.flightClass || ""}
            setManualClass={(v) => handleFieldChange("flightClass", v)}
            manualPrice={itemForm.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={itemForm.currency || "USD"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            manualDuration={itemForm.duration || ""}
            setManualDuration={(v) => handleFieldChange("duration", v)}
            manualTitle={itemForm.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualFlightNumber={itemForm.flightNumber || ""}
            setManualFlightNumber={(v) => handleFieldChange("flightNumber", v)}
            manualPnr={itemForm.pnr || ""}
            setManualPnr={(v) => handleFieldChange("pnr", v)}
            // Extended
            manualCheckinBags={itemForm.checkinBags || ""}
            setManualCheckinBags={(v) => handleFieldChange("checkinBags", v)}
            manualCheckinBagWeight={itemForm.checkinBagWeight || ""}
            setManualCheckinBagWeight={(v) => handleFieldChange("checkinBagWeight", v)}
            manualCabinBags={itemForm.cabinBags || ""}
            setManualCabinBags={(v) => handleFieldChange("cabinBags", v)}
            manualCabinBagWeight={itemForm.cabinBagWeight || ""}
            setManualCabinBagWeight={(v) => handleFieldChange("cabinBagWeight", v)}
            manualNumberOfStops={itemForm.numberOfStops || 0}
            setManualNumberOfStops={(v) => {
              handleFieldChange("numberOfStops", v)
              // Adjust stop locations array size
              const current = itemForm.stopLocations || []
              if (v > current.length) {
                handleFieldChange("stopLocations", [...current, ...Array(v - current.length).fill("")])
              } else if (v < current.length) {
                handleFieldChange("stopLocations", current.slice(0, v))
              }
            }}
            manualStopLocations={itemForm.stopLocations || []}
            handleAddStopLocation={() => handleArrayAdd("stopLocations", "")}
            handleRemoveStopLocation={(idx) => handleArrayRemove("stopLocations", idx)}
            handleStopLocationChange={(idx, v) => handleArrayChange("stopLocations", idx, v)}
            manualBookingId={itemForm.bookingId || ""}
            setManualBookingId={(v) => handleFieldChange("bookingId", v)}
            manualSeatNumber={itemForm.seatNumber || ""}
            setManualSeatNumber={(v) => handleFieldChange("seatNumber", v)}
            manualInFlightMeals={itemForm.inFlightMeals || ""}
            setManualInFlightMeals={(v) => handleFieldChange("inFlightMeals", v)}
            manualAmenities={itemForm.amenities || []}
            setManualAmenities={(v) => handleFieldChange("amenities", v)}
            manualRefundable={itemForm.refundable || ""}
            setManualRefundable={(v) => handleFieldChange("refundable", v)}
            manualDescription={itemForm.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            manualImageUrl={itemForm.imageUrl || ""}
            setManualImageUrl={(v) => handleFieldChange("imageUrl", v)}
            calculateFlightDuration={calculateFlightDuration}
            errors={{}}
          />
        )

      case "Transfer":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {transferSubCategories.map((sub) => (
                <Button
                  key={sub.id}
                  type="button"
                  variant={itemForm.transferCategory === sub.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFieldChange("transferCategory", sub.id)}
                  className="gap-2"
                >
                  <span>{sub.icon}</span>
                  {sub.label}
                </Button>
              ))}
            </div>
            <TransferForms
              selectedSubCategory={itemForm.transferCategory || ""}
              manualTitle={itemForm.title || ""}
              manualFromCity={itemForm.fromCity || ""}
              setManualFromCity={(v) => handleFieldChange("fromCity", v)}
              manualToCity={itemForm.toCity || ""}
              setManualToCity={(v) => handleFieldChange("toCity", v)}
              manualVehicleType={itemForm.vehicleType || ""}
              setManualVehicleType={(v) => handleFieldChange("vehicleType", v)}
              manualPrice={itemForm.price || ""}
              setManualPrice={(v) => handleFieldChange("price", v)}
              manualCurrency={itemForm.currency || "USD"}
              setManualCurrency={(v) => handleFieldChange("currency", v)}
              manualDescription={itemForm.description || ""}
              setManualDescription={(v) => handleFieldChange("description", v)}

              setManualTitle={(v) => handleFieldChange("title", v)}
              // Extended
              manualPickupDrop={itemForm.pickupDrop || "pickup"}
              setManualPickupDrop={(v) => handleFieldChange("pickupDrop", v)}
              manualAirportName={itemForm.airportName || ""}
              setManualAirportName={(v) => handleFieldChange("airportName", v)}
              manualTransferType={itemForm.transferType || "private"}
              setManualTransferType={(v) => handleFieldChange("transferType", v)}
              manualVehicleCapacity={itemForm.capacity || ""}
              setManualVehicleCapacity={(v) => handleFieldChange("capacity", v)}
              manualPricePerPax={itemForm.price || ""} // Mapping price to pricePerPax for now if needed, or separate
              manualPickupTime={itemForm.pickupTime || ""}
              setManualPickupTime={(v) => handleFieldChange("pickupTime", v)}
              manualDropTime={itemForm.dropTime || ""}
              setManualDropTime={(v) => handleFieldChange("dropTime", v)}
              manualNoOfHours={itemForm.noOfHours || ""}
              setManualNoOfHours={(v) => handleFieldChange("noOfHours", v)}
              manualNoOfDays={itemForm.noOfDays || ""}
              setManualNoOfDays={(v) => handleFieldChange("noOfDays", v)}
              manualCarType={itemForm.vehicleType || ""}
              setManualCarType={(v) => handleFieldChange("vehicleType", v)}
              manualFuelType={itemForm.fuelType || ""}
              setManualFuelType={(v) => handleFieldChange("fuelType", v)}
              manualCarModel={itemForm.carModel || ""}
              setManualCarModel={(v) => handleFieldChange("carModel", v)}
              manualTransmission={(itemForm.transmission as "automatic" | "manual" | "") || ""}
              setManualTransmission={(v) => handleFieldChange("transmission", v)}
              manualTravelDuration={itemForm.duration || ""}
              setManualTravelDuration={(v) => handleFieldChange("duration", v)}
              manualDepartureTime={itemForm.startTime || ""}
              setManualDepartureTime={(v) => handleFieldChange("startTime", v)}
              manualArrivalTime={itemForm.endTime || ""}
              setManualArrivalTime={(v) => handleFieldChange("endTime", v)}
              manualClass={itemForm.transferClass || ""}
              setManualClass={(v) => handleFieldChange("transferClass", v)}
              manualBusNumber={itemForm.busNumber || ""}
              setManualBusNumber={(v) => handleFieldChange("busNumber", v)}
              manualTrainNumber={itemForm.trainNumber || ""}
              setManualTrainNumber={(v) => handleFieldChange("trainNumber", v)}
              manualPnr={itemForm.pnr || ""}
              setManualPnr={(v) => handleFieldChange("pnr", v)}
              manualRefundable={itemForm.refundable || ""}
              setManualRefundable={(v) => handleFieldChange("refundable", v)}
              manualLink={itemForm.transferLink || ""}
              setManualLink={(v) => handleFieldChange("transferLink", v)}
              manualAmenities={itemForm.amenities || []}
              setManualAmenities={(v) => handleFieldChange("amenities", v)}
              manualStopsList={itemForm.stopsList || []}
              handleAddStop={() => handleArrayAdd("stopsList", "")}
              handleRemoveStop={(idx) => handleArrayRemove("stopsList", idx)}
              handleStopChange={(idx, v) => handleArrayChange("stopsList", idx, v)}
              manualAdditionalVehicles={(itemForm.additionalVehicles as any) || []}
              handleAddVehicle={() => handleArrayAdd("additionalVehicles", { vehicleType: "", capacity: 0, price: 0 })}
              handleRemoveVehicle={(idx) => handleArrayRemove("additionalVehicles", idx)}
              handleVehicleChange={(idx, key, val) => handleObjectArrayChange("additionalVehicles", idx, key, val)}
            />
          </div>
        )

      case "Hotel":
        return (
          <HotelForms
            manualTitle={itemForm.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualRoomCategory={itemForm.roomCategory || ""}
            setManualRoomCategory={(v) => handleFieldChange("roomCategory", v)}
            manualLocation={itemForm.location || ""}
            setManualLocation={(v) => handleFieldChange("location", v)}
            manualHotelRating={itemForm.hotelRating || ""}
            setManualHotelRating={(v) => handleFieldChange("hotelRating", v)}
            manualPrice={itemForm.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={itemForm.currency || "USD"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            manualAdults={itemForm.adults || ""}
            setManualAdults={(v) => handleFieldChange("adults", v)}
            manualChildren={itemForm.children || ""}
            setManualChildren={(v) => handleFieldChange("children", v)}
            manualHotelName={itemForm.hotelName || ""}
            setManualHotelName={(v) => handleFieldChange("hotelName", v)}
            manualNights={itemForm.nights || ""}
            setManualNights={(v) => handleFieldChange("nights", v)}
            manualCheckIn={itemForm.checkIn || ""}
            setManualCheckIn={(v) => handleFieldChange("checkIn", v)}
            manualCheckOut={itemForm.checkOut || ""}
            setManualCheckOut={(v) => handleFieldChange("checkOut", v)}
            manualMealPlan={itemForm.mealPlan || ""}
            setManualMealPlan={(v) => handleFieldChange("mealPlan", v)}
            manualPropertyType={itemForm.propertyType || ""}
            setManualPropertyType={(v) => handleFieldChange("propertyType", v)}
            manualAmenities={itemForm.amenities || []}
            handleAddManualAmenity={() => handleArrayAdd("amenities", "")}
            handleRemoveManualAmenity={(idx) => handleArrayRemove("amenities", idx)}
            handleManualAmenitiesChange={(idx, v) => handleArrayChange("amenities", idx, v)}
            manualHighlights={(itemForm.highlights as any) || []}
            handleAddManualHighlight={() => handleArrayAdd("highlights", "")}
            handleRemoveManualHighlight={(idx) => handleArrayRemove("highlights", idx)}
            handleManualHighlightsChange={(idx, v) => handleArrayChange("highlights", idx, v)}
            manualImageUrl={itemForm.imageUrl || ""}
            setManualImageUrl={(v) => handleFieldChange("imageUrl", v)}
            manualRefundable={itemForm.refundable || ""}
            setManualRefundable={(v) => handleFieldChange("refundable", v)}
            manualAddress={itemForm.address || ""}
            setManualAddress={(v) => handleFieldChange("address", v)}
            manualHotelLink={itemForm.hotelLink || ""}
            setManualHotelLink={(v) => handleFieldChange("hotelLink", v)}
            manualDescription={itemForm.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            manualConfirmationNumber={itemForm.confirmationNumber || ""}
            setManualConfirmationNumber={(v) => handleFieldChange("confirmationNumber", v)}
            errors={{}}
          />
        )

      case "Activity":
        return (
          <ActivityForms
            manualTitle={itemForm.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualDescription={itemForm.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            manualDuration={itemForm.duration || ""}
            setManualDuration={(v) => handleFieldChange("duration", v)}
            manualTime={itemForm.startTime || itemForm.time || ""}
            setManualTime={(v) => handleFieldChange("startTime", v)}
            manualDifficulty={itemForm.difficulty || ""}
            setManualDifficulty={(v) => handleFieldChange("difficulty", v)}
            manualCapacity={itemForm.capacity || ""}
            setManualCapacity={(v) => handleFieldChange("capacity", v)}
            manualLocation={itemForm.location || ""}
            setManualLocation={(v) => handleFieldChange("location", v)}
            manualPrice={itemForm.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={itemForm.currency || "USD"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            errors={{}}
          />
        )

      case "Meals":
        return (
          <MealForms
            manualMeals={itemForm.meals || []}
            setManualMeals={(v) => handleFieldChange("meals", v)}
            manualCustomMealDescription={itemForm.customMealDescription || ""}
            setManualCustomMealDescription={(v) => handleFieldChange("customMealDescription", v)}
            manualPrice={itemForm.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={itemForm.currency || "USD"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            errors={{}}
          />
        )

      case "Ancillaries":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {ancillariesSubCategories.map((sub) => (
                <Button
                  key={sub.id}
                  type="button"
                  variant={itemForm.subCategory === sub.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFieldChange("subCategory", sub.id)}
                  className="gap-2"
                >
                  <span>{sub.icon}</span>
                  {sub.label}
                </Button>
              ))}
            </div>
            <AncillariesForms
              selectedSubCategory={itemForm.subCategory || ""}
              manualTitle={itemForm.title || ""}
              setManualTitle={(v) => handleFieldChange("title", v)}
              manualPrice={itemForm.price || ""}
              setManualPrice={(v) => handleFieldChange("price", v)}
              manualCurrency={itemForm.currency || "USD"}
              setManualCurrency={(v) => handleFieldChange("currency", v)}
              manualCountry={itemForm.visaCountry || ""}
              setManualCountry={(v) => handleFieldChange("visaCountry", v)}
              manualVisaType={itemForm.visaType || ""}
              setManualVisaType={(v) => handleFieldChange("visaType", v)}
              manualVisaDuration={itemForm.visaDuration || ""}
              setManualVisaDuration={(v) => handleFieldChange("visaDuration", v)}
              manualServiceFee={(itemForm as any).serviceFee || ""}
              setManualServiceFee={(v) => handleFieldChange("serviceFee" as any, v)}
              manualTotalFee={(itemForm as any).totalFee || ""}
              manualLengthOfStay={(itemForm as any).lengthOfStay || ""}
              setManualLengthOfStay={(v) => handleFieldChange("lengthOfStay" as any, v)}
              manualEntryMethod={itemForm.entryMethod || ""}
              setManualEntryMethod={(v) => handleFieldChange("entryMethod", v)}
              manualDepartureDate={(itemForm as any).departureDate || ""}
              setManualDepartureDate={(v) => handleFieldChange("departureDate" as any, v)}
              manualReturnDate={(itemForm as any).returnDate || ""}
              setManualReturnDate={(v) => handleFieldChange("returnDate" as any, v)}

              manualForexCurrency={itemForm.forexCurrency || ""}
              setManualForexCurrency={(v) => handleFieldChange("forexCurrency", v)}
              manualBaseCurrency={(itemForm as any).baseCurrency || ""}
              setManualBaseCurrency={(v) => handleFieldChange("baseCurrency" as any, v)}
              manualAmount={itemForm.amount || ""}
              setManualAmount={(v) => handleFieldChange("amount", v)}

              manualNoOfTravellers={itemForm.noOfTravellers || ""}
              setManualNoOfTravellers={(v) => handleFieldChange("noOfTravellers", v)}
              manualInsuranceType={itemForm.insuranceType || ""}
              setManualInsuranceType={(v) => handleFieldChange("insuranceType", v)}
              manualNotes={itemForm.insuranceNotes || ""}
              setManualNotes={(v) => handleFieldChange("insuranceNotes", v)}
              manualSumInsured={itemForm.sumInsured || ""}
              setManualSumInsured={(v) => handleFieldChange("sumInsured", v)}
              manualDestinations={itemForm.destinations || []}
              handleAddDestination={() => handleArrayAdd("destinations", "")}
              handleRemoveDestination={(idx) => handleArrayRemove("destinations", idx)}
              handleDestinationChange={(idx, v) => handleArrayChange("destinations", idx, v)}
              manualStartDate={itemForm.startDate || ""}
              setManualStartDate={(v) => handleFieldChange("startDate", v)}
              manualEndDate={itemForm.endDate || ""}
              setManualEndDate={(v) => handleFieldChange("endDate", v)}
            />
          </div>
        )

      case "Cruise":
      case "Others":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {othersSubCategories.map((sub) => (
                <Button
                  key={sub.id}
                  type="button"
                  variant={itemForm.subCategory === sub.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFieldChange("subCategory", sub.id)}
                  className="gap-2"
                >
                  <span>{sub.icon}</span>
                  {sub.label}
                </Button>
              ))}
            </div>
            <OthersForms
              selectedSubCategory={itemForm.subCategory || ""}
              manualTitle={itemForm.title || ""}
              setManualTitle={(v) => handleFieldChange("title", v)}
              manualDescription={itemForm.description || ""}
              setManualDescription={(v) => handleFieldChange("description", v)}
              manualPrice={itemForm.price || ""}
              setManualPrice={(v) => handleFieldChange("price", v)}
              manualCurrency={itemForm.currency || "USD"}
              setManualCurrency={(v) => handleFieldChange("currency", v)}
              manualImageUrl={itemForm.imageUrl || ""}
              setManualImageUrl={(v) => handleFieldChange("imageUrl", v)}
              manualGiftAmount={itemForm.giftAmount || ""}
              setManualGiftAmount={(v) => handleFieldChange("giftAmount", v)}
              manualServiceCharge={itemForm.serviceCharge || ""}
              setManualServiceCharge={(v) => handleFieldChange("serviceCharge", v)}
              manualProducts={(itemForm.products as any) || []}
              handleAddProduct={() => handleArrayAdd("products", { name: "", price: 0, description: "" })}
              handleRemoveProduct={(idx) => handleArrayRemove("products", idx)}
              handleProductChange={(idx, key, val) => handleObjectArrayChange("products", idx, key, val)}
            />
          </div>
        )

      case "Notes":
      case "Additional Information":
        return (
          <NoteForms
            manualDescription={itemForm.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            errors={{}}
          />
        )

      default:
        return <div>Select a category</div>
    }
  }

  // --- Save Logic ---

  const handleCreate = async () => {
    try {
      setIsSaving(true)

      // Normalize Category to match Schema Enum
      let normalizedCategory = "others"
      let finalSubCategory = itemForm.subCategory

      switch (selectedCategory) {
        case "Flights": normalizedCategory = "flight"; break;
        case "Transfer": normalizedCategory = "transfer"; break;
        case "Hotel": normalizedCategory = "hotel"; break;
        case "Activity": normalizedCategory = "activity"; break;
        case "Meals": normalizedCategory = "meal"; break;
        case "Ancillaries": normalizedCategory = "ancillaries"; break;
        case "Notes": normalizedCategory = "note"; break;
        case "Additional Information":
          normalizedCategory = "note";
          finalSubCategory = "Additional Information";
          break;
        case "Cruise":
          normalizedCategory = "others";
          finalSubCategory = "Cruise";
          break;
        case "Others": normalizedCategory = "others"; break;
        default: normalizedCategory = "others";
      }


      if (!targetLibraryId) {
        toast.error("No library selected. Please create a library first.")
        setIsSaving(false)
        return
      }

      // Base payload consistent with LibraryItem schema
      const newItem: any = {
        title: itemForm.title || `${selectedCategory} Item`,
        libraryCollection: targetLibraryId,
        category: normalizedCategory,
        subCategory: finalSubCategory,
        city: itemForm.location || itemForm.fromCity || (itemForm as any).city, // Heuristic mapping
        country: itemForm.country || itemForm.toCity, // Heuristic mapping
        basePrice: Number(itemForm.price) || 0,
        currency: itemForm.currency || "USD",
        multimedia: itemForm.imageUrl ? [itemForm.imageUrl] : [],
        // Crucial: Store the ENTIRE detailed form state in extraFields for persistence
        extraFields: {
          ...itemForm,
          category: normalizedCategory, // Ensure extraFields also has correct category
          subCategory: finalSubCategory
        }
      }

      if (editingItem) {
        await updateItem(editingItem.id || editingItem._id, newItem)
        toast.success("Item updated successfully")
      } else {
        await createItem(newItem)
        // Trigger credit deduction animation for new library product
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('credits-deducted', { detail: { amount: 1 } }));
        }
        toast.success("Item created successfully")
      }

      onItemCreated()
      onClose()
    } catch (error) {
      console.error("Error creating item:", error)
      toast.error("Failed to save item")
    } finally {
      setIsSaving(false)
    }
  }

  // --- UI Categories ---
  const CATEGORIES = [
    { id: "Flights", icon: Plane },
    { id: "Transfer", icon: Bus },
    { id: "Hotel", icon: Hotel },
    { id: "Activity", icon: Activity },
    { id: "Meals", icon: Utensils },
    { id: "Cruise", icon: Ship },
    { id: "Ancillaries", icon: Box },
    { id: "Others", icon: ShoppingBag },
    { id: "Notes", icon: FileText },
    { id: "Additional Information", icon: Info },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-white sticky top-0 z-10 flex flex-row items-center justify-between space-y-0 gap-4">
          <div className="flex flex-col gap-1 items-start">
            <DialogTitle className="text-xl font-semibold">
              {editingItem ? `Edit ${selectedCategory}` : "Add New Item"}
            </DialogTitle>
            {!editingItem && libraries.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Saving to:</span>
                <select
                  value={targetLibraryId}
                  onChange={(e) => setTargetLibraryId(e.target.value)}
                  className="border-none bg-transparent font-medium text-gray-900 focus:ring-0 cursor-pointer p-0 focus:outline-none"
                >
                  {libraries.map((lib) => (
                    <option key={lib._id} value={lib._id}>
                      {lib.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-full min-h-[500px]">
          {/* Sidebar Categories */}
          <div className="w-full md:w-64 border-r bg-gray-50 p-2 overflow-y-auto">
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id)
                      // Reset form basics if needed, or keep partial data
                      handleFieldChange("category", cat.id.toLowerCase())

                      // Auto-select default subcategories for forms that require it
                      if (cat.id === "Transfer") {
                        handleFieldChange("transferCategory", "airport-transfer")
                      } else if (cat.id === "Ancillaries") {
                        handleFieldChange("subCategory", "visa")
                      }
                    }}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${selectedCategory === cat.id
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {cat.id}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Form Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            <div className="max-w-3xl mx-auto space-y-6">
              {renderFormContent()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSaving} className="bg-black text-white hover:bg-gray-800">
            {isSaving ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
