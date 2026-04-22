import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useState } from "react"

interface FlightFormsProps {
    // Common fields
    manualFromCity: string
    setManualFromCity: (value: string) => void
    manualToCity: string
    setManualToCity: (value: string) => void
    manualTime: string
    setManualTime: (value: string) => void
    manualEndTime: string
    setManualEndTime: (value: string) => void
    manualAirline: string
    setManualAirline: (value: string) => void
    manualClass: string
    setManualClass: (value: string) => void
    manualPrice: number | ""
    setManualPrice: (value: number | "") => void
    manualCurrency: string
    setManualCurrency: (value: string) => void
    manualDuration: string
    setManualDuration: (value: string) => void

    // Optional fields
    manualTitle?: string
    setManualTitle?: (value: string) => void
    manualFlightNumber?: string
    setManualFlightNumber?: (value: string) => void
    manualPnr?: string
    setManualPnr?: (value: string) => void
    manualCheckinBags?: number | ""
    setManualCheckinBags?: (value: number | "") => void
    manualCheckinBagWeight?: string
    setManualCheckinBagWeight?: (value: string) => void
    manualCabinBags?: number | ""
    setManualCabinBags?: (value: number | "") => void
    manualCabinBagWeight?: string
    setManualCabinBagWeight?: (value: string) => void
    manualNumberOfStops?: number
    setManualNumberOfStops?: (value: number) => void
    manualStopLocations?: string[]
    handleAddStopLocation?: () => void
    handleRemoveStopLocation?: (index: number) => void
    handleStopLocationChange?: (index: number, value: string) => void
    manualBookingId?: string
    setManualBookingId?: (value: string) => void
    manualSeatNumber?: string
    setManualSeatNumber?: (value: string) => void
    manualInFlightMeals?: string
    setManualInFlightMeals?: (value: string) => void
    manualAmenities?: string[]
    setManualAmenities?: (value: string[]) => void
    manualRefundable?: string
    setManualRefundable?: (value: string) => void
    manualDescription?: string
    setManualDescription?: (value: string) => void
    manualImageUrl?: string
    setManualImageUrl?: (value: string) => void

    calculateFlightDuration?: (startTime: string, endTime: string) => string
    errors?: Record<string, string>
}

