"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { GlobalHeader } from "./global-header"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
    children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname()

    // Determine if we should start collapsed (editor/preview modes)
    const shouldStartCollapsed = pathname.includes("/builder") || pathname.includes("/preview") || pathname.includes("/editor")

    const [collapsed, setCollapsed] = useState(false)

    // Sync collapsed state when pathname changes to these specific routes if needed, 
    // or just let the user control it after initial load. 
    // For now, let's respect the user's manual toggle, but auto-collapse on enter if it's these pages.
    useEffect(() => {
        if (shouldStartCollapsed) {
            setCollapsed(true)
        }
    }, [shouldStartCollapsed])

    const isWeblinkPage = pathname.startsWith('/weblinks')
    const isEditorPage = pathname.includes("/builder") || pathname.includes("/preview") || pathname.includes("/editor")
    
    // Hide header on weblinks always. 
    // Show header on all other pages including editor pages in both mobile and desktop.
    const showGlobalHeader = !isWeblinkPage

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {showGlobalHeader && <GlobalHeader />}
            
            {/* Sidebar container - hidden on mobile, fixed on desktop */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 h-full hidden lg:block", 
                showGlobalHeader && "top-12"
            )}>
                <Sidebar
                    activeView={pathname.split('/')[1] || 'dashboard'}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
            </div>

            <main
                className={cn(
                    "flex-1 transition-all duration-300 min-h-screen w-full",
                    // Only apply margins on desktop
                    collapsed ? "lg:ml-16" : "lg:ml-64",
                    (showGlobalHeader || (!isEditorPage && !isWeblinkPage)) && "pt-12"
                )}
            >
                {children}
            </main>
        </div>
    )
}
