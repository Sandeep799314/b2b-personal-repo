import React from "react"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface QuotationStatusStepperProps {
    currentStatus: string
    onStatusChange: (status: string) => void
    disabled?: boolean
}

export function QuotationStatusStepper({ currentStatus, onStatusChange, disabled }: QuotationStatusStepperProps) {
    const steps = [
        { id: "draft", label: "Draft" },
        { id: "sent", label: "Sent" },
        { id: "accepted", label: "Accepted" },
    ]

    // Helper to determine step state
    const getStepState = (stepId: string) => {
        const statusOrder = ["draft", "sent", "accepted"]
        const currentIndex = statusOrder.indexOf(currentStatus)
        const stepIndex = statusOrder.indexOf(stepId)

        if (currentStatus === "rejected" || currentStatus === "expired") {
            if (stepId === "draft") return "completed"
            return "inactive"
        }

        if (stepIndex < currentIndex) return "completed"
        if (stepIndex === currentIndex) return "current"
        return "inactive"
    }

    return (
        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border shadow-sm">
            {steps.map((step, index) => {
                const state = getStepState(step.id)
                return (
                    <React.Fragment key={step.id}>
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={disabled || state === "inactive"}
                                onClick={() => onStatusChange(step.id)}
                                className={cn(
                                    "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                                    state === "completed" && "bg-green-100 text-green-700 hover:bg-green-200",
                                    state === "current" && "bg-brand-100 text-brand-700 ring-2 ring-brand-500 ring-offset-2",
                                    state === "inactive" && "text-muted-foreground hover:bg-neutral-100"
                                )}
                            >
                                {state === "completed" && <Check className="h-3.5 w-3.5" />}
                                {state === "current" && <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />}
                                {step.label}
                            </Button>
                        </div>
                        {index < steps.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}
