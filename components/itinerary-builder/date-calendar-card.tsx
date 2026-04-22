"use client"

interface DateCalendarCardProps {
    date: string
}

export function DateCalendarCard({ date }: DateCalendarCardProps) {
    // Parse the date
    const d = new Date(date)
    const month = d.toLocaleDateString('en', { month: 'short' }).toUpperCase()
    const day = d.getDate()

    return (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded px-1.5 py-1 min-w-[35px] shadow-sm">
            <div className="text-orange-500 font-bold text-[8px] leading-none tracking-tight">
                {month}
            </div>
            <div className="text-gray-800 font-black text-base leading-none mt-0.5">
                {day}
            </div>
        </div>
    )
}
