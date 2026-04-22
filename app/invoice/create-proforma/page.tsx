"use client"

import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"

export default function CreateProformaPage() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto animate-fade-in p-6">
          <h1 className="text-2xl font-semibold mb-6">Create Proforma Invoice / PO</h1>
          <div className="text-center">
            <h2 className="text-xl mb-4">Coming Soon</h2>
            <Button disabled>
              Create New Proforma
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
