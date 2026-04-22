import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MealFormsProps {
    manualMeals: string[]
    setManualMeals: (value: string[]) => void
    manualCustomMealDescription?: string
    setManualCustomMealDescription?: (value: string) => void
    manualPrice: number | ""
    setManualPrice: (value: number | "") => void
    manualCurrency: string
    setManualCurrency: (value: string) => void
    errors?: Record<string, string>
}

export function MealForms(props: MealFormsProps) {
    const {
        manualMeals,
        setManualMeals,
        manualCustomMealDescription,
        setManualCustomMealDescription,
        manualPrice,
        setManualPrice,
        manualCurrency,
        setManualCurrency,
        errors = {},
    } = props

    const mealOptions = [
        { id: "breakfast", label: "Breakfast" },
        { id: "lunch", label: "Lunch" },
        { id: "snacks", label: "Snacks" },
        { id: "dinner", label: "Dinner" },
        { id: "mapMeal", label: "MAP (Breakfast + Lunch / Dinner)" },
        { id: "apMeal", label: "AP (Breakfast + Lunch + Dinner)" },
        { id: "allInclusive", label: "All inclusive (All meals + snacks and drinks*)" },
        { id: "others", label: "Others" },
    ]

    const handleMealToggle = (mealId: string) => {
        const isSelected = manualMeals.includes(mealId)

        if (isSelected) {
            setManualMeals(manualMeals.filter(m => m !== mealId))
            // Clear custom description if removing "others"
            if (mealId === "others" && setManualCustomMealDescription) {
                setManualCustomMealDescription("")
            }
        } else {
            setManualMeals([...manualMeals, mealId])
        }
    }

    return (
        <>
            <div className="space-y-3">
                <Label className="text-sm font-medium">Select Meal Options (Multi-select)</Label>
                <div className="space-y-2">
                    {mealOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id={option.id}
                                checked={manualMeals.includes(option.id)}
                                onChange={() => handleMealToggle(option.id)}
                                className="rounded"
                            />
                            <label htmlFor={option.id} className="text-sm cursor-pointer">
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {manualMeals.includes("others") && setManualCustomMealDescription && (
                <div className="grid gap-2">
                    <Label htmlFor="customMealDescription" className="text-sm font-medium">
                        Please specify
                    </Label>
                    <Input
                        id="customMealDescription"
                        value={manualCustomMealDescription}
                        onChange={(e) => setManualCustomMealDescription(e.target.value)}
                        placeholder="Enter custom meal description..."
                    />
                </div>
            )}

            {/* Price Field */}
            <div className="grid gap-2">
                <Label htmlFor="mealPrice">Price</Label>
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
                        id="mealPrice"
                        type="number"
                        min="0"
                        max="1000000"
                        step="0.01"
                        value={manualPrice}
                        onChange={(e) => setManualPrice(Number(e.target.value) || "")}
                        placeholder="0.00"
                        className={`flex-1 ${errors.price ? "border-red-500" : ""}`}
                    />
                </div>
            </div>
        </>
    )
}
