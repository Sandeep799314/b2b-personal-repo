import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TransferFormsProps {
    selectedSubCategory: string
    // Common fields
    manualTitle: string
    setManualTitle: (value: string) => void
    manualFromCity: string
    setManualFromCity: (value: string) => void
    manualToCity: string
    setManualToCity: (value: string) => void
    manualPrice: number | ""
    setManualPrice: (value: number | "") => void
    manualCurrency: string
    setManualCurrency: (value: string) => void
    manualDescription: string
    setManualDescription: (value: string) => void

    // Airport Transfer specific
    manualPickupDrop: "pickup" | "drop"
    setManualPickupDrop: (value: "pickup" | "drop") => void
    manualAirportName: string
    setManualAirportName: (value: string) => void
    manualTransferType: "private" | "shared"
    setManualTransferType: (value: "private" | "shared") => void
    manualVehicleType: string
    setManualVehicleType: (value: string) => void
    manualVehicleCapacity: number | ""
    setManualVehicleCapacity: (value: number | "") => void
    manualPricePerPax: number | ""
    manualStopsList: string[]
    handleAddStop: () => void
    handleRemoveStop: (index: number) => void
    handleStopChange: (index: number, value: string) => void
    manualAdditionalVehicles: Array<{ vehicleType: string, capacity: number, price: number }>
    handleAddVehicle: () => void
    handleRemoveVehicle: (index: number) => void
    handleVehicleChange: (index: number, field: string, value: any) => void

    // Car Hire specific
    manualPickupTime: string
    setManualPickupTime: (value: string) => void
    manualDropTime: string
    setManualDropTime: (value: string) => void
    manualNoOfHours: number | ""
    setManualNoOfHours: (value: number | "") => void
    manualNoOfDays: number | ""
    setManualNoOfDays: (value: number | "") => void
    manualCarType: string
    setManualCarType: (value: string) => void
    manualFuelType: string
    setManualFuelType: (value: string) => void
    manualCarModel: string
    setManualCarModel: (value: string) => void
    manualTransmission: "automatic" | "manual" | ""
    setManualTransmission: (value: "automatic" | "manual" | "") => void

    // Bus & Train specific
    manualTravelDuration: string
    setManualTravelDuration: (value: string) => void
    manualDepartureTime: string
    setManualDepartureTime: (value: string) => void
    manualArrivalTime: string
    setManualArrivalTime: (value: string) => void
    manualClass: string
    setManualClass: (value: string) => void
    manualBusNumber: string
    setManualBusNumber: (value: string) => void
    manualTrainNumber: string
    setManualTrainNumber: (value: string) => void
    manualPnr: string
    setManualPnr: (value: string) => void
    manualRefundable: string
    setManualRefundable: (value: string) => void
    manualLink: string
    setManualLink: (value: string) => void
    manualAmenities: string[]
    setManualAmenities: (value: string[]) => void
}

