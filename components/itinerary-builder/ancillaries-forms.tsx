import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AncillariesFormsProps {
    selectedSubCategory: string
    // Common fields
    manualTitle: string
    setManualTitle: (value: string) => void
    manualPrice: number | ""
    setManualPrice: (value: number | "") => void
    manualCurrency: string
    setManualCurrency: (value: string) => void

    // Visa specific
    manualCountry: string
    setManualCountry: (value: string) => void
    manualVisaType: string
    setManualVisaType: (value: string) => void
    manualVisaDuration: string
    setManualVisaDuration: (value: string) => void
    manualServiceFee: number | ""
    setManualServiceFee: (value: number | "") => void
    manualTotalFee: number | ""
    manualLengthOfStay: string
    setManualLengthOfStay: (value: string) => void
    manualEntryMethod: string
    setManualEntryMethod: (value: string) => void
    manualDepartureDate: string
    setManualDepartureDate: (value: string) => void
    manualReturnDate: string
    setManualReturnDate: (value: string) => void

    // Forex specific
    manualForexCurrency: string
    setManualForexCurrency: (value: string) => void
    manualBaseCurrency: string
    setManualBaseCurrency: (value: string) => void
    manualAmount: number | ""
    setManualAmount: (value: number | "") => void

    // Travel Insurance specific
    manualDestinations: string[]
    handleAddDestination: () => void
    handleRemoveDestination: (index: number) => void
    handleDestinationChange: (index: number, value: string) => void
    manualStartDate: string
    setManualStartDate: (value: string) => void
    manualEndDate: string
    setManualEndDate: (value: string) => void
    manualNoOfTravellers: number | ""
    setManualNoOfTravellers: (value: number | "") => void
    manualInsuranceType: string
    setManualInsuranceType: (value: string) => void
    manualNotes: string
    setManualNotes: (value: string) => void
    manualSumInsured: number | ""
    setManualSumInsured: (value: number | "") => void
}

