"use client"

import { AgentDashboard } from "@/components/agent-dashboard"
import { TopHeader } from "@/components/top-header"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <TopHeader />
      <main className="flex-1 overflow-auto animate-fade-in">
        <AgentDashboard onViewItinerary={(id) => router.push(`/itinerary?id=${id}`)} />
      </main>
    </div>
  )
}
