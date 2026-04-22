"use client"

import Image from "next/image"
import travLogo from "../trav_platforms_logo.jpg"

export function GlobalHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-[60] h-16 bg-white border-b border-yellow-200">
            <div className="h-full w-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center px-4">
                <div className="h-10 bg-white rounded-lg px-3 py-1 flex items-center shadow-sm">
                    <div className="font-bold text-yellow-600">TRAV PLATFORMS</div>
                </div>
            </div>
        </header>
    )
}
