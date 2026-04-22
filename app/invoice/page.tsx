"use client"

import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"

export default function InvoicePage() {
  const router = useRouter()

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto animate-fade-in p-6">
          <h1 className="text-2xl font-semibold mb-6">Invoice</h1>
          <div className="space-x-4">
            <Button onClick={() => router.push("/invoice/create-proforma")}>
              Create Proforma Invoice / PO
            </Button>
            <Button onClick={() => router.push("/invoice/generate-tax")}>
              Generate Tax Invoice
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
