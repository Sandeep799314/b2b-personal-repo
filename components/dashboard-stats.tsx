import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, FileText, CheckCircle2, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
    quotations: any[]
}

export function DashboardStats({ quotations }: DashboardStatsProps) {
    // Calculate stats
    const totalQuotations = quotations.length
    const activeQuotations = quotations.filter(q => ['draft', 'sent'].includes(q.status)).length
    const convertedQuotations = quotations.filter(q => q.status === 'accepted').length

    const totalValue = quotations.reduce((sum, q) => {
        return sum + (q.pricingOptions?.finalTotalPrice || q.totalPrice || 0)
    }, 0)

    const conversionRate = totalQuotations > 0
        ? Math.round((convertedQuotations / totalQuotations) * 100)
        : 0

    const formatValue = (val: number) => {
        return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-600">Total Pipeline Value</CardTitle>
                    <div className="p-2 bg-brand-primary-50 rounded-lg">
                        <IndianRupee className="h-4 w-4 text-brand-primary-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                        {formatValue(totalValue)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        ACROSS {totalQuotations} QUOTATIONS
                    </p>
                </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-600">Active Proposals</CardTitle>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{activeQuotations}</div>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        DRAFTS AND SENT QUOTES
                    </p>
                </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-600">Conversion Rate</CardTitle>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{conversionRate}%</div>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium uppercase">
                        {convertedQuotations} ACCEPTED CONTRACTS
                    </p>
                </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-600">Average Deal Size</CardTitle>
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                        {totalQuotations > 0
                            ? formatValue(totalValue / totalQuotations)
                            : '₹0'}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        PER OPPORTUNITY
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
