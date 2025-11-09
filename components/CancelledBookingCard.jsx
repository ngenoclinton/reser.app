"use client"

import { MapPin, Calendar, DollarSign, RotateCcw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import BookingStatusBadge from "@/components/BookingStatusBadge"

export default function CancelledBookingCard({ booking }) {
  const checkIn = new Date(booking.check_in)
  const checkOut = new Date(booking.check_out)
  const cancelledAt = booking.cancelled_at ? new Date(booking.cancelled_at) : null

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="p-6 border border-red-200 bg-red-50/30">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{booking.room_name}</h3>
          <p className="text-sm text-foreground/60 flex items-center gap-1 mt-1">
            <MapPin size={16} />
            {booking.location || "Location"}
          </p>
        </div>
        <BookingStatusBadge booking_status="cancelled" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-foreground/70">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          <span>
            {formatDate(checkIn)} - {formatDate(checkOut)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-primary" />
          <span>${booking.total_amount?.toFixed(2)}</span>
        </div>
      </div>

      {/* Cancellation Details */}
      {booking.refund_amount !== undefined && (
        <Alert className="border-amber-200 bg-amber-50">
          <RotateCcw className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            <div className="font-semibold mb-1">Refund Processed</div>
            <div>{booking.refund_reason}</div>
            <div className="mt-2">
              Refunded: ${booking.refund_amount?.toFixed(2)} ({booking.refund_percentage}%)
            </div>
          </AlertDescription>
        </Alert>
      )}

      {cancelledAt && <p className="text-xs text-foreground/60 mt-4">Cancelled on {formatDate(cancelledAt)}</p>}
    </Card>
  )
}
