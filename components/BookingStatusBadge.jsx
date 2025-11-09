"use client"
import { Clock, CheckCircle2, XCircle, Archive } from "lucide-react"

export default function BookingStatusBadge({ booking_status }) {
  const statusConfig = {
    pending_deposit: {
      label: "Awaiting Payment",
      variant: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    confirmed: {
      label: "Confirmed",
      variant: "bg-blue-100 text-blue-800",
      icon: CheckCircle2,
    },
    completed: {
      label: "Completed",
      variant: "bg-green-100 text-green-800",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      variant: "bg-red-100 text-red-800",
      icon: XCircle,
    },
    past: {
      label: "Past Booking",
      variant: "bg-gray-100 text-gray-800",
      icon: Archive,
    },
  }

  const config = statusConfig[booking_status] || statusConfig.pending_deposit
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.variant}`}>
      <Icon size={16} />
      {config.label}
    </div>
  )
}
