import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HotelFormsProps {
    // Mandatory fields
    manualTitle: string
    setManualTitle: (value: string) => void
    manualRoomCategory: string
    setManualRoomCategory: (value: string) => void
    manualLocation: string
    setManualLocation: (value: string) => void
    manualHotelRating: number | ""
    setManualHotelRating: (value: number | "") => void
    manualPrice: number | ""
    setManualPrice: (value: number | "") => void
    manualCurrency: string
    setManualCurrency: (value: string) => void
    manualAdults: number | ""
    setManualAdults: (value: number | "") => void
    manualChildren: number | ""
    setManualChildren: (value: number | "") => void

    // Optional fields
    manualHotelName?: string
    setManualHotelName?: (value: string) => void
    manualNights?: number | ""
    setManualNights?: (value: number | "") => void
    manualCheckIn?: string
    setManualCheckIn?: (value: string) => void
    manualCheckOut?: string
    setManualCheckOut?: (value: string) => void
    manualMealPlan?: string
    setManualMealPlan?: (value: string) => void
    manualPropertyType?: string
    setManualPropertyType?: (value: string) => void
    manualAmenities?: string[]
    handleAddManualAmenity?: () => void
    handleRemoveManualAmenity?: (index: number) => void
    handleManualAmenitiesChange?: (index: number, value: string) => void
    manualHighlights?: string[]
    handleAddManualHighlight?: () => void
    handleRemoveManualHighlight?: (index: number) => void
    handleManualHighlightsChange?: (index: number, value: string) => void
    manualImageUrl?: string
    setManualImageUrl?: (value: string) => void
    manualRefundable?: string
    setManualRefundable?: (value: string) => void
    manualAddress?: string
    setManualAddress?: (value: string) => void
    manualHotelLink?: string
    setManualHotelLink?: (value: string) => void
    manualDescription?: string
    setManualDescription?: (value: string) => void
    manualConfirmationNumber?: string
    setManualConfirmationNumber?: (value: string) => void

    errors?: Record<string, string>
}

