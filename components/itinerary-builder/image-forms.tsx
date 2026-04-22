import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ImageFormsProps {
    manualTitle: string
    setManualTitle: (value: string) => void
    manualImageUrl: string
    setManualImageUrl: (value: string) => void
    manualImageCaption?: string
    setManualImageCaption?: (value: string) => void
    manualImageAlt?: string
    setManualImageAlt?: (value: string) => void
    manualDescription?: string
    setManualDescription?: (value: string) => void
    handleImageUpload?: (file: File) => void
    errors?: Record<string, string>
}

export function ImageForms(props: ImageFormsProps) {
    const {
        manualTitle,
        setManualTitle,
        manualImageUrl,
        setManualImageUrl,
        manualImageCaption,
        setManualImageCaption,
        manualImageAlt,
        setManualImageAlt,
        manualDescription,
        setManualDescription,
        handleImageUpload,
        errors = {},
    } = props

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && handleImageUpload) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File size must be less than 5MB")
                return
            }
            handleImageUpload(file)
        }
    }

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm font-medium">Image Title</Label>
                <Input
                    id="title"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Enter image title"
                    className={errors.title ? "border-red-500" : ""}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium">Image URL</Label>
                <Input
                    id="imageUrl"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="Enter image URL or upload below"
                    className={errors.imageUrl ? "border-red-500" : ""}
                />
            </div>

            {handleImageUpload && (
                <div className="grid gap-2">
                    <Label htmlFor="imageUpload" className="text-sm font-medium">Upload Image</Label>
                    <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">Max file size: 5MB</p>
                </div>
            )}

            {manualImageUrl && (
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Preview</Label>
                    <div className="border rounded-lg p-2">
                        <img
                            src={manualImageUrl}
                            alt={manualImageAlt || "Preview"}
                            className="max-w-full h-32 object-cover rounded"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                        />
                    </div>
                </div>
            )}

            {setManualImageCaption && (
                <div className="grid gap-2">
                    <Label htmlFor="imageCaption" className="text-sm font-medium">Caption</Label>
                    <Input
                        id="imageCaption"
                        value={manualImageCaption}
                        onChange={(e) => setManualImageCaption(e.target.value)}
                        placeholder="Enter image caption"
                    />
                </div>
            )}

            {setManualImageAlt && (
                <div className="grid gap-2">
                    <Label htmlFor="imageAlt" className="text-sm font-medium">Alt Text</Label>
                    <Input
                        id="imageAlt"
                        value={manualImageAlt}
                        onChange={(e) => setManualImageAlt(e.target.value)}
                        placeholder="Enter alt text for accessibility"
                        className={errors.imageAlt ? "border-red-500" : ""}
                    />
                </div>
            )}

            {setManualDescription && (
                <div className="grid gap-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                        id="description"
                        value={manualDescription}
                        onChange={(e) => setManualDescription(e.target.value)}
                        placeholder="Add image description..."
                        rows={3}
                    />
                </div>
            )}
        </>
    )
}
