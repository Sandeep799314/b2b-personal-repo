import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react"

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

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Across all {totalQuotations} quotations
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Quotations</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeQuotations}</div>
                    <p className="text-xs text-muted-foreground">
                        Drafts and sent quotes
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{conversionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                        {convertedQuotations} accepted quotes
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {totalQuotations > 0
                            ? (totalValue / totalQuotations).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                            : '$0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Per quotation
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
