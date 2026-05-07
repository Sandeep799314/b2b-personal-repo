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
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
  Copy,
  Pencil,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  User,
  MapPin,
  Tag,
  History,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
} from "lucide-react"
import { DashboardStats } from "@/components/dashboard-stats"
import { UserWallet } from "@/components/user-wallet"

interface LeadFormData {
  name: string
  leadDate?: string
  leadReferenceNo?: string
  remarks: string
  contactDetails?: string
}

type Step = "list" | "lead-form" | "options" | "create-blank-itinerary" | "coming-soon"

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    draft: "bg-emerald-50 text-emerald-600 border-emerald-200",
    sent: "bg-blue-50 text-blue-600 border-blue-200",
    accepted: "bg-brand-primary-50 text-brand-primary-700 border-brand-primary-200",
    rejected: "bg-rose-50 text-rose-600 border-rose-200",
    expired: "bg-amber-50 text-amber-600 border-amber-200",
    locked: "bg-indigo-50 text-indigo-600 border-indigo-200",
  }

  const label = status === 'draft' ? 'Open' : status;

  return (
    <Badge variant="outline" className={`${variants[status] || variants.draft} font-medium px-2 h-5 flex items-center text-[10px] uppercase rounded border`}>
      {label}
    </Badge>
  )
}

