import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface NoteFormsProps {
    manualDescription: string
    setManualDescription: (value: string) => void
    errors?: Record<string, string>
}

export function NoteForms(props: NoteFormsProps) {
    const {
        manualDescription,
        setManualDescription,
        errors = {},
    } = props

    return (
        <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">Note Content</Label>
            <Textarea
                id="description"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Enter your note..."
                rows={6}
                className={errors.description ? "border-red-500" : ""}
            />
        </div>
    )
}
