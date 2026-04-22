import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface ListFormsProps {
    manualTitle: string
    setManualTitle: (value: string) => void
    manualListItems: string[]
    handleAddListItem: () => void
    handleRemoveListItem: (index: number) => void
    handleListItemChange: (index: number, value: string) => void
    errors?: Record<string, string>
}

export function ListForms(props: ListFormsProps) {
    const {
        manualTitle,
        setManualTitle,
        manualListItems,
        handleAddListItem,
        handleRemoveListItem,
        handleListItemChange,
        errors = {},
    } = props

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                    id="title"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g., Important information"
                    className={errors.title ? "border-red-500" : ""}
                />
            </div>

            <div className="grid gap-2">
                <Label className="text-sm font-medium">Bullet Points</Label>
                <div className="space-y-2">
                    {manualListItems.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <Input
                                value={item}
                                onChange={(e) => handleListItemChange(index, e.target.value)}
                                placeholder="Enter detail..."
                                className="flex-1"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveListItem(index)}
                                className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddListItem}
                        className="mt-2"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Bullet Point
                    </Button>
                </div>
            </div>
        </div>
    )
}