export function TransferForms(props: TransferFormsProps) {
    const {
        selectedSubCategory,
        manualTitle,
        setManualTitle,
        manualFromCity,
        setManualFromCity,
        manualToCity,
        setManualToCity,
        manualPrice,
        setManualPrice,
        manualCurrency,
        setManualCurrency,
        manualDescription,
        setManualDescription,
        manualPickupDrop,
        setManualPickupDrop,
        manualAirportName,
        setManualAirportName,
        manualTransferType,
        setManualTransferType,
        manualVehicleType,
        setManualVehicleType,
        manualVehicleCapacity,
        setManualVehicleCapacity,
        manualPricePerPax,
        manualStopsList,
        handleAddStop,
        handleRemoveStop,
        handleStopChange,
        manualAdditionalVehicles,
        handleAddVehicle,
        handleRemoveVehicle,
        handleVehicleChange,
        manualPickupTime,
        setManualPickupTime,
        manualDropTime,
        setManualDropTime,
        manualNoOfHours,
        setManualNoOfHours,
        manualNoOfDays,
        setManualNoOfDays,
        manualCarType,
        setManualCarType,
        manualFuelType,
        setManualFuelType,
        manualCarModel,
        setManualCarModel,
        manualTransmission,
        setManualTransmission,
        manualTravelDuration,
        setManualTravelDuration,
        manualDepartureTime,
        setManualDepartureTime,
        manualArrivalTime,
        setManualArrivalTime,
        manualClass,
        setManualClass,
        manualBusNumber,
        setManualBusNumber,
        manualTrainNumber,
        setManualTrainNumber,
        manualPnr,
        setManualPnr,
        manualRefundable,
        setManualRefundable,
        manualLink,
        setManualLink,
        manualAmenities,
        setManualAmenities,
    } = props

    return (
        <>
            {/* AIRPORT TRANSFER */}
            {selectedSubCategory === "airport-transfer" && (
                <>
                    {/* Mandatory Fields */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Mandatory Fields
                        </h4>
                        <div className="space-y-4 pl-4 border-l-2 border-red-200">
                            {/* Pickup/Drop Toggle */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Pickup/Drop</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setManualPickupDrop("pickup")}
                                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualPickupDrop === "pickup"
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        Pickup
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setManualPickupDrop("drop")}
                                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualPickupDrop === "drop"
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        Drop
                                    </button>
                                </div>
                            </div>

                            {/* Airport Name */}
                            <div>
                                <label className="text-sm font-medium">Airport Name</label>
                                <Input
                                    value={manualAirportName}
                                    onChange={(e) => setManualAirportName(e.target.value)}
                                    placeholder="e.g., Indira Gandhi International Airport"
                                />
                            </div>

                            {/* From */}
                            <div>
                                <label className="text-sm font-medium">From</label>
                                <Input
                                    value={manualFromCity}
                                    onChange={(e) => setManualFromCity(e.target.value)}
                                    placeholder={manualPickupDrop === "pickup" ? manualAirportName || "Airport" : "Location"}
                                />
                            </div>

                            {/* To */}
                            <div>
                                <label className="text-sm font-medium">To</label>
                                <Input
                                    value={manualToCity}
                                    onChange={(e) => setManualToCity(e.target.value)}
                                    placeholder={manualPickupDrop === "drop" ? manualAirportName || "Airport" : "Destination"}
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={manualTitle}
                                    onChange={(e) => setManualTitle(e.target.value)}
                                    placeholder="Transfer title"
                                />
                            </div>

                            {/* Type of Transfer */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Type of Transfer</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setManualTransferType("private")}
                                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransferType === "private"
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        Private
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setManualTransferType("shared")}
                                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransferType === "shared"
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        Shared
                                    </button>
                                </div>
                            </div>

                            {/* Type of Vehicle */}
                            <div>
                                <label className="text-sm font-medium">Type of Vehicle</label>
                                <Input
                                    value={manualVehicleType}
                                    onChange={(e) => setManualVehicleType(e.target.value)}
                                    placeholder="e.g., Sedan, SUV, Van"
                                />
                            </div>

                            {/* Vehicle Capacity */}
                            <div>
                                <label className="text-sm font-medium">Vehicle Capacity</label>
                                <Input
                                    type="number"
                                    value={manualVehicleCapacity}
                                    onChange={(e) => setManualVehicleCapacity(Number(e.target.value) || "")}
                                    placeholder="3"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="text-sm font-medium">Price</label>
                                <div className="flex gap-2">
                                    <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                        <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INR">INR (₹)</SelectItem>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="AED">AED (د.إ)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input type="number" value={manualPrice} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
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
                            {/* Add Stops */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Add Stops (if any)</label>
                                <div className="space-y-2">
                                    {manualStopsList.map((stop, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input
                                                value={stop}
                                                onChange={(e) => handleStopChange(idx, e.target.value)}
                                                placeholder="Stop location"
                                            />
                                            <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveStop(idx)}>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddStop}>
                                        + Add Stop
                                    </Button>
                                </div>
                            </div>

                            {/* Add Vehicles Manually */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Add Vehicles Manually</label>
                                <div className="space-y-2">
                                    {manualAdditionalVehicles.map((vehicle, idx) => (
                                        <div key={idx} className="p-3 border rounded-lg space-y-2">
                                            <div className="grid grid-cols-3 gap-2">
                                                <Input
                                                    value={vehicle.vehicleType}
                                                    onChange={(e) => handleVehicleChange(idx, "vehicleType", e.target.value)}
                                                    placeholder="Vehicle Type"
                                                />
                                                <Input
                                                    type="number"
                                                    value={vehicle.capacity}
                                                    onChange={(e) => handleVehicleChange(idx, "capacity", Number(e.target.value))}
                                                    placeholder="Capacity"
                                                />
                                                <Input
                                                    type="number"
                                                    value={vehicle.price}
                                                    onChange={(e) => handleVehicleChange(idx, "price", Number(e.target.value))}
                                                    placeholder="Price"
                                                />
                                            </div>
                                            <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveVehicle(idx)}>
                                                Remove Vehicle
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddVehicle}>
                                        + Add Vehicle
                                    </Button>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={manualDescription}
                                    onChange={(e) => setManualDescription(e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )
            }

            {/* CAR HIRE - HOURLY */}
            {
                selectedSubCategory === "car-hire-hourly" && (
                    <>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                Mandatory Fields
                            </h4>
                            <div className="space-y-4 pl-4 border-l-2 border-red-200">
                                <div><label className="text-sm font-medium">From</label><Input value={manualFromCity} onChange={(e) => setManualFromCity(e.target.value)} placeholder="Pickup location" /></div>
                                <div><label className="text-sm font-medium">To</label><Input value={manualToCity} onChange={(e) => setManualToCity(e.target.value)} placeholder="Drop location" /></div>
                                <div><label className="text-sm font-medium">Pickup Time</label><Input type="time" value={manualPickupTime} onChange={(e) => setManualPickupTime(e.target.value)} /></div>
                                <div><label className="text-sm font-medium">No. of Hours</label><Input type="number" value={manualNoOfHours} onChange={(e) => setManualNoOfHours(Number(e.target.value) || "")} placeholder="Hours" /></div>
                                <div><label className="text-sm font-medium">Car Type</label><Input value={manualCarType} onChange={(e) => setManualCarType(e.target.value)} placeholder="e.g., Sedan, SUV" /></div>
                                <div><label className="text-sm font-medium">Capacity</label><Input type="number" value={manualVehicleCapacity} onChange={(e) => setManualVehicleCapacity(Number(e.target.value) || "")} placeholder="Number of passengers" /></div>
                                <div>
                                    <label className="text-sm font-medium">Price</label>
                                    <div className="flex gap-2">
                                        <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR (₹)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="AED">AED (د.إ)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" value={manualPrice} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>Optional Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                <div><label className="text-sm font-medium">Fuel Type</label><Input value={manualFuelType} onChange={(e) => setManualFuelType(e.target.value)} placeholder="e.g., Petrol, Diesel, Electric" /></div>
                                <div><label className="text-sm font-medium">Car Model</label><Input value={manualCarModel} onChange={(e) => setManualCarModel(e.target.value)} placeholder="e.g., Toyota Innova" /></div>
                                <div>
                                    <label className="text-sm font-medium">Transmission</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setManualTransmission("automatic")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransmission === "automatic" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Automatic</button>
                                        <button type="button" onClick={() => setManualTransmission("manual")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransmission === "manual" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Manual</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* CAR HIRE - OUTSTATION */}
            {
                selectedSubCategory === "car-hire-outstation" && (
                    <>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Mandatory Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-red-200">
                                <div><label className="text-sm font-medium">From</label><Input value={manualFromCity} onChange={(e) => setManualFromCity(e.target.value)} placeholder="Starting city" /></div>
                                <div><label className="text-sm font-medium">To</label><Input value={manualToCity} onChange={(e) => setManualToCity(e.target.value)} placeholder="Destination city" /></div>
                                <div><label className="text-sm font-medium">Pickup Time</label><Input type="time" value={manualPickupTime} onChange={(e) => setManualPickupTime(e.target.value)} /></div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Private/Shared</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setManualTransferType("private")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransferType === "private" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Private</button>
                                        <button type="button" onClick={() => setManualTransferType("shared")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransferType === "shared" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Shared</button>
                                    </div>
                                </div>
                                <div><label className="text-sm font-medium">Car Type</label><Input value={manualCarType} onChange={(e) => setManualCarType(e.target.value)} placeholder="e.g., Sedan, SUV" /></div>
                                <div><label className="text-sm font-medium">Capacity</label><Input type="number" value={manualVehicleCapacity} onChange={(e) => setManualVehicleCapacity(Number(e.target.value) || "")} placeholder="Number of passengers" /></div>
                                <div>
                                    <label className="text-sm font-medium">Price</label>
                                    <div className="flex gap-2">
                                        <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR (₹)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="AED">AED (د.إ)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" value={manualPrice} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>Optional Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                <div><label className="text-sm font-medium">Fuel Type</label><Input value={manualFuelType} onChange={(e) => setManualFuelType(e.target.value)} placeholder="e.g., Petrol, Diesel" /></div>
                                <div><label className="text-sm font-medium">Car Model</label><Input value={manualCarModel} onChange={(e) => setManualCarModel(e.target.value)} placeholder="e.g., Toyota Innova" /></div>
                                <div>
                                    <label className="text-sm font-medium">Transmission</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setManualTransmission("automatic")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransmission === "automatic" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Automatic</button>
                                        <button type="button" onClick={() => setManualTransmission("manual")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransmission === "manual" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Manual</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* CAR HIRE - ROUND TRIP */}
            {
                selectedSubCategory === "car-hire-roundtrip" && (
                    <>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Mandatory Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-red-200">
                                <div><label className="text-sm font-medium">From</label><Input value={manualFromCity} onChange={(e) => setManualFromCity(e.target.value)} placeholder="Starting location" /></div>
                                <div><label className="text-sm font-medium">To</label><Input value={manualToCity} onChange={(e) => setManualToCity(e.target.value)} placeholder="Destination" /></div>
                                <div><label className="text-sm font-medium">Pickup Time</label><Input type="time" value={manualPickupTime} onChange={(e) => setManualPickupTime(e.target.value)} /></div>
                                <div><label className="text-sm font-medium">Drop Time</label><Input type="time" value={manualDropTime} onChange={(e) => setManualDropTime(e.target.value)} /></div>
                                <div><label className="text-sm font-medium">No. of Days</label><Input type="number" value={manualNoOfDays} onChange={(e) => setManualNoOfDays(Number(e.target.value) || "")} placeholder="Days" /></div>
                                <div><label className="text-sm font-medium">Car Type</label><Input value={manualCarType} onChange={(e) => setManualCarType(e.target.value)} placeholder="e.g., Sedan, SUV" /></div>
                                <div><label className="text-sm font-medium">Capacity</label><Input type="number" value={manualVehicleCapacity} onChange={(e) => setManualVehicleCapacity(Number(e.target.value) || "")} placeholder="Number of passengers" /></div>
                                <div>
                                    <label className="text-sm font-medium">Price</label>
                                    <div className="flex gap-2">
                                        <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR (₹)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="AED">AED (د.إ)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" value={manualPrice} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>Optional Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                <div><label className="text-sm font-medium">Fuel Type</label><Input value={manualFuelType} onChange={(e) => setManualFuelType(e.target.value)} placeholder="e.g., Petrol, Diesel" /></div>
                                <div><label className="text-sm font-medium">Car Model</label><Input value={manualCarModel} onChange={(e) => setManualCarModel(e.target.value)} placeholder="e.g., Toyota Innova" /></div>
                                <div>
                                    <label className="text-sm font-medium">Transmission</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setManualTransmission("automatic")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransmission === "automatic" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Automatic</button>
                                        <button type="button" onClick={() => setManualTransmission("manual")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransmission === "manual" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Manual</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* CAR HIRE - SELF DRIVE */}
            {
                selectedSubCategory === "car-hire-selfdrive" && (
                    <>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Mandatory Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-red-200">
                                <div><label className="text-sm font-medium">Pickup From</label><Input value={manualFromCity} onChange={(e) => setManualFromCity(e.target.value)} placeholder="Pickup location" /></div>
                                <div><label className="text-sm font-medium">Pickup Time</label><Input type="time" value={manualPickupTime} onChange={(e) => setManualPickupTime(e.target.value)} /></div>
                                <div><label className="text-sm font-medium">Car Type</label><Input value={manualCarType} onChange={(e) => setManualCarType(e.target.value)} placeholder="e.g., Sedan, SUV" /></div>
                                <div><label className="text-sm font-medium">Capacity</label><Input type="number" value={manualVehicleCapacity} onChange={(e) => setManualVehicleCapacity(Number(e.target.value) || "")} placeholder="Number of passengers" /></div>
                                <div><label className="text-sm font-medium">No. of Days</label><Input type="number" value={manualNoOfDays} onChange={(e) => setManualNoOfDays(Number(e.target.value) || "")} placeholder="Days" /></div>
                                <div>
                                    <label className="text-sm font-medium">Price</label>
                                    <div className="flex gap-2">
                                        <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR (₹)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="AED">AED (د.إ)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" value={manualPrice} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>Optional Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                <div><label className="text-sm font-medium">Fuel Type</label><Input value={manualFuelType} onChange={(e) => setManualFuelType(e.target.value)} placeholder="e.g., Petrol, Diesel" /></div>
                                <div><label className="text-sm font-medium">Car Model</label><Input value={manualCarModel} onChange={(e) => setManualCarModel(e.target.value)} placeholder="e.g., Toyota Innova" /></div>
                                <div>
                                    <label className="text-sm font-medium">Transmission</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setManualTransmission("automatic")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransmission === "automatic" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Automatic</button>
                                        <button type="button" onClick={() => setManualTransmission("manual")} className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm ${manualTransmission === "manual" ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>Manual</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* BUS */}
            {
                selectedSubCategory === "bus" && (
                    <>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Mandatory Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-red-200">
                                <div><label className="text-sm font-medium">From</label><Input value={manualFromCity} onChange={(e) => setManualFromCity(e.target.value)} placeholder="Departure city" /></div>
                                <div><label className="text-sm font-medium">To</label><Input value={manualToCity} onChange={(e) => setManualToCity(e.target.value)} placeholder="Arrival city" /></div>
                                <div><label className="text-sm font-medium">Travel Duration</label><Input value={manualTravelDuration} onChange={(e) => setManualTravelDuration(e.target.value)} placeholder="e.g., 5h 30m" /></div>
                                <div><label className="text-sm font-medium">Class</label><Input value={manualClass} onChange={(e) => setManualClass(e.target.value)} placeholder="e.g., Sleeper, Semi-Sleeper, AC" /></div>
                                <div><label className="text-sm font-medium">Departure Time</label><Input type="time" value={manualDepartureTime} onChange={(e) => setManualDepartureTime(e.target.value)} /></div>
                                <div><label className="text-sm font-medium">Arrival Time</label><Input type="time" value={manualArrivalTime} onChange={(e) => setManualArrivalTime(e.target.value)} /></div>
                                <div>
                                    <label className="text-sm font-medium">Price</label>
                                    <div className="flex gap-2">
                                        <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR (₹)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="AED">AED (د.إ)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" value={manualPrice} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>Optional Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                <div><label className="text-sm font-medium">Bus No.</label><Input value={manualBusNumber} onChange={(e) => setManualBusNumber(e.target.value)} placeholder="Bus number" /></div>
                                <div><label className="text-sm font-medium">PNR Number</label><Input value={manualPnr} onChange={(e) => setManualPnr(e.target.value)} placeholder="PNR" /></div>
                                <div><label className="text-sm font-medium">Amenities</label><Input value={manualAmenities[0] || ""} onChange={(e) => setManualAmenities([e.target.value])} placeholder="e.g., WiFi, Charging ports" /></div>
                                <div><label className="text-sm font-medium">Refundable/Non-refundable</label><Input value={manualRefundable} onChange={(e) => setManualRefundable(e.target.value)} placeholder="Refundable or Non-refundable" /></div>
                                <div><label className="text-sm font-medium">Description</label><Textarea value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} placeholder="Additional details" className="min-h-[60px]" /></div>
                                <div><label className="text-sm font-medium">Link</label><Input value={manualLink} onChange={(e) => setManualLink(e.target.value)} placeholder="Booking link" /></div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* TRAIN */}
            {
                selectedSubCategory === "train" && (
                    <>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Mandatory Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-red-200">
                                <div><label className="text-sm font-medium">From</label><Input value={manualFromCity} onChange={(e) => setManualFromCity(e.target.value)} placeholder="Departure station" /></div>
                                <div><label className="text-sm font-medium">To</label><Input value={manualToCity} onChange={(e) => setManualToCity(e.target.value)} placeholder="Arrival station" /></div>
                                <div><label className="text-sm font-medium">Travel Duration</label><Input value={manualTravelDuration} onChange={(e) => setManualTravelDuration(e.target.value)} placeholder="e.g., 8h 15m" /></div>
                                <div><label className="text-sm font-medium">Class</label><Input value={manualClass} onChange={(e) => setManualClass(e.target.value)} placeholder="e.g., 1AC, 2AC, 3AC, Sleeper" /></div>
                                <div><label className="text-sm font-medium">Departure Time</label><Input type="time" value={manualDepartureTime} onChange={(e) => setManualDepartureTime(e.target.value)} /></div>
                                <div><label className="text-sm font-medium">Arrival Time</label><Input type="time" value={manualArrivalTime} onChange={(e) => setManualArrivalTime(e.target.value)} /></div>
                                <div>
                                    <label className="text-sm font-medium">Price</label>
                                    <div className="flex gap-2">
                                        <Select value={manualCurrency} onValueChange={setManualCurrency}>
                                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR (₹)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                                <SelectItem value="AED">AED (د.إ)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input type="number" value={manualPrice} onChange={(e) => setManualPrice(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>Optional Fields</h4>
                            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                <div><label className="text-sm font-medium">Train No.</label><Input value={manualTrainNumber} onChange={(e) => setManualTrainNumber(e.target.value)} placeholder="Train number" /></div>
                                <div><label className="text-sm font-medium">PNR Number</label><Input value={manualPnr} onChange={(e) => setManualPnr(e.target.value)} placeholder="PNR" /></div>
                                <div><label className="text-sm font-medium">Description</label><Textarea value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} placeholder="Additional details" className="min-h-[60px]" /></div>
                                <div><label className="text-sm font-medium">Link</label><Input value={manualLink} onChange={(e) => setManualLink(e.target.value)} placeholder="Booking link" /></div>
                            </div>
                        </div>
                    </>
                )
            }
        </>
    )
}