export function AncillariesForms(props: AncillariesFormsProps) {
    const {
        selectedSubCategory,
        manualTitle,
        setManualTitle,
        manualPrice,
        setManualPrice,
        manualCurrency,
        setManualCurrency,
        manualCountry,
        setManualCountry,
        manualVisaType,
        setManualVisaType,
        manualVisaDuration,
        setManualVisaDuration,
        manualServiceFee,
        setManualServiceFee,
        manualTotalFee,
        manualLengthOfStay,
        setManualLengthOfStay,
        manualEntryMethod,
        setManualEntryMethod,
        manualDepartureDate,
        setManualDepartureDate,
        manualReturnDate,
        setManualReturnDate,
        manualForexCurrency,
        setManualForexCurrency,
        manualBaseCurrency,
        setManualBaseCurrency,
        manualAmount,
        setManualAmount,
        manualDestinations,
        handleAddDestination,
        handleRemoveDestination,
        handleDestinationChange,
        manualStartDate,
        setManualStartDate,
        manualEndDate,
        setManualEndDate,
        manualNoOfTravellers,
        setManualNoOfTravellers,
        manualInsuranceType,
        setManualInsuranceType,
        manualNotes,
        setManualNotes,
        manualSumInsured,
        setManualSumInsured,
    } = props

    return (
        <>
            {/* VISA */}
            {selectedSubCategory === "visa" && (
                <>
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Mandatory Fields
                        </h4>
                        <div className="space-y-4 pl-4 border-l-2 border-red-200">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Visa service title" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Country</label>
                                <Input value={manualCountry} onChange={(e) => setManualCountry(e.target.value)} placeholder="e.g., United States" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Visa Type</label>
                                <Input value={manualVisaType} onChange={(e) => setManualVisaType(e.target.value)} placeholder="e.g., Tourist, Business, Transit" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Duration</label>
                                <Input value={manualVisaDuration} onChange={(e) => setManualVisaDuration(e.target.value)} placeholder="e.g., 30 days, 90 days" />
                            </div>
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
                            <div>
                                <label className="text-sm font-medium">Service Fee</label>
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
                                    <Input type="number" value={manualServiceFee} onChange={(e) => setManualServiceFee(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                                </div>
                            </div>
                            {/* Total Fee (Auto-calculated) */}
                            {manualTotalFee && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <label className="text-sm font-medium text-blue-900">Total Fee (Calculated)</label>
                                    <p className="text-lg font-semibold text-blue-900 mt-1">
                                        {manualCurrency === "INR" ? "₹" : manualCurrency === "USD" ? "$" : manualCurrency === "EUR" ? "€" : manualCurrency === "GBP" ? "£" : ""}
                                        {manualTotalFee}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            Optional Fields
                        </h4>
                        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                            <div>
                                <label className="text-sm font-medium">Length of Stay</label>
                                <Input value={manualLengthOfStay} onChange={(e) => setManualLengthOfStay(e.target.value)} placeholder="e.g., 14 days" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Entry Method</label>
                                <Input value={manualEntryMethod} onChange={(e) => setManualEntryMethod(e.target.value)} placeholder="e.g., Single Entry, Multiple Entry" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Departure Date</label>
                                <Input type="date" value={manualDepartureDate} onChange={(e) => setManualDepartureDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Return Date</label>
                                <Input type="date" value={manualReturnDate} onChange={(e) => setManualReturnDate(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* FOREX */}
            {selectedSubCategory === "forex" && (
                <>
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Mandatory Fields
                        </h4>
                        <div className="space-y-4 pl-4 border-l-2 border-red-200">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Forex service title" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Forex Currency</label>
                                <Select value={manualForexCurrency} onValueChange={setManualForexCurrency}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="AED">AED (د.إ)</SelectItem>
                                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                                        <SelectItem value="SGD">SGD (S$)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Base Currency</label>
                                <Select value={manualBaseCurrency} onValueChange={setManualBaseCurrency}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select base currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="AED">AED (د.إ)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Amount</label>
                                <Input type="number" value={manualAmount} onChange={(e) => setManualAmount(Number(e.target.value) || "")} placeholder="Amount to exchange" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Service Fee</label>
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
                                    <Input type="number" value={manualServiceFee} onChange={(e) => setManualServiceFee(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TRAVEL INSURANCE */}
            {selectedSubCategory === "travel-insurance" && (
                <>
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Mandatory Fields
                        </h4>
                        <div className="space-y-4 pl-4 border-l-2 border-red-200">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Insurance service title" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Destinations (Multiple)</label>
                                <div className="space-y-2">
                                    {manualDestinations.map((dest, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input
                                                value={dest}
                                                onChange={(e) => handleDestinationChange(idx, e.target.value)}
                                                placeholder={`Destination ${idx + 1}`}
                                                className="flex-1"
                                            />
                                            {manualDestinations.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveDestination(idx)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddDestination}>
                                        + Add Destination
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Start Date</label>
                                <Input type="date" value={manualStartDate} onChange={(e) => setManualStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">End Date</label>
                                <Input type="date" value={manualEndDate} onChange={(e) => setManualEndDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">No. of Travellers</label>
                                <Input type="number" value={manualNoOfTravellers} onChange={(e) => setManualNoOfTravellers(Number(e.target.value) || "")} placeholder="Number of travellers" />
                            </div>
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
                            <div>
                                <label className="text-sm font-medium">Type of Insurance</label>
                                <Input value={manualInsuranceType} onChange={(e) => setManualInsuranceType(e.target.value)} placeholder="e.g., Comprehensive, Basic, Premium" />
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            Optional Fields
                        </h4>
                        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                            <div>
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} placeholder="Additional notes" className="min-h-[60px]" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Sum Insured</label>
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
                                    <Input type="number" value={manualSumInsured} onChange={(e) => setManualSumInsured(Number(e.target.value) || "")} placeholder="0.00" className="flex-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
