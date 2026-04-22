"use client"

import { useState, useEffect } from "react"
import { ListForms } from "./list-forms"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { IItineraryEvent } from "@/models/Itinerary"

// Import Shared Forms
import { FlightForms } from "./flight-forms"
import { HotelForms } from "./hotel-forms"
import { MealForms } from "./meal-forms"
import { ActivityForms } from "./activity-forms"
import { NoteForms } from "./note-forms"
import { ImageForms } from "./image-forms"
import { TransferForms } from "./transfer-forms"
import { AncillariesForms } from "./ancillaries-forms"
import { OthersForms } from "./others-forms"
import { CruiseForms } from "./cruise-forms"
import { transferSubCategories, ancillariesSubCategories } from "./constants"

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: IItineraryEvent
  onSave: (updatedEvent: IItineraryEvent) => void
}

export function EditEventModal({ isOpen, onClose, event, onSave }: EditEventModalProps) {
  const [editedEvent, setEditedEvent] = useState<IItineraryEvent>(event)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (event) {
      setEditedEvent(event)
    }
    setValidationErrors({})
  }, [event, isOpen])

  if (!editedEvent) return null

  const handleFieldChange = (field: keyof IItineraryEvent, value: any) => {
    setEditedEvent((prev) => ({ ...prev, [field]: value }))
    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {}

    // Safety check for category
    if (!editedEvent.category) {
      errors.category = "Category is required"
    }

    // Add specific validation logic here if needed (e.g. required fields per category)
    // For now keeping it simple as per original implementation

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (validateFields()) {
      onSave(editedEvent)
      onClose()
    }
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

  const renderFields = () => {
    switch (editedEvent.category) {
      case "flight":
        return (
          <FlightForms
            manualFromCity={editedEvent.fromCity || ""}
            setManualFromCity={(v) => handleFieldChange("fromCity", v)}
            manualToCity={editedEvent.toCity || ""}
            setManualToCity={(v) => handleFieldChange("toCity", v)}
            manualTime={editedEvent.time || editedEvent.startTime || ""}
            setManualTime={(v) => handleFieldChange("time", v)}
            manualEndTime={editedEvent.endTime || ""}
            setManualEndTime={(v) => handleFieldChange("endTime", v)}
            manualAirline={editedEvent.airlines || ""}
            setManualAirline={(v) => handleFieldChange("airlines", v)}
            manualClass={editedEvent.flightClass || ""}
            setManualClass={(v) => handleFieldChange("flightClass", v)}
            manualPrice={editedEvent.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={editedEvent.currency || "INR"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            manualDuration={editedEvent.duration || ""}
            setManualDuration={(v) => handleFieldChange("duration", v)}
            manualTitle={editedEvent.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualFlightNumber={editedEvent.flightNumber || ""}
            setManualFlightNumber={(v) => handleFieldChange("flightNumber", v)}
            manualPnr={editedEvent.pnr || ""}
            setManualPnr={(v) => handleFieldChange("pnr", v)}
            manualCheckinBags={editedEvent.checkinBags !== undefined ? editedEvent.checkinBags : ""}
            setManualCheckinBags={(v) => handleFieldChange("checkinBags", v)}
            manualCheckinBagWeight={editedEvent.checkinBagWeight || ""}
            setManualCheckinBagWeight={(v) => handleFieldChange("checkinBagWeight", v)}
            manualCabinBags={editedEvent.cabinBags !== undefined ? editedEvent.cabinBags : ""}
            setManualCabinBags={(v) => handleFieldChange("cabinBags", v)}
            manualCabinBagWeight={editedEvent.cabinBagWeight || ""}
            setManualCabinBagWeight={(v) => handleFieldChange("cabinBagWeight", v)}
            manualNumberOfStops={editedEvent.numberOfStops || 0}
            setManualNumberOfStops={(v) => {
              handleFieldChange("numberOfStops", v)
              // Adjust stop locations array size
              const currentLocations = editedEvent.stopLocations || []
              if (v > currentLocations.length) {
                handleFieldChange("stopLocations", [...currentLocations, ...Array(v - currentLocations.length).fill("")])
              } else if (v < currentLocations.length) {
                handleFieldChange("stopLocations", currentLocations.slice(0, v))
              }
            }}
            manualStopLocations={editedEvent.stopLocations || []}
            handleAddStopLocation={() => handleFieldChange("stopLocations", [...(editedEvent.stopLocations || []), ""])}
            handleRemoveStopLocation={(idx) => handleFieldChange("stopLocations", (editedEvent.stopLocations || []).filter((_, i) => i !== idx))}
            handleStopLocationChange={(idx, value) => {
              const updated = [...(editedEvent.stopLocations || [])]
              updated[idx] = value
              handleFieldChange("stopLocations", updated)
            }}
            manualBookingId={editedEvent.bookingId || ""}
            setManualBookingId={(v) => handleFieldChange("bookingId", v)}
            manualSeatNumber={editedEvent.seatNumber || ""}
            setManualSeatNumber={(v) => handleFieldChange("seatNumber", v)}
            manualInFlightMeals={editedEvent.inFlightMeals || ""}
            setManualInFlightMeals={(v) => handleFieldChange("inFlightMeals", v)}
            manualAmenities={editedEvent.amenities || []}
            setManualAmenities={(v) => handleFieldChange("amenities", v)}
            manualRefundable={editedEvent.refundable || ""}
            setManualRefundable={(v) => handleFieldChange("refundable", v)}
            manualDescription={editedEvent.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            manualImageUrl={editedEvent.imageUrl || ""}
            setManualImageUrl={(v) => handleFieldChange("imageUrl", v)}
            calculateFlightDuration={calculateFlightDuration}
            errors={validationErrors}
          />
        )

      case "hotel":
        return (
          <HotelForms
            manualTitle={editedEvent.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualRoomCategory={(editedEvent as any).roomCategory || ""} // Cast as any until verified in model
            setManualRoomCategory={(v) => handleFieldChange("roomCategory" as keyof IItineraryEvent, v)}
            manualLocation={editedEvent.location || ""}
            setManualLocation={(v) => handleFieldChange("location", v)}
            manualHotelRating={(editedEvent as any).hotelRating !== undefined ? (editedEvent as any).hotelRating : ""}
            setManualHotelRating={(v) => handleFieldChange("hotelRating" as keyof IItineraryEvent, v)}
            manualPrice={editedEvent.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={editedEvent.currency || "INR"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            manualAdults={editedEvent.adults !== undefined ? editedEvent.adults : ""}
            setManualAdults={(v) => handleFieldChange("adults", v)}
            manualChildren={editedEvent.children !== undefined ? editedEvent.children : ""}
            setManualChildren={(v) => handleFieldChange("children", v)}
            manualHotelName={editedEvent.hotelName || ""}
            setManualHotelName={(v) => handleFieldChange("hotelName", v)}
            manualNights={editedEvent.nights !== undefined ? editedEvent.nights : ""}
            setManualNights={(v) => handleFieldChange("nights", v)}
            manualCheckIn={editedEvent.checkIn || ""}
            setManualCheckIn={(v) => handleFieldChange("checkIn", v)}
            manualCheckOut={editedEvent.checkOut || ""}
            setManualCheckOut={(v) => handleFieldChange("checkOut", v)}
            manualMealPlan={editedEvent.mealPlan || ""}
            setManualMealPlan={(v) => handleFieldChange("mealPlan", v)}
            manualPropertyType={(editedEvent as any).propertyType || ""}
            setManualPropertyType={(v) => handleFieldChange("propertyType" as keyof IItineraryEvent, v)}
            manualAmenities={editedEvent.amenities || []}
            handleAddManualAmenity={() => handleFieldChange("amenities", [...(editedEvent.amenities || []), ""])}
            handleRemoveManualAmenity={(idx) => handleFieldChange("amenities", (editedEvent.amenities || []).filter((_, i) => i !== idx))}
            handleManualAmenitiesChange={(idx, val) => {
              const updated = [...(editedEvent.amenities || [])]
              updated[idx] = val
              handleFieldChange("amenities", updated)
            }}
            manualHighlights={(editedEvent as any).highlights || []}
            handleAddManualHighlight={() => handleFieldChange("highlights" as keyof IItineraryEvent, [...((editedEvent as any).highlights || []), ""])}
            handleRemoveManualHighlight={(idx) => handleFieldChange("highlights" as keyof IItineraryEvent, ((editedEvent as any).highlights || []).filter((_: any, i: number) => i !== idx))}
            handleManualHighlightsChange={(idx, val) => {
              const updated = [...((editedEvent as any).highlights || [])]
              updated[idx] = val
              handleFieldChange("highlights" as keyof IItineraryEvent, updated)
            }}
            manualImageUrl={editedEvent.imageUrl || ""}
            setManualImageUrl={(v) => handleFieldChange("imageUrl", v)}
            manualRefundable={editedEvent.refundable || ""}
            setManualRefundable={(v) => handleFieldChange("refundable", v)}
            manualAddress={editedEvent.address || ""}
            setManualAddress={(v) => handleFieldChange("address", v)}
            manualHotelLink={editedEvent.hotelLink || ""}
            setManualHotelLink={(v) => handleFieldChange("hotelLink", v)}
            manualDescription={editedEvent.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            manualConfirmationNumber={editedEvent.confirmationNumber || ""}
            setManualConfirmationNumber={(v) => handleFieldChange("confirmationNumber", v)}
            errors={validationErrors}
          />
        )

      case "meal":
        return (
          <MealForms
            manualMeals={editedEvent.meals || []}
            setManualMeals={(v) => handleFieldChange("meals", v)}
            manualCustomMealDescription={editedEvent.customMealDescription || ""}
            setManualCustomMealDescription={(v) => handleFieldChange("customMealDescription", v)}
            manualPrice={editedEvent.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={editedEvent.currency || "INR"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            errors={validationErrors}
          />
        )

      case "activity":
        return (
          <ActivityForms
            manualTitle={editedEvent.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualDescription={editedEvent.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            manualDuration={editedEvent.duration || ""}
            setManualDuration={(v) => handleFieldChange("duration", v)}
            manualTime={editedEvent.time || editedEvent.startTime || ""}
            setManualTime={(v) => handleFieldChange("time", v)}
            manualDifficulty={editedEvent.difficulty || ""}
            setManualDifficulty={(v) => handleFieldChange("difficulty", v)}
            manualCapacity={editedEvent.capacity !== undefined ? editedEvent.capacity : ""}
            setManualCapacity={(v) => handleFieldChange("capacity", v)}
            manualLocation={editedEvent.location || ""}
            setManualLocation={(v) => handleFieldChange("location", v)}
            manualPrice={editedEvent.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={editedEvent.currency || "INR"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            errors={validationErrors}
          />
        )

      case "note":
        return (
          <NoteForms
            manualDescription={editedEvent.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            errors={validationErrors}
          />
        )

      case "image":
        return (
          <ImageForms
            manualTitle={editedEvent.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualImageUrl={editedEvent.imageUrl || ""}
            setManualImageUrl={(v) => handleFieldChange("imageUrl", v)}
            manualImageCaption={(editedEvent as any).imageCaption || ""}
            setManualImageCaption={(v) => handleFieldChange("imageCaption" as keyof IItineraryEvent, v)}
            manualImageAlt={(editedEvent as any).imageAlt || ""}
            setManualImageAlt={(v) => handleFieldChange("imageAlt" as keyof IItineraryEvent, v)}
            manualDescription={editedEvent.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            errors={validationErrors}
          />
        )

      case "transfer":
        return (
          <TransferForms
            manualFromCity={editedEvent.fromCity || ""}
            setManualFromCity={(v) => handleFieldChange("fromCity", v)}
            manualToCity={editedEvent.toCity || ""}
            setManualToCity={(v) => handleFieldChange("toCity", v)}
            manualVehicleType={editedEvent.vehicleType || ""}
            setManualVehicleType={(v) => handleFieldChange("vehicleType", v)}
            manualPrice={editedEvent.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={editedEvent.currency || "INR"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            manualDescription={editedEvent.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            selectedSubCategory={(editedEvent as any).transferCategory || ""}
            manualTransferCategory={(editedEvent as any).transferCategory || ""}
            setManualTransferCategory={(v) => handleFieldChange("transferCategory" as keyof IItineraryEvent, v)}
            transferSubCategories={transferSubCategories}
            manualTitle={editedEvent.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualImageUrl={editedEvent.imageUrl || ""}
            setManualImageUrl={(v) => handleFieldChange("imageUrl", v)}
            // Extended Fields
            manualPickupDrop={editedEvent.pickupDrop || "pickup"}
            setManualPickupDrop={(v) => handleFieldChange("pickupDrop" as keyof IItineraryEvent, v)}
            manualAirportName={editedEvent.airportName || ""}
            setManualAirportName={(v) => handleFieldChange("airportName" as keyof IItineraryEvent, v)}
            manualTransferType={editedEvent.transferType || "private"}
            setManualTransferType={(v) => handleFieldChange("transferType" as keyof IItineraryEvent, v)}
            manualVehicleCapacity={editedEvent.capacity !== undefined ? editedEvent.capacity : ""}
            setManualVehicleCapacity={(v) => handleFieldChange("capacity", v)}
            manualPricePerPax={editedEvent.price || ""}
            manualPickupTime={editedEvent.pickupTime || ""}
            setManualPickupTime={(v) => handleFieldChange("pickupTime" as keyof IItineraryEvent, v)}
            manualDropTime={editedEvent.dropTime || ""}
            setManualDropTime={(v) => handleFieldChange("dropTime" as keyof IItineraryEvent, v)}
            manualNoOfHours={editedEvent.noOfHours !== undefined ? editedEvent.noOfHours : ""}
            setManualNoOfHours={(v) => handleFieldChange("noOfHours" as keyof IItineraryEvent, v)}
            manualNoOfDays={editedEvent.noOfDays !== undefined ? editedEvent.noOfDays : ""}
            setManualNoOfDays={(v) => handleFieldChange("noOfDays" as keyof IItineraryEvent, v)}
            manualCarType={editedEvent.vehicleType || ""}
            setManualCarType={(v) => handleFieldChange("vehicleType", v)}
            manualFuelType={editedEvent.fuelType || ""}
            setManualFuelType={(v) => handleFieldChange("fuelType" as keyof IItineraryEvent, v)}
            manualCarModel={editedEvent.carModel || ""}
            setManualCarModel={(v) => handleFieldChange("carModel" as keyof IItineraryEvent, v)}
            manualTransmission={editedEvent.transmission || ""}
            setManualTransmission={(v) => handleFieldChange("transmission" as keyof IItineraryEvent, v)}
            manualTravelDuration={editedEvent.duration || ""}
            setManualTravelDuration={(v) => handleFieldChange("duration", v)}
            manualDepartureTime={editedEvent.startTime || ""}
            setManualDepartureTime={(v) => handleFieldChange("startTime", v)}
            manualArrivalTime={editedEvent.endTime || ""}
            setManualArrivalTime={(v) => handleFieldChange("endTime", v)}
            manualClass={editedEvent.transferClass || ""}
            setManualClass={(v) => handleFieldChange("transferClass" as keyof IItineraryEvent, v)}
            manualBusNumber={editedEvent.busNumber || ""}
            setManualBusNumber={(v) => handleFieldChange("busNumber" as keyof IItineraryEvent, v)}
            manualTrainNumber={editedEvent.trainNumber || ""}
            setManualTrainNumber={(v) => handleFieldChange("trainNumber" as keyof IItineraryEvent, v)}
            manualPnr={editedEvent.pnr || ""}
            setManualPnr={(v) => handleFieldChange("pnr" as keyof IItineraryEvent, v)}
            manualRefundable={editedEvent.refundable || ""}
            setManualRefundable={(v) => handleFieldChange("refundable", v)}
            manualLink={editedEvent.transferLink || ""}
            setManualLink={(v) => handleFieldChange("transferLink" as keyof IItineraryEvent, v)}
            manualAmenities={editedEvent.amenities || []}
            setManualAmenities={(v) => handleFieldChange("amenities", v)}
            // Arrays
            manualStopsList={(editedEvent as any).stopsList || []}
            handleAddStop={() => {
              const current = (editedEvent as any).stopsList || []
              handleFieldChange("stopsList", [...current, ""])
            }}
            handleRemoveStop={(index: number) => {
              const current = (editedEvent as any).stopsList || []
              handleFieldChange("stopsList", current.filter((_: any, i: number) => i !== index))
            }}
            handleStopChange={(index: number, value: string) => {
              const current = (editedEvent as any).stopsList || []
              const updated = [...current]
              updated[index] = value
              handleFieldChange("stopsList", updated)
            }}
            manualAdditionalVehicles={(editedEvent as any).additionalVehicles || []}
            handleAddVehicle={() => {
              const current = (editedEvent as any).additionalVehicles || []
              handleFieldChange("additionalVehicles", [...current, { vehicleType: "", capacity: 0, price: 0 }])
            }}
            handleRemoveVehicle={(index: number) => {
              const current = (editedEvent as any).additionalVehicles || []
              handleFieldChange("additionalVehicles", current.filter((_: any, i: number) => i !== index))
            }}
            handleVehicleChange={(index: number, field: string, value: any) => {
              const current = (editedEvent as any).additionalVehicles || []
              const updated = [...current]
              updated[index] = { ...updated[index], [field]: value }
              handleFieldChange("additionalVehicles", updated)
            }}
          />
        )

      case "ancillaries":
        return (
          <AncillariesForms
            selectedSubCategory={(editedEvent as any).subCategory || ""} // Fix: Pass required subCategory
            ancillariesSubCategories={ancillariesSubCategories}
            manualTitle={editedEvent.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualDescription={editedEvent.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            manualPrice={editedEvent.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={editedEvent.currency || "INR"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            manualImageUrl={editedEvent.imageUrl || ""}
            setManualImageUrl={(v) => handleFieldChange("imageUrl", v)}
            // Visa fields
            manualVisaCountry={(editedEvent as any).visaCountry || ""}
            setManualVisaCountry={(v) => handleFieldChange("visaCountry" as keyof IItineraryEvent, v)}
            manualVisaType={(editedEvent as any).visaType || ""}
            setManualVisaType={(v) => handleFieldChange("visaType" as keyof IItineraryEvent, v)}
            manualVisaDuration={(editedEvent as any).visaDuration || ""}
            setManualVisaDuration={(v) => handleFieldChange("visaDuration" as keyof IItineraryEvent, v)}
            // Insurance fields
            manualInsuranceProvider={(editedEvent as any).insuranceProvider || ""}
            setManualInsuranceProvider={(v) => handleFieldChange("insuranceProvider" as keyof IItineraryEvent, v)}
            manualPolicyNumber={(editedEvent as any).policyNumber || ""}
            setManualPolicyNumber={(v) => handleFieldChange("policyNumber" as keyof IItineraryEvent, v)}
            manualCoverageDetails={(editedEvent as any).coverageDetails || ""}
            setManualCoverageDetails={(v) => handleFieldChange("coverageDetails" as keyof IItineraryEvent, v)}
            // Forex fields
            manualForexCurrency={(editedEvent as any).forexCurrency || ""}
            setManualForexCurrency={(v) => handleFieldChange("forexCurrency" as keyof IItineraryEvent, v)}
            manualExchangeRate={(editedEvent as any).exchangeRate || ""}
            setManualExchangeRate={(v) => handleFieldChange("exchangeRate" as keyof IItineraryEvent, v)}
            manualAmount={(editedEvent as any).amount || ""}
            setManualAmount={(v) => handleFieldChange("amount" as keyof IItineraryEvent, v)}
            // Sim Card fields
            manualSimProvider={(editedEvent as any).simProvider || ""}
            setManualSimProvider={(v) => handleFieldChange("simProvider" as keyof IItineraryEvent, v)}
            manualDataLimit={(editedEvent as any).dataLimit || ""}
            setManualDataLimit={(v) => handleFieldChange("dataLimit" as keyof IItineraryEvent, v)}
            manualValidity={(editedEvent as any).validity || ""}
            setManualValidity={(v) => handleFieldChange("validity" as keyof IItineraryEvent, v)}
            // Other fields needed for full parity?
            manualNoOfTravellers={(editedEvent as any).noOfTravellers || ""}
            setManualNoOfTravellers={(v) => handleFieldChange("noOfTravellers" as keyof IItineraryEvent, v)}
            manualInsuranceType={(editedEvent as any).insuranceType || ""}
            setManualInsuranceType={(v) => handleFieldChange("insuranceType" as keyof IItineraryEvent, v)}
            manualNotes={(editedEvent as any).insuranceNotes || ""}
            setManualNotes={(v) => handleFieldChange("insuranceNotes" as keyof IItineraryEvent, v)}
            manualSumInsured={(editedEvent as any).sumInsured || ""}
            setManualSumInsured={(v) => handleFieldChange("sumInsured" as keyof IItineraryEvent, v)}
            manualDestinations={(editedEvent as any).destinations || []}
            handleAddDestination={() => {
              const current = (editedEvent as any).destinations || []
              handleFieldChange("destinations" as keyof IItineraryEvent, [...current, ""])
            }}
            handleRemoveDestination={(index: number) => {
              const current = (editedEvent as any).destinations || []
              handleFieldChange("destinations" as keyof IItineraryEvent, current.filter((_: any, i: number) => i !== index))
            }}
            handleDestinationChange={(index: number, value: string) => {
              const current = (editedEvent as any).destinations || []
              const updated = [...current]
              updated[index] = value
              handleFieldChange("destinations" as keyof IItineraryEvent, updated)
            }}
            manualStartDate={(editedEvent as any).startDate || ""}
            setManualStartDate={(v) => handleFieldChange("startDate" as keyof IItineraryEvent, v)}
            manualEndDate={(editedEvent as any).endDate || ""}
            setManualEndDate={(v) => handleFieldChange("endDate" as keyof IItineraryEvent, v)}
          />
        )

      case "others":
        return (
          <OthersForms
            selectedSubCategory={(editedEvent as any).subCategory || ""} // Fix: Pass required subCategory
            manualTitle={editedEvent.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualDescription={editedEvent.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            manualPrice={editedEvent.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={editedEvent.currency || "INR"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            manualImageUrl={editedEvent.imageUrl || ""}
            setManualImageUrl={(v) => handleFieldChange("imageUrl", v)}
            manualGiftAmount={(editedEvent as any).giftAmount || ""}
            setManualGiftAmount={(v) => handleFieldChange("giftAmount" as keyof IItineraryEvent, v)}
            manualServiceCharge={(editedEvent as any).serviceCharge || ""}
            setManualServiceCharge={(v) => handleFieldChange("serviceCharge" as keyof IItineraryEvent, v)}
            manualProducts={(editedEvent as any).products || []}
            handleAddProduct={() => {
              const current = (editedEvent as any).products || []
              handleFieldChange("products" as keyof IItineraryEvent, [...current, { name: "", price: 0, description: "" }])
            }}
            handleRemoveProduct={(index: number) => {
              const current = (editedEvent as any).products || []
              handleFieldChange("products" as keyof IItineraryEvent, current.filter((_: any, i: number) => i !== index))
            }}
            handleProductChange={(index: number, field: string, value: any) => {
              const current = (editedEvent as any).products || []
              const updated = [...current]
              updated[index] = { ...updated[index], [field]: value }
              handleFieldChange("products" as keyof IItineraryEvent, updated)
            }}
          />
        )

      case "list":
      case "additionalInformation":
        return (
          <ListForms
            manualTitle={editedEvent.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualListItems={editedEvent.listItems || []}
            handleAddListItem={() => handleFieldChange("listItems", [...(editedEvent.listItems || []), ""])}
            handleRemoveListItem={(idx) => handleFieldChange("listItems", (editedEvent.listItems || []).filter((_, i) => i !== idx))}
            handleListItemChange={(idx, val) => {
              const updated = [...(editedEvent.listItems || [])]
              updated[idx] = val
              handleFieldChange("listItems", updated)
            }}
            errors={validationErrors}
          />
        )

      case "cruise":
        return (
          <CruiseForms
            manualTitle={editedEvent.title || ""}
            setManualTitle={(v) => handleFieldChange("title", v)}
            manualDescription={editedEvent.description || ""}
            setManualDescription={(v) => handleFieldChange("description", v)}
            manualLocation={editedEvent.location || ""}
            setManualLocation={(v) => handleFieldChange("location", v)}
            manualTime={editedEvent.time || ""}
            setManualTime={(v) => handleFieldChange("time", v)}
            manualPrice={editedEvent.price || ""}
            setManualPrice={(v) => handleFieldChange("price", v)}
            manualCurrency={editedEvent.currency || "INR"}
            setManualCurrency={(v) => handleFieldChange("currency", v)}
            manualHighlights={(editedEvent as any).highlights || []}
            handleAddHighlight={() => handleFieldChange("highlights" as keyof IItineraryEvent, [...((editedEvent as any).highlights || []), ""])}
            handleRemoveHighlight={(idx) => handleFieldChange("highlights" as keyof IItineraryEvent, ((editedEvent as any).highlights || []).filter((_: any, i: number) => i !== idx))}
            handleHighlightChange={(idx, val) => {
              const updated = [...((editedEvent as any).highlights || [])]
              updated[idx] = val
              handleFieldChange("highlights" as keyof IItineraryEvent, updated)
            }}
            errors={validationErrors}
          />
        )

      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Editing for category "{editedEvent.category}" is not yet supported.
            </AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Edit {editedEvent.category ? editedEvent.category.charAt(0).toUpperCase() + editedEvent.category.slice(1) : "Event"}</DialogTitle>
          <DialogDescription className="sr-only">
            Edit the details of your itinerary event.
          </DialogDescription>
        </DialogHeader>

        {Object.keys(validationErrors).length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the validation errors below.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          {renderFields()}
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm font-medium"
          >
            Save Changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
