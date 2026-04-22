"use client"

import { SavedPackages } from "@/components/saved-packages"
import { TopHeader } from "@/components/top-header"
import { Sidebar } from "@/components/sidebar"
import { useRouter } from "next/navigation"

export default function SavedPage() {
  const router = useRouter()

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto animate-fade-in">
          <SavedPackages onViewItinerary={(id) => router.push(`/itinerary?id=${id}`)} />
        </main>
      </div>
    </div>
  )
}
