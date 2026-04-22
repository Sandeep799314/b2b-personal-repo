"use client"

import { useRouter } from "next/navigation"

import { TopHeader } from "@/components/top-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FinancePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <TopHeader />
      <main className="flex-1 overflow-auto animate-fade-in p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Finance</h1>
          <p className="text-neutral-600">
            Manage billing workflows and access invoicing tools from one place.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card className="shadow-brand-sm border-yellow-200/60">
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Create proforma documents or generate finalized tax invoices for your bookings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-neutral-600">
              <p>
                Continue to the invoice workspace to prepare proforma invoices, purchase orders, or download tax
                copies for clients and suppliers.
              </p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button onClick={() => router.push("/invoice")}>
                Open Invoice Workspace
              </Button>
              <Button variant="outline" onClick={() => router.push("/invoice/create-proforma")}>
                Create Proforma / PO
              </Button>
              <Button variant="outline" onClick={() => router.push("/invoice/generate-tax")}>
                Generate Tax Invoice
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
