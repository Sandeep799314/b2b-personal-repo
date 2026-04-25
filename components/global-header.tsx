"use client"

import Image from "next/image"
import travLogo from "../trav_platforms_logo.jpg"

export function GlobalHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-[60] h-12 bg-white border-b border-yellow-200">
            <div className="h-full w-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center px-6 lg:px-8">
                <div className="h-9 bg-white rounded-lg px-4 py-1 flex items-center shadow-sm ml-2 lg:ml-4">
                    <Image 
                        src="/logo3.png" 
                        alt="Company Logo" 
                        width={150} 
                        height={30} 
                        className="h-7 w-auto object-contain"
                        priority
                    />
                </div>
            </div>
        </header>
    )
}
