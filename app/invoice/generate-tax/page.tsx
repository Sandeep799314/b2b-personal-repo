"use client"

import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"

export default function GenerateTaxPage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto animate-fade-in p-6">
          <h1 className="text-2xl font-semibold mb-6">Generate Tax Invoice</h1>
          <div className="text-center">
            <p className="text-lg">No Proforma Invoice Found</p>
          </div>
        </main>
      </div>
    </div>
  )
}
