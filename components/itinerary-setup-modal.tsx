"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Copy, Calendar, Package, ShoppingCart, FileText, Clock, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/client-auth"

export type ItineraryType = "fixed-group-tour" | "customized-package" | "cart-combo" | "html-editor"

export interface ItinerarySetupResult {
	itineraryType: ItineraryType
	name: string
	productId: string
	productReferenceCode?: string
	description?: string
	destination?: string
	days?: number
	startDate?: string
	endDate?: string
	maxParticipants?: number
}

interface ItinerarySetupModalProps {
	isOpen: boolean
	onClose: () => void
	onCreate?: (result: ItinerarySetupResult) => void
	onCopy?: () => void
}

const INITIAL_FORM_STATE = {
	name: "",
	days: "",
	productId: "",
	productReferenceCode: "",
	description: "",
	destination: "",
	maxParticipants: "",
	startDate: "",
	endDate: "",
}

export function ItinerarySetupModal({ isOpen, onClose, onCreate, onCopy }: ItinerarySetupModalProps) {
	const router = useRouter()
	const { toast } = useToast()
	const [setupType, setSetupType] = useState<"new" | "copy" | null>(null)
	const [itineraryType, setItineraryType] = useState<ItineraryType>("customized-package")
	const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE })
	const [isChecking, setIsChecking] = useState(false)
	const [titleError, setTitleError] = useState<string | null>(null)

	// Check for duplicate title whenever name changes
	useEffect(() => {
		const checkTitle = async () => {
			const name = formData.name.trim()
			if (name.length < 3) {
				setTitleError(null)
				return
			}

			try {
				const authHeaders = await getAuthHeaders()
				const res = await fetch(`/api/itineraries?title=${encodeURIComponent(name)}`, {
					headers: authHeaders
				})

				if (res.ok) {
					const result = await res.json()
					const existing = result.data || []
					if (existing.length > 0) {
						setTitleError("An itinerary with this name already exists.")
					} else {
						setTitleError(null)
					}
				}
			} catch (error) {
				console.error("Error checking duplicate title:", error)
			}
		}

		const timeoutId = setTimeout(checkTitle, 500)
		return () => clearTimeout(timeoutId)
	}, [formData.name])

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const generateProductId = () => {
		const prefix = {
			"fixed-group-tour": "FGT",
			"customized-package": "CUS",
			"cart-combo": "CRT",
			"html-editor": "HTM",
		}[itineraryType]

		return `${prefix}-${Date.now().toString(36).toUpperCase()}`
	}

	const handleCreateNew = async () => {
		if (!formData.name || !formData.productId) {
			toast({
				title: "Required Fields Missing",
				description: "Please enter itinerary name and product ID",
				variant: "destructive"
			})
			return
		}

		if (titleError) {
			return // Don't proceed if there's a title error
		}

		if (itineraryType === "fixed-group-tour" && (!formData.startDate || !formData.endDate)) {
			toast({
				title: "Dates Missing",
				description: "Please specify start and end dates for Fixed Group Tour",
				variant: "destructive"
			})
			return
		}

		if ((itineraryType === "customized-package" || itineraryType === "html-editor") && !formData.days) {
			toast({
				title: "Duration Missing",
				description: "Please specify number of days",
				variant: "destructive"
			})
			return
		}

		// Final check for duplicate title just in case
		setIsChecking(true)
		try {
			const authHeaders = await getAuthHeaders()
			const res = await fetch(`/api/itineraries?title=${encodeURIComponent(formData.name.trim())}`, {
				headers: authHeaders
			})

			if (res.ok) {
				const result = await res.json()
				const existing = result.data || []

				if (existing.length > 0) {
					setTitleError("An itinerary with this name already exists.")
					setIsChecking(false)
					return
				}
			}
		} catch (error) {
			console.error("Error checking duplicate title:", error)
		}

		const parsedResult: ItinerarySetupResult = {
			itineraryType,
			name: formData.name.trim(),
			productId: formData.productId.trim(),
			productReferenceCode: formData.productReferenceCode?.trim() || undefined,
			description: formData.description.trim() || undefined,
			destination: formData.destination.trim() || undefined,
			days: formData.days ? Number(formData.days) : undefined,
			startDate: formData.startDate || undefined,
			endDate: formData.endDate || undefined,
			maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : undefined,
		}

		if (onCreate) {
			setIsChecking(false)
			onCreate(parsedResult)
			return
		}

		const queryParams = new URLSearchParams({
			name: parsedResult.name,
			productId: parsedResult.productId,
			...(parsedResult.productReferenceCode && { productReferenceCode: parsedResult.productReferenceCode }),
			type: itineraryType,
			mode: "new",
			...(parsedResult.description && { description: parsedResult.description }),
			...(parsedResult.destination && { destination: parsedResult.destination }),
			...(parsedResult.days && { days: String(parsedResult.days) }),
			...(parsedResult.startDate && { startDate: parsedResult.startDate }),
			...(parsedResult.endDate && { endDate: parsedResult.endDate }),
			...(parsedResult.maxParticipants && { maxParticipants: String(parsedResult.maxParticipants) }),
		})

		router.push(`/itinerary/builder?${queryParams.toString()}`)
		setIsChecking(false)
		onClose()
	}

	const handleCopyExisting = () => {
		if (onCopy) {
			onCopy()
			return
		}
		router.push("/itinerary/builder")
	}

	useEffect(() => {
		if (!isOpen) {
			setSetupType(null)
			setItineraryType("customized-package")
			setFormData({ ...INITIAL_FORM_STATE })
			setTitleError(null)
		}
	}, [isOpen])

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-20 pb-6">
			<div className="fixed inset-0 bg-black/50" onClick={onClose} />
			<div className="relative w-full max-w-[600px] max-h-full flex flex-col">
				<div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
					<div className="py-4 px-6 border-b flex items-center justify-between">
						<h2 className="text-lg font-semibold">Create New Itinerary</h2>
						<Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
							<X size={18} />
						</Button>
					</div>

					{!setupType ? (
						<div className="grid grid-cols-2 gap-4 p-4">
						<Button
							onClick={() => setSetupType("new")}
							className="h-32 flex flex-col items-center justify-center gap-2"
						>
							<Plus size={24} />
							<span>Create New</span>
						</Button>
						<Button
							onClick={() => setSetupType("copy")}
							className="h-32 flex flex-col items-center justify-center gap-2"
							variant="outline"
						>
							<Copy size={24} />
							<span>Copy Existing</span>
						</Button>
					</div>
				) : setupType === "new" ? (
					<div className="space-y-6 p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
						<div>
							<Label className="text-base font-medium mb-3 block">Select Itinerary Type</Label>
							<div className="grid grid-cols-2 gap-3">
								<Button
									variant={itineraryType === "fixed-group-tour" ? "default" : "outline"}
									onClick={() => setItineraryType("fixed-group-tour")}
									className="h-auto p-4 flex flex-col items-center gap-2"
								>
									<Calendar size={20} />
									<div className="text-center">
										<div className="font-medium">Fixed Group Tours</div>
										<div className="text-xs text-muted-foreground">Fixed dates & group size</div>
									</div>
								</Button>

								<Button
									variant={itineraryType === "customized-package" ? "default" : "outline"}
									onClick={() => setItineraryType("customized-package")}
									className="h-auto p-4 flex flex-col items-center gap-2"
								>
									<Package size={20} />
									<div className="text-center">
										<div className="font-medium">Customized Package</div>
										<div className="text-xs text-muted-foreground">Day-by-day itinerary</div>
									</div>
								</Button>

								<Button
									variant={itineraryType === "cart-combo" ? "default" : "outline"}
									onClick={() => setItineraryType("cart-combo")}
									className="h-auto p-4 flex flex-col items-center gap-2"
								>
									<ShoppingCart size={20} />
									<div className="text-center">
										<div className="font-medium">Build a Cart/Combo</div>
										<div className="text-xs text-muted-foreground">Individual items</div>
									</div>
								</Button>

								<Button
									variant={itineraryType === "html-editor" ? "default" : "outline"}
									onClick={() => setItineraryType("html-editor")}
									className="h-auto p-4 flex flex-col items-center gap-2"
								>
									<FileText size={20} />
									<div className="text-center">
										<div className="font-medium">HTML Editor</div>
										<div className="text-xs text-muted-foreground">Block-based editor</div>
									</div>
								</Button>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<Label className={titleError ? "text-red-500 font-semibold" : ""}>Itinerary Name *</Label>
								<Input
									value={formData.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									placeholder="Enter itinerary name"
									className={titleError ? "border-red-500 focus-visible:ring-red-500 bg-red-50/30" : ""}
								/>
								{titleError && (
									<p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1">
										<span className="w-1 h-1 bg-red-500 rounded-full" />
										{titleError}
									</p>
								)}
							</div>

							<div>
								<Label>Product ID *</Label>
								<div className="flex gap-2">
									<Input
										value={formData.productId}
										onChange={(e) => handleInputChange("productId", e.target.value)}
										placeholder="Enter product ID"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={() => handleInputChange("productId", generateProductId())}
									>
										Generate
									</Button>
								</div>
							</div>

							<div>
								<Label>Product Reference Code (Optional)</Label>
								<Input
									value={formData.productReferenceCode}
									onChange={(e) => handleInputChange("productReferenceCode", e.target.value)}
									placeholder="Enter product reference code"
								/>
							</div>
						</div>

						{itineraryType === "fixed-group-tour" && (
							<div className="space-y-4 border-t pt-4">
								<h4 className="font-medium flex items-center gap-2">
									<Calendar size={16} />
									Fixed Group Tour Settings
								</h4>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Start Date *</Label>
										<Input
											type="date"
											value={formData.startDate}
											onChange={(e) => handleInputChange("startDate", e.target.value)}
										/>
									</div>
									<div>
										<Label>End Date *</Label>
										<Input
											type="date"
											value={formData.endDate}
											onChange={(e) => handleInputChange("endDate", e.target.value)}
										/>
									</div>
								</div>
								<div>
									<Label>Maximum Participants</Label>
									<Input
										type="number"
										min="1"
										value={formData.maxParticipants}
										onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
										placeholder="Enter max participants"
									/>
								</div>
							</div>
						)}

						{(itineraryType === "customized-package" || itineraryType === "html-editor") && (
							<div className="space-y-4 border-t pt-4">
								<h4 className="font-medium flex items-center gap-2">
									<Clock size={16} />
									Duration Settings
								</h4>
								<div>
									<Label>Number of Days *</Label>
									<Input
										type="number"
										min="1"
										value={formData.days}
										onChange={(e) => handleInputChange("days", e.target.value)}
										placeholder="Enter number of days"
									/>
								</div>
							</div>
						)}

						{itineraryType === "cart-combo" && (
							<div className="space-y-4 border-t pt-4">
								<h4 className="font-medium flex items-center gap-2">
									<ShoppingCart size={16} />
									Cart/Combo Settings
								</h4>
								<p className="text-sm text-muted-foreground">
									This type allows you to add individual items like activities, hotels, flights, etc. without specific dates.
								</p>
							</div>
						)}

						<div className="flex justify-end gap-2 border-t pt-4">
							<Button variant="outline" onClick={() => setSetupType(null)}>
								Back
							</Button>
							<Button onClick={handleCreateNew} disabled={isChecking || !!titleError}>
								{isChecking ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Checking...
									</>
								) : (
									"Create Itinerary"
								)}
							</Button>
						</div>
					</div>
								) : (
									<div className="space-y-4 p-4">
										<p>Copy functionality coming soon...</p>
										<div className="flex justify-end gap-2">
											<Button variant="outline" onClick={() => setSetupType(null)}>
												Back
											</Button>
											<Button onClick={handleCopyExisting}>
												Continue
											</Button>
										</div>
									</div>
								)}
				</div>
			</div>
		</div>
	)
}