export function FlightForms(props: FlightFormsProps) {
    const {
        manualFromCity,
        setManualFromCity,
        manualToCity,
        setManualToCity,
        manualTime,
        setManualTime,
        manualEndTime,
        setManualEndTime,
        manualAirline,
        setManualAirline,
        manualClass,
        setManualClass,
        manualPrice,
        setManualPrice,
        manualCurrency,
        setManualCurrency,
        manualDuration,
        setManualDuration,
        manualTitle,
        setManualTitle,
        manualFlightNumber,
        setManualFlightNumber,
        manualPnr,
        setManualPnr,
        manualCheckinBags,
        setManualCheckinBags,
        manualCheckinBagWeight,
        setManualCheckinBagWeight,
        manualCabinBags,
        setManualCabinBags,
        manualCabinBagWeight,
        setManualCabinBagWeight,
        manualNumberOfStops,
        setManualNumberOfStops,
        manualStopLocations,
        handleAddStopLocation,
        handleRemoveStopLocation,
        handleStopLocationChange,
        manualBookingId,
        setManualBookingId,
        manualSeatNumber,
        setManualSeatNumber,
        manualInFlightMeals,
        setManualInFlightMeals,
        manualAmenities = [],
        setManualAmenities,
        manualRefundable,
        setManualRefundable,
        manualDescription,
        setManualDescription,
        manualImageUrl,
        setManualImageUrl,
        calculateFlightDuration,
        errors = {},
    } = props

    const [newAmenity, setNewAmenity] = useState("")

    const handleAddAmenity = () => {
        if (newAmenity.trim() && setManualAmenities) {
            if (!manualAmenities.includes(newAmenity.trim())) {
                setManualAmenities([...manualAmenities, newAmenity.trim()])
            }
            setNewAmenity("")
        }
    }

    const handleRemoveAmenity = (amenity: string) => {
        if (setManualAmenities) {
            setManualAmenities(manualAmenities.filter(a => a !== amenity))
        }
    }

    return (
        <>
            {/* Mandatory Fields */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Mandatory Fields
                </h4>
                <div className="space-y-4 pl-4 border-l-2 border-red-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">From</label>
                            <Input
                                value={manualFromCity}
                                onChange={(e) => setManualFromCity(e.target.value)}
                                placeholder="Origin"
                                className={errors.fromCity ? "border-red-500" : ""}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">To</label>
                            <Input
                                value={manualToCity}
                                onChange={(e) => setManualToCity(e.target.value)}
                                placeholder="Destination"
                                className={errors.toCity ? "border-red-500" : ""}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Flight Duration (Auto-calculated)</label>
                        <Input
                            value={calculateFlightDuration ? calculateFlightDuration(manualTime, manualEndTime) || "Enter times to calculate" : manualDuration}
                            readOnly={!!calculateFlightDuration}
                            onChange={calculateFlightDuration ? undefined : (e) => setManualDuration(e.target.value)}
                            placeholder="Calculated from departure & arrival"
                            className="bg-gray-50 cursor-not-allowed"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Airline Name</label>
                        <Input
                            value={manualAirline}
                            onChange={(e) => setManualAirline(e.target.value)}
                            placeholder="e.g. Emirates"
                            className={errors.airlines ? "border-red-500" : ""}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Class</label>
                        <Input
                            value={manualClass}
                            onChange={(e) => setManualClass(e.target.value)}
                            placeholder="e.g. Economy"
                            className={errors.flightClass ? "border-red-500" : ""}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Price</label>
                        <div className="flex gap-2">
                            <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="AED">AED (د.إ)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                value={manualPrice}
                                onChange={(e) => setManualPrice(Number(e.target.value) || "")}
                                placeholder="0.00"
                                className={`flex-1 ${errors.price ? "border-red-500" : ""}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Departure Time</label>
                            <Input
                                type="time"
                                value={manualTime}
                                onChange={(e) => setManualTime(e.target.value)}
                                className={errors.time ? "border-red-500" : ""}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Arrival Time</label>
                            <Input
                                type="time"
                                value={manualEndTime}
                                onChange={(e) => setManualEndTime(e.target.value)}
                                className={errors.endTime ? "border-red-500" : ""}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Optional Fields */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    Optional Fields
                </h4>
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    {/* Luggage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="checkinBags" className="text-sm font-medium">Check-in Luggage</label>
                            <div className="flex gap-2">
                                <Input
                                    id="checkinBags"
                                    type="number"
                                    placeholder="Count"
                                    value={manualCheckinBags !== undefined ? manualCheckinBags : ""}
                                    onChange={(e) => setManualCheckinBags?.(e.target.value === "" ? "" : Number(e.target.value))}
                                    min={0}
                                    className="w-20"
                                />
                                <Input
                                    id="checkinBagWeight"
                                    placeholder="Weight (e.g. 23kg)"
                                    value={manualCheckinBagWeight || ""}
                                    onChange={(e) => setManualCheckinBagWeight?.(e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="cabinBags" className="text-sm font-medium">Cabin Luggage</label>
                            <div className="flex gap-2">
                                <Input
                                    id="cabinBags"
                                    type="number"
                                    placeholder="Count"
                                    value={manualCabinBags !== undefined ? manualCabinBags : ""}
                                    onChange={(e) => setManualCabinBags?.(e.target.value === "" ? "" : Number(e.target.value))}
                                    min={0}
                                    className="w-20"
                                />
                                <Input
                                    id="cabinBagWeight"
                                    placeholder="Weight (e.g. 7kg)"
                                    value={manualCabinBagWeight || ""}
                                    onChange={(e) => setManualCabinBagWeight?.(e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="bookingId" className="text-sm font-medium">Booking ID (Optional)</label>
                            <Input
                                id="bookingId"
                                value={manualBookingId || ""}
                                onChange={(e) => setManualBookingId?.(e.target.value)}
                                placeholder="e.g. XYZ123"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="seatNumber" className="text-sm font-medium">Seat No. (Optional)</label>
                            <Input
                                id="seatNumber"
                                value={manualSeatNumber || ""}
                                onChange={(e) => setManualSeatNumber?.(e.target.value)}
                                placeholder="e.g. 12A"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="inFlightMeals" className="text-sm font-medium">Meals (Optional)</label>
                            <Input
                                id="inFlightMeals"
                                value={manualInFlightMeals || ""}
                                onChange={(e) => setManualInFlightMeals?.(e.target.value)}
                                placeholder="e.g. Veg, Non-Veg"
                            />
                        </div>
                    </div>

                    {setManualTitle && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Flight Title</label>
                            <Input
                                value={manualTitle || ""}
                                onChange={(e) => setManualTitle(e.target.value)}
                                placeholder="e.g. Flight to Paris"
                            />
                        </div>
                    )}

                    {/* Stops */}
                    {setManualNumberOfStops && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Number of Stops</label>
                            <Input
                                type="number"
                                value={manualNumberOfStops || 0}
                                onChange={(e) => setManualNumberOfStops(Number(e.target.value) || 0)}
                                placeholder="0 for non-stop"
                                min="0"
                            />
                        </div>
                    )}

                    {(manualNumberOfStops && manualNumberOfStops > 0 && manualStopLocations) && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Stop Locations</label>
                            <div className="space-y-2">
                                {manualStopLocations.map((stop, idx) => (
                                    <Input
                                        key={idx}
                                        value={stop}
                                        onChange={(e) => handleStopLocationChange?.(idx, e.target.value)}
                                        placeholder={`Stop ${idx + 1} location (e.g. Dubai)`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {setManualFlightNumber && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Flight No.</label>
                            <Input
                                value={manualFlightNumber || ""}
                                onChange={(e) => setManualFlightNumber(e.target.value)}
                                placeholder="e.g. EK123"
                            />
                        </div>
                    )}

                    {setManualPnr && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">PNR Number</label>
                            <Input
                                value={manualPnr || ""}
                                onChange={(e) => setManualPnr(e.target.value)}
                                placeholder="Enter PNR"
                            />
                        </div>
                    )}

                    {/* Amenities */}
                    {setManualAmenities && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Amenities</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {manualAmenities.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="px-2 py-1">
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveAmenity(tag)}
                                            className="ml-2 hover:text-red-500 focus:outline-none"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add amenity"
                                    value={newAmenity}
                                    onChange={(e) => setNewAmenity(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddAmenity()
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={handleAddAmenity}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {setManualRefundable && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Refundable / Non refundable</label>
                            <Input
                                value={manualRefundable || ""}
                                onChange={(e) => setManualRefundable(e.target.value)}
                                placeholder="e.g. Refundable"
                            />
                        </div>
                    )}

                    {setManualDescription && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={manualDescription || ""}
                                onChange={(e) => setManualDescription(e.target.value)}
                                placeholder="Add description"
                            />
                        </div>
                    )}

                    {setManualImageUrl && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Image URL</label>
                            <Input
                                value={manualImageUrl || ""}
                                onChange={(e) => setManualImageUrl(e.target.value)}
                                placeholder="Enter image URL"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