export function HotelForms(props: HotelFormsProps) {
    const {
        manualTitle,
        setManualTitle,
        manualRoomCategory,
        setManualRoomCategory,
        manualLocation,
        setManualLocation,
        manualHotelRating,
        setManualHotelRating,
        manualPrice,
        setManualPrice,
        manualCurrency,
        setManualCurrency,
        manualAdults,
        setManualAdults,
        manualChildren,
        setManualChildren,
        manualHotelName,
        setManualHotelName,
        manualNights,
        setManualNights,
        manualCheckIn,
        setManualCheckIn,
        manualCheckOut,
        setManualCheckOut,
        manualMealPlan,
        setManualMealPlan,
        manualPropertyType,
        setManualPropertyType,
        manualAmenities = [],
        handleAddManualAmenity,
        handleRemoveManualAmenity,
        handleManualAmenitiesChange,
        manualHighlights = [],
        handleAddManualHighlight,
        handleRemoveManualHighlight,
        handleManualHighlightsChange,
        manualImageUrl,
        setManualImageUrl,
        manualRefundable,
        setManualRefundable,
        manualAddress,
        setManualAddress,
        manualHotelLink,
        setManualHotelLink,
        manualDescription,
        setManualDescription,
        manualConfirmationNumber,
        setManualConfirmationNumber,
        errors = {},
    } = props

    return (
        <>
            {/* Mandatory Fields */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Mandatory Fields
                </h4>
                <div className="space-y-4 pl-4 border-l-2 border-red-200">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Hotel Title</label>
                        <Input
                            value={manualTitle}
                            onChange={(e) => setManualTitle(e.target.value)}
                            placeholder="Title for Hotel"
                            className={errors.title ? "border-red-500" : ""}
                        />
                    </div>

                    {setManualHotelName && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Hotel Name</label>
                            <Input
                                value={manualHotelName}
                                onChange={(e) => setManualHotelName(e.target.value)}
                                placeholder="e.g. Taj Palace Hotel"
                                className={errors.hotelName ? "border-red-500" : ""}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Room Type</label>
                        <Input
                            value={manualRoomCategory}
                            onChange={(e) => setManualRoomCategory(e.target.value)}
                            placeholder="e.g. Deluxe"
                            className={errors.roomCategory ? "border-red-500" : ""}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                            value={manualLocation}
                            onChange={(e) => setManualLocation(e.target.value)}
                            placeholder="City / Area"
                            className={errors.location ? "border-red-500" : ""}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Hotel rating(stars)</label>
                        <Input
                            type="number"
                            value={manualHotelRating}
                            onChange={(e) => setManualHotelRating(Number(e.target.value) || "")}
                            placeholder="e.g. 5"
                            className={errors.hotelRating ? "border-red-500" : ""}
                        />
                    </div>

                    {setManualMealPlan && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Meal Plan</label>
                            <Input
                                value={manualMealPlan}
                                onChange={(e) => setManualMealPlan(e.target.value)}
                                placeholder="e.g. CP / MAP / AP / EP"
                                className={errors.mealPlan ? "border-red-500" : ""}
                            />
                        </div>
                    )}

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
                            <label className="text-sm font-medium">No. of Adult</label>
                            <Input
                                type="number"
                                value={manualAdults}
                                onChange={(e) => setManualAdults(Number(e.target.value) || "")}
                                placeholder="Adults"
                                className={errors.adults ? "border-red-500" : ""}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">No. of Child</label>
                            <Input
                                type="number"
                                value={manualChildren}
                                onChange={(e) => setManualChildren(Number(e.target.value) || "")}
                                placeholder="Children"
                                className={errors.children ? "border-red-500" : ""}
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
                    {setManualNights && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">No. of Nights</label>
                            <Input
                                type="number"
                                value={manualNights}
                                onChange={(e) => setManualNights(Number(e.target.value) || "")}
                                placeholder="No. of nights"
                            />
                        </div>
                    )}

                    {(setManualCheckIn && setManualCheckOut) && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Check-in Time</label>
                                <Input
                                    type="time"
                                    value={manualCheckIn}
                                    onChange={(e) => setManualCheckIn(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Check-out Time</label>
                                <Input
                                    type="time"
                                    value={manualCheckOut}
                                    onChange={(e) => setManualCheckOut(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {setManualPropertyType && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Property Type</label>
                            <Input
                                value={manualPropertyType}
                                onChange={(e) => setManualPropertyType(e.target.value)}
                                placeholder="e.g. Resort, Villa"
                            />
                        </div>
                    )}

                    {handleManualAmenitiesChange && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Amenities</label>
                            <div className="space-y-2">
                                {manualAmenities.map((a, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            value={a}
                                            onChange={(e) => handleManualAmenitiesChange(idx, e.target.value)}
                                            placeholder="Add amenity"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveManualAmenity?.(idx)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    size="sm"
                                    onClick={handleAddManualAmenity}
                                    variant="outline"
                                >
                                    Add Amenity
                                </Button>
                            </div>
                        </div>
                    )}

                    {handleManualHighlightsChange && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Tags</label>
                            <div className="space-y-2">
                                {manualHighlights.map((h, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            value={h}
                                            onChange={(e) => handleManualHighlightsChange(idx, e.target.value)}
                                            placeholder="Add tag"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveManualHighlight?.(idx)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    size="sm"
                                    onClick={handleAddManualHighlight}
                                    variant="outline"
                                >
                                    Add Tag
                                </Button>
                            </div>
                        </div>
                    )}

                    {setManualImageUrl && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Image (Media Add)</label>
                            <Input
                                value={manualImageUrl}
                                onChange={(e) => setManualImageUrl(e.target.value)}
                                placeholder="Image URL"
                            />
                        </div>
                    )}

                    {setManualRefundable && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Refundable Non refundable</label>
                            <Input
                                value={manualRefundable}
                                onChange={(e) => setManualRefundable(e.target.value)}
                                placeholder="e.g. Refundable"
                            />
                        </div>
                    )}

                    {setManualAddress && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Address</label>
                            <Input
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                                placeholder="Full address"
                            />
                        </div>
                    )}

                    {setManualHotelLink && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Hotel Link</label>
                            <Input
                                value={manualHotelLink}
                                onChange={(e) => setManualHotelLink(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    )}

                    {setManualDescription && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={manualDescription}
                                onChange={(e) => setManualDescription(e.target.value)}
                                placeholder="Description (optional)"
                            />
                        </div>
                    )}

                    {setManualConfirmationNumber && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Confirmation No.</label>
                            <Input
                                value={manualConfirmationNumber}
                                onChange={(e) => setManualConfirmationNumber(e.target.value)}
                                placeholder="Confirmation Number"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