// Query status badge component
const QueryStatusBadge = ({ 
  quotationId, 
  status,
  onUpdate
}: { 
  quotationId: string, 
  status: "pending" | "completed" | "closed" | "cancelled" | "awaiting_feedback",
  onUpdate: (id: string, data: any) => Promise<any>
}) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const configs = {
    pending: { label: "Open", color: "bg-white text-slate-600 border-slate-200", icon: Clock },
    awaiting_feedback: { label: "Feedback", color: "bg-amber-50/50 text-amber-600 border-amber-200", icon: History },
    completed: { label: "Completed", color: "bg-emerald-50/50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
    closed: { label: "Closed", color: "bg-rose-50/50 text-rose-600 border-rose-200", icon: XCircle },
    cancelled: { label: "Cancelled", color: "bg-slate-50 text-slate-500 border-slate-200", icon: XCircle },
  }

  const current = configs[status] || configs.pending
  const Icon = current.icon

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return
    setIsUpdating(true)
    try {
      await onUpdate(quotationId, { queryStatus: newStatus as any })
    } catch (err) {
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isUpdating}>
        <button className={`flex items-center gap-1.5 px-2 h-5 rounded border transition-all hover:bg-slate-50 ${current.color} text-[10px] font-semibold min-w-[95px] justify-between group`}>
          <div className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            <span>{current.label}</span>
          </div>
          <ChevronDown className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 p-1">
        <DropdownMenuItem onClick={() => handleStatusChange("pending")} className="gap-2.5 py-2 cursor-pointer text-slate-600">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-sm">Set to Open</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("awaiting_feedback")} className="gap-2.5 py-2 cursor-pointer text-amber-600">
          <History className="h-4 w-4 text-amber-500" />
          <span className="text-sm">Awaiting Feedback</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("completed")} className="gap-2.5 py-2 cursor-pointer text-emerald-600">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm">Mark Completed</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("closed")} className="gap-2.5 py-2 cursor-pointer text-rose-600">
          <XCircle className="h-4 w-4 text-rose-500" />
          <span className="text-sm">Mark Closed</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("cancelled")} className="gap-2.5 py-2 cursor-pointer text-slate-600">
          <XCircle className="h-4 w-4 text-slate-400" />
          <span className="text-sm">Mark Cancelled</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function QuotationBuilderPage() {
  const [currentStep, setCurrentStep] = useState<Step>("list")
  const [leadData, setLeadData] = useState<LeadFormData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showItinerarySetupModal, setShowItinerarySetupModal] = useState(false)
  const [itinerarySetupConfig, setItinerarySetupConfig] = useState<ItinerarySetupResult | null>(null)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({ key: 'createdAt', direction: 'desc' })

  const router = useRouter()
  const { quotations, fetchQuotations, updateQuotation, deleteQuotation, isLoading } = useQuotations()
  const { toast } = useToast()

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-20 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUpNarrowWide className="h-3 w-3 ml-1 text-brand-primary-600" /> 
      : <ArrowDownNarrowWide className="h-3 w-3 ml-1 text-brand-primary-600" />;
  }

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleCreateNew = () => {
    setCurrentStep("options")
  }

  const handleLeadSubmit = (data: LeadFormData) => {
    setLeadData(data)
    setCurrentStep("options")
  }

  const handleOptionSelect = (option: string) => {
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

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatCurrency = (amount: number, currency: string = "₹") => {
    return `${currency} ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`
  }

  const handleDelete = async () => {
    if (!selectedQuotation) return
    try {
      await deleteQuotation(selectedQuotation._id!)
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

  const handleView = (quotation: QuotationData) => {
    localStorage.setItem("itinerary-preview", JSON.stringify({
      ...quotation,
      itineraryId: quotation.itineraryId,
      _id: quotation._id
    }))
    window.open("/itinerary/preview", "_blank")
  }

  const sortedAndFilteredQuotations = [...quotations]
    .filter((quotation) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase()
      return (
        quotation.title.toLowerCase().includes(query) ||
        (quotation.client?.name?.toLowerCase().includes(query)) ||
        quotation.destination.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (!sortConfig.key || !sortConfig.direction) return 0;
      
      let valA: any = a[sortConfig.key as keyof QuotationData];
      let valB: any = b[sortConfig.key as keyof QuotationData];

      // Handle nested or special fields
      if (sortConfig.key === 'clientName') {
        valA = a.client?.name || '';
        valB = b.client?.name || '';
      } else if (sortConfig.key === 'amount') {
        valA = a.pricingOptions?.finalTotalPrice || a.totalPrice || 0;
        valB = b.pricingOptions?.finalTotalPrice || b.totalPrice || 0;
      } else if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const renderContent = () => {
    switch (currentStep) {
      case "list":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quotation Builder</h1>
                <p className="text-slate-500 text-sm mt-1">Manage and track your customer quotations efficiently.</p>
              </div>
              <div className="flex items-center gap-4">
                <UserWallet />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-slate-200 hover:bg-slate-50 text-slate-700"
                    onClick={() => router.push("/itinerary")}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>View Itineraries</span>
                  </Button>
                  <Button onClick={handleCreateNew} className="bg-brand-primary-600 hover:bg-brand-primary-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Quotation
                  </Button>
                </div>
              </div>
            </div>

            <DashboardStats quotations={quotations} />

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-200 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-800">Quotation Repository</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by title, client or destination..."
                        className="pl-9 w-[320px] bg-white border-slate-200 h-9 text-sm focus-visible:ring-brand-primary-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-slate-600 border-slate-200">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-2 text-slate-600 border-slate-200">
                      <Download className="h-3.5 w-3.5" />
                      <span>Export</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="animate-spin h-8 w-8 border-3 border-brand-primary-500 border-t-transparent rounded-full"></div>
                    <p className="text-slate-400 text-sm font-medium">Syncing quotations...</p>
                  </div>
                ) : sortedAndFilteredQuotations.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center gap-4">
                    <div className="bg-slate-50 p-4 rounded-full">
                      <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold">No quotations found</p>
                      <p className="text-slate-500 text-sm mt-1">
                        {searchQuery ? "Try adjusting your search filters." : "Start by creating your first quotation."}
                      </p>
                    </div>
                    {!searchQuery && (
                      <Button onClick={handleCreateNew} variant="outline" className="mt-2 border-slate-200">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Quotation
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="table-fixed w-full">
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-b border-slate-200 h-auto">
                          <TableHead className="w-[50px] font-bold text-slate-800 text-left uppercase text-[10px] tracking-wider py-3 px-4 align-top h-auto leading-5">Q.No</TableHead>
                          <TableHead 
                            onClick={() => handleSort('title')}
                            className="w-[180px] font-bold text-slate-800 text-left uppercase text-[10px] tracking-wider py-3 px-4 align-top h-auto leading-5 cursor-pointer group"
                          >
                            <div className="flex items-center">Quotation {getSortIcon('title')}</div>
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('status')}
                            className="w-[100px] font-bold text-slate-800 text-left uppercase text-[10px] tracking-wider py-3 px-4 align-top h-auto leading-5 cursor-pointer group"
                          >
                            <div className="flex items-center">Version {getSortIcon('status')}</div>
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('clientName')}
                            className="w-[140px] font-bold text-slate-800 text-left uppercase text-[10px] tracking-wider py-3 px-4 align-top h-auto leading-5 cursor-pointer group"
                          >
                            <div className="flex items-center">Client Name {getSortIcon('clientName')}</div>
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('createdAt')}
                            className="w-[140px] font-bold text-slate-800 text-left uppercase text-[10px] tracking-wider py-3 px-4 align-top h-auto leading-5 cursor-pointer group"
                          >
                            <div className="flex items-center">Created {getSortIcon('createdAt')}</div>
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('updatedAt')}
                            className="w-[140px] font-bold text-slate-800 text-left uppercase text-[10px] tracking-wider py-3 px-4 align-top h-auto leading-5 cursor-pointer group"
                          >
                            <div className="flex items-center">Modified {getSortIcon('updatedAt')}</div>
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('amount')}
                            className="w-[140px] font-bold text-slate-800 text-left uppercase text-[10px] tracking-wider py-3 px-4 align-top h-auto leading-5 cursor-pointer group"
                          >
                            <div className="flex items-center">Amount {getSortIcon('amount')}</div>
                          </TableHead>
                          <TableHead 
                            onClick={() => handleSort('queryStatus')}
                            className="w-[140px] font-bold text-slate-800 text-left uppercase text-[10px] tracking-wider py-3 px-4 align-top h-auto leading-5 cursor-pointer group"
                          >
                            <div className="flex items-center">Query Status {getSortIcon('queryStatus')}</div>
                          </TableHead>
                          <TableHead className="w-[120px] font-bold text-slate-800 text-left uppercase text-[10px] tracking-wider py-3 px-4 align-top h-auto leading-5">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedAndFilteredQuotations.map((quotation, index) => (
                          <React.Fragment key={quotation._id}>
                            <TableRow className="group hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                              <TableCell className="text-left align-top py-3 px-4">
                                <span className="text-slate-400 text-sm font-semibold leading-5">{index + 1}</span>
                              </TableCell>
                              <TableCell className="align-top py-3 px-4">
                                <div className="flex flex-col items-start gap-1 leading-5">
                                  <span className="font-bold text-slate-900 text-sm leading-tight truncate max-w-[180px]" title={quotation.title}>
                                    {quotation.title}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium leading-none">
                                    <MapPin className="h-3 w-3 text-slate-400" />
                                    <span>{quotation.destination}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="align-top py-3 text-left px-4">
                                <div className="flex items-start justify-start gap-1 leading-none mt-0.5">
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">V{quotation.currentVersion || 1}</span>
                                  <StatusBadge status={quotation.status} />
                                </div>
                              </TableCell>
                              <TableCell className="align-top py-3 px-4 text-left">
                                <span className="font-semibold text-slate-700 text-sm leading-5 truncate max-w-[130px]">
                                  {quotation.client?.name || 'Unspecified'}
                                </span>
                              </TableCell>
                              <TableCell className="align-top py-3 text-left px-4">
                                <div className="flex flex-col items-start leading-5 gap-0.5">
                                  <span className="text-sm text-slate-600 font-semibold leading-none whitespace-nowrap">
                                    {quotation.createdAt ? formatDate(quotation.createdAt) : '-'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                                    {quotation.createdAt ? formatTime(quotation.createdAt) : ''} by {(quotation.createdByUser || "Agent").split(' ')[0]}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="align-top py-3 text-left px-4">
                                <div className="flex flex-col items-start leading-5 gap-0.5">
                                  <span className="text-sm text-slate-600 font-semibold leading-none whitespace-nowrap">
                                    {quotation.updatedAt ? formatDate(quotation.updatedAt) : '-'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                                    {quotation.updatedAt ? formatTime(quotation.updatedAt) : ''} by {(quotation.lastUpdatedBy || "Agent").split(' ')[0]}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="align-top py-3 text-left px-4">
                                <span className="font-bold text-slate-900 text-sm leading-5 tracking-tight">
                                  {formatCurrency(
                                    quotation.pricingOptions?.finalTotalPrice || quotation.totalPrice,
                                    quotation.currency
                                  )}
                                </span>
                              </TableCell>
                              <TableCell className="align-top py-3 text-left px-4">
                                <div className="leading-none flex justify-start items-start">
                                  <QueryStatusBadge 
                                    quotationId={quotation._id!} 
                                    status={quotation.queryStatus || "pending"} 
                                    onUpdate={updateQuotation}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-left align-top py-3 px-4">
                                <div className="flex flex-col items-start">
                                  <div className="flex items-start justify-start gap-1 leading-none">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 hover:bg-slate-100 text-slate-500 hover:text-brand-primary-600 transition-colors"
                                      onClick={() => handleView(quotation)}
                                      title="Preview"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 hover:bg-slate-100 text-slate-500 hover:text-brand-primary-600 transition-colors"
                                      onClick={() => router.push(`/quotation-builder/${quotation._id}`)}
                                      title="Edit"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                                          <MoreHorizontal className="h-3.5 w-3.5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="start" className="w-52 p-1 border-slate-200 shadow-lg">
                                        <DropdownMenuItem onClick={() => handleView(quotation)} className="gap-2 py-2">
                                          <Eye className="h-4 w-4 text-blue-500" />
                                          <span>View Full Preview</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push(`/quotation-builder/${quotation._id}`)} className="gap-2 py-2">
                                          <Pencil className="h-4 w-4 text-indigo-500" />
                                          <span>Advanced Editor</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 py-2">
                                          <Send className="h-4 w-4 text-emerald-500" />
                                          <span>Send to Client</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.print()} className="gap-2 py-2">
                                          <Printer className="h-4 w-4 text-slate-500" />
                                          <span>Generate PDF</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 py-2">
                                          <Copy className="h-4 w-4 text-blue-500" />
                                          <span>Clone Quotation</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-rose-600 focus:text-rose-600 gap-2 py-2"
                                          onClick={() => {
                                            setSelectedQuotation(quotation)
                                            setDeleteDialogOpen(true)
                                          }}
                                        >
                                          <Trash className="h-4 w-4" />
                                          <span>Delete Record</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  
                                  <div className="mt-1.5 leading-none text-left w-full">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleRow(quotation._id!);
                                      }}
                                      className="text-slate-400 hover:text-brand-primary-600 text-[10px] font-bold uppercase tracking-tight whitespace-nowrap flex items-center gap-1 transition-colors leading-none"
                                    >
                                      {expandedRows[quotation._id!] ? "hide details" : "view details"}
                                    </button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                            
                            {/* Expanded Rows (Past Versions) */}
                            {expandedRows[quotation._id!] && (quotation.versionHistory || [])
                              .filter((v: any) => v.versionNumber !== quotation.currentVersion)
                              .sort((a: any, b: any) => b.versionNumber - a.versionNumber)
                              .map((ver: any) => (
                                <TableRow key={`${quotation._id}-v${ver.versionNumber}`} className="bg-slate-50/30 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors h-auto">
                                  <TableCell className="text-left align-top py-3 px-4 opacity-30">
                                    <span className="text-slate-400 text-sm font-semibold leading-5">{index + 1}</span>
                                  </TableCell>
                                  <TableCell className="align-top py-3 px-4">
                                    <div className="flex flex-col items-start gap-1 leading-5">
                                      <span className="font-semibold text-slate-500 text-sm leading-tight truncate max-w-[180px]">
                                        {quotation.title} (v{ver.versionNumber})
                                      </span>
                                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium leading-none">
                                        <MapPin className="h-3 w-3" />
                                        <span>{quotation.destination}</span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-top py-3 text-left px-4">
                                    <div className="flex items-start justify-start gap-1 leading-none mt-0.5">
                                      <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded">V{ver.versionNumber}</span>
                                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 opacity-40 border-slate-200 uppercase font-bold text-slate-400 leading-none">
                                        LOCKED
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-top py-3 px-4 text-left">
                                    <span className="font-medium text-slate-400 text-sm leading-5 truncate max-w-[130px]">
                                      {quotation.client?.name || 'Unspecified'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="align-top py-3 text-left px-4">
                                    <div className="flex flex-col items-start leading-5 gap-0.5">
                                      <span className="text-sm text-slate-400 font-medium leading-none whitespace-nowrap">
                                        {ver.createdAt ? formatDate(ver.createdAt) : '-'}
                                      </span>
                                      <span className="text-[10px] text-slate-300 font-medium leading-none mt-1 uppercase">
                                        {ver.createdAt ? formatTime(ver.createdAt) : ''} 
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-top py-3 text-left px-4">
                                    <div className="flex flex-col items-start leading-5 gap-0.5">
                                      <span className="text-sm text-slate-400 font-medium leading-none whitespace-nowrap">
                                        {ver.lockedAt ? formatDate(ver.lockedAt) : (ver.createdAt ? formatDate(ver.createdAt) : '-')}
                                      </span>
                                      <span className="text-[10px] text-slate-300 font-medium leading-none mt-1 uppercase">
                                        {ver.lockedAt ? formatTime(ver.lockedAt) : (ver.createdAt ? formatTime(ver.createdAt) : '')}
                                        <span className="ml-1 opacity-70">by {(ver.lockedBy || "Agent").split(' ')[0]}</span>
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-top py-3 text-left px-4">
                                    <div className="leading-none flex justify-start items-start opacity-30 pointer-events-none">
                                      <QueryStatusBadge 
                                        quotationId={quotation._id!} 
                                        status={ver.state?.queryStatus || "pending"} 
                                        onUpdate={updateQuotation}
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-top py-3 text-left px-4">
                                    <span className="font-semibold text-slate-400 text-sm leading-5 tracking-tight opacity-70">
                                      {formatCurrency(ver.state?.totalPrice || ver.totalPrice || quotation.totalPrice, quotation.currency)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-left align-top py-3 px-4">
                                    <div className="flex items-start justify-start gap-1 leading-none">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-slate-400 hover:bg-white hover:text-brand-primary-600 border border-slate-200 transition-colors"
                                        onClick={() => handleView({ ...quotation, ...ver.state, currentVersion: ver.versionNumber })}
                                        title="View Version"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-rose-600 flex items-center gap-2">
                    <Trash className="h-5 w-5" />
                    Delete Quotation
                  </DialogTitle>
                  <DialogDescription className="pt-2 text-slate-600">
                    You are about to permanently delete this quotation record. All associated data will be removed. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-slate-200">
                    Keep Record
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                    Confirm Deletion
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
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
      <ItinerarySetupModal
        isOpen={showItinerarySetupModal}
        onClose={handleSetupModalClose}
        onCreate={handleItinerarySetupComplete}
        onCopy={handleSetupCopy}
      />
    </div>
  )
}
