"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DatePicker({ value, onChange, bookedDates, disabledDates = [], minDate = null }) {
  const [displayMonth, setDisplayMonth] = useState(value ? new Date(value) : new Date())

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  
//   const isDisabled = (date) => {
//   return bookedDates.some(b => {
//     const start = new Date(b.checkIn)
//     const end = new Date(b.checkOut)
//     date.setHours(12,0,0,0)
//     return date >= start && date <= end
//   })
// }

const isDisabled = (date) => {
  const target = new Date(date)
  target.setHours(12,0,0,0)

  return bookedDates.some((b) => {
    const start = new Date(b.checkIn)
    const end = new Date(b.checkOut)
    start.setHours(0,0,0,0)
    end.setHours(23,59,59,999)

    return target >= start && target <= end
  })
}


  const isPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isBeforeMin = (date) => {
    if (!minDate) return false
    const minDateObj = new Date(minDate)
    minDateObj.setHours(0, 0, 0, 0)
    return date < minDateObj
  }

  const handleDateClick = (day) => {
    const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
    const dateStr = date.toISOString().split("T")[0]

    if (!isDisabled(date) && !isPast(date) && !isBeforeMin(date)) {
      onChange(dateStr)
    }
  }

  const daysInMonth = getDaysInMonth(displayMonth)
  const firstDay = getFirstDayOfMonth(displayMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null)

  const monthName = displayMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="w-full p-4 border border-border rounded-lg bg-card">
      <div className="flex justify-between items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))}
        >
          <ChevronLeft size={18} />
        </Button>
        <h4 className="font-semibold text-foreground">{monthName}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))}
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-foreground/60 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...emptyDays, ...days].map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day)
          const dateStr = date.toISOString().split("T")[0]
          const isSelected = value === dateStr
          const disabled = isDisabled(date) || isPast(date) || isBeforeMin(date)

          return (
            <button
              type="button"
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={`aspect-square rounded-md text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : disabled
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : "hover:bg-secondary/50 text-foreground cursor-pointer"
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className="mt-4 text-xs text-foreground/60 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-destructive rounded-sm" />
          <span>Booked dates unavailable</span>
        </div>
      </div>
    </div>
  )
}
