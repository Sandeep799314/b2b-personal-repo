"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuotationLeadForm } from "@/components/quotation-lead-form"
import { QuotationOptions } from "@/components/quotation-options"
import { QuotationItineraryBuilder } from "@/components/quotation-itinerary-builder"
import { ItinerarySetupModal, ItinerarySetupResult } from "@/components/itinerary-setup-modal"
import { ComingSoon } from "@/components/coming-soon"
import { useQuotations, QuotationData } from "@/hooks/use-quotations"
import { useToast } from "@/hooks/use-toast"
import {
  Eye,
  MoreHorizontal,
  Plus,
  Send,
  Trash,
  Search,
  Filter,
  Download,
  Calendar,
  Printer,
  Copy
} from "lucide-react"
import { DashboardStats } from "@/components/dashboard-stats"

interface LeadFormData {
  name: string
  leadDate?: string
  leadReferenceNo?: string
  remarks: string
  contactDetails?: string
}

type Step = "list" | "lead-form" | "options" | "create-blank-itinerary" | "coming-soon"

export default function QuotationBuilderPage() {
  const [currentStep, setCurrentStep] = useState<Step>("list")
  const [leadData, setLeadData] = useState<LeadFormData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showItinerarySetupModal, setShowItinerarySetupModal] = useState(false)
  const [itinerarySetupConfig, setItinerarySetupConfig] = useState<ItinerarySetupResult | null>(null)

  const router = useRouter()
  const { quotations, fetchQuotations, deleteQuotation, isLoading } = useQuotations()
  const { toast } = useToast()

  const handleCreateNew = () => {
    // Skip lead form and go directly to options
    setCurrentStep("options")
  }

  const handleLeadSubmit = (data: LeadFormData) => {
    setLeadData(data)
    setCurrentStep("options")
  }

  const handleOptionSelect = (option: string) => {
    console.log("Selected option:", option)
    if (option === "create-blank-itinerary") {
      setItinerarySetupConfig(null)
      setShowItinerarySetupModal(true)
    } else {
      setCurrentStep("coming-soon")
    }
  }

  const handleItinerarySetupComplete = (config: ItinerarySetupResult) => {
    setItinerarySetupConfig(config)
    setShowItinerarySetupModal(false)
    setCurrentStep("create-blank-itinerary")
  }

  const handleSetupModalClose = () => {
    setShowItinerarySetupModal(false)
  }

  const handleSetupCopy = () => {
    setShowItinerarySetupModal(false)
    setItinerarySetupConfig(null)
    setCurrentStep("coming-soon")
  }

  const handleBuilderBack = () => {
    setItinerarySetupConfig(null)
    setCurrentStep("options")
  }

  // Filter quotations based on search query
  const filteredQuotations = quotations.filter((quotation) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase()
    return (
      quotation.title.toLowerCase().includes(query) ||
      (quotation.client?.name?.toLowerCase().includes(query)) ||
      quotation.destination.toLowerCase().includes(query)
    )
  })

  // Format date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = "₹") => {
    return `${currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`
  }

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      draft: "bg-neutral-100 text-neutral-800",
      sent: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-amber-100 text-amber-800",
    }

    return (
      <Badge className={`${variants[status] || variants.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  // Handle quotation deletion
  const handleDelete = async () => {
    if (!selectedQuotation) return

    try {
      await deleteQuotation(selectedQuotation._id!)
      // Hook already updates quotations state, no need to do it here
      toast({
        title: "Quotation Deleted",
        description: "The quotation has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete quotation:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete the quotation.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedQuotation(null)
    }
  }

  const renderContent = () => {
    switch (currentStep) {
      case "list":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold">Quotation Builder</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-1"
                  onClick={() => router.push("/itinerary")}
                >
                  <Calendar className="h-4 w-4" />
                  <span>View Itineraries</span>
                </Button>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quotation
                </Button>
              </div>
            </div>

            <DashboardStats quotations={quotations} />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Manage Quotations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                    <Input
                      placeholder="Search quotations..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                  <Button variant="outline" className="gap-1">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : filteredQuotations.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    {searchQuery ? "No quotations match your search." : "No quotations yet. Create your first one!"}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Quotation Title</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Modified</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredQuotations.map((quotation) => (
                          <TableRow key={quotation._id}>
                            <TableCell className="font-medium">
                              <div className="max-w-[180px] truncate" title={quotation.title}>
                                {quotation.title}
                              </div>
                            </TableCell>
                            <TableCell>{quotation.client?.name}</TableCell>
                            <TableCell>{quotation.destination}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                V{quotation.currentVersion || 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {quotation.createdAt ? formatDate(quotation.createdAt) : '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {quotation.updatedAt ? formatDate(quotation.updatedAt) : '-'}
                            </TableCell>
                            <TableCell className="font-semibold text-brand-700">
                              {formatCurrency(
                                quotation.pricingOptions?.finalTotalPrice || quotation.totalPrice,
                                quotation.currency
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={quotation.status} />
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/quotation-builder/${quotation._id}`)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View & Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send to Client
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => window.print()}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      try {
                                        // We reuse the convert-from-itinerary logic or a direct copy endpoint
                                        // Essentialy create a new quote with same itineraryId and quotation props
                                        // For now, let's use a simple client-side clone trigger if backend supports it
                                        // Or better, redirect to a "clone" route? 
                                        // Actually, most robust is to copy the itinerary and then make a new quote.
                                        // Let's implement a 'duplicateQuotation' in the hook later.
                                        // For this MVP step, we will use a simple "Copy" action
                                        toast({ title: "Coming Soon", description: "One-click duplication is being enabled on the server." })
                                      } catch (err) {
                                        console.error(err)
                                      }
                                    }}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedQuotation(quotation)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Quotation</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this quotation? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )

      case "lead-form":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Lead Information</h1>
            <QuotationLeadForm onSubmit={handleLeadSubmit} />
          </div>
        )

      case "options":
        return (
          <QuotationOptions
            onOptionSelect={handleOptionSelect}
            onBack={() => setCurrentStep("list")}
          />
        )

      case "create-blank-itinerary":
        if (!itinerarySetupConfig) {
          return (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-sm text-muted-foreground">
                Select an itinerary setup option to continue.
              </div>
            </div>
          )
        }
        return (
          <QuotationItineraryBuilder
            leadData={leadData ?? { name: "", remarks: "" }}
            setupConfig={itinerarySetupConfig}
            onBack={handleBuilderBack}
          />
        )

      case "coming-soon":
        return <ComingSoon />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-brand-primary-50/30 p-6">
      {renderContent()}
      <ItinerarySetupModal
        isOpen={showItinerarySetupModal}
        onClose={handleSetupModalClose}
        onCreate={handleItinerarySetupComplete}
        onCopy={handleSetupCopy}
      />
    </div>
  )
}
