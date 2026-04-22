import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ActivityFormsProps {
    manualTitle: string
    setManualTitle: (value: string) => void
    manualDescription: string
    setManualDescription: (value: string) => void
    manualDuration: string
    setManualDuration: (value: string) => void
    manualTime?: string
    setManualTime?: (value: string) => void
    manualDifficulty?: string
    setManualDifficulty?: (value: string) => void
    manualCapacity?: number | ""
    setManualCapacity?: (value: number | "") => void
    manualLocation?: string
    setManualLocation?: (value: string) => void
    manualPrice?: number | ""
    setManualPrice?: (value: number | "") => void
    manualCurrency?: string
    setManualCurrency?: (value: string) => void
    errors?: Record<string, string>
}

export function ActivityForms(props: ActivityFormsProps) {
    const {
        manualTitle,
        setManualTitle,
        manualDescription,
        setManualDescription,
        manualDuration,
        setManualDuration,
        manualTime,
        setManualTime,
        manualDifficulty,
        setManualDifficulty,
        manualCapacity,
        setManualCapacity,
        manualLocation,
        setManualLocation,
        manualPrice,
        setManualPrice,
        manualCurrency,
        setManualCurrency,
        errors = {},
    } = props

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm font-medium">Activity Name</Label>
                <Input
                    id="title"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Enter activity name"
                    className={errors.title ? "border-red-500" : ""}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                    id="description"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="Activity description"
                    rows={3}
                    className={errors.description ? "border-red-500" : ""}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
                    <Input
                        id="duration"
                        value={manualDuration}
                        onChange={(e) => setManualDuration(e.target.value)}
                        placeholder="e.g., 2 hours"
                        className={errors.duration ? "border-red-500" : ""}
                    />
                </div>
                {setManualTime && (
                    <div className="grid gap-2">
                        <Label htmlFor="time" className="text-sm font-medium">Time</Label>
                        <Input
                            id="time"
                            type="time"
                            value={manualTime}
                            onChange={(e) => setManualTime(e.target.value)}
                            className={errors.time ? "border-red-500" : ""}
                        />
                    </div>
                )}

            </div>

            {setManualLocation && (
                <div className="grid gap-2">
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <Input
                        id="location"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        placeholder="Activity location"
                        className={errors.location ? "border-red-500" : ""}
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {setManualDifficulty && (
                    <div className="grid gap-2">
                        <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty Level</Label>
                        <Select value={manualDifficulty} onValueChange={setManualDifficulty}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {setManualCapacity && (
                    <div className="grid gap-2">
                        <Label htmlFor="capacity" className="text-sm font-medium">Max Capacity</Label>
                        <Input
                            id="capacity"
                            type="number"
                            min="1"
                            max="1000"
                            value={manualCapacity}
                            onChange={(e) => setManualCapacity(Number(e.target.value) || "")}
                            placeholder="20"
                            className={errors.capacity ? "border-red-500" : ""}
                        />
                    </div>
                )}
            </div>

            {(setManualPrice && setManualCurrency) && (
                <div className="grid gap-2">
                    <Label htmlFor="price" className="text-sm font-medium">Price</Label>
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
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={manualPrice}
                            onChange={(e) => setManualPrice(Number(e.target.value) || "")}
                            placeholder="0.00"
                            className={`flex-1 ${errors.price ? "border-red-500" : ""}`}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
