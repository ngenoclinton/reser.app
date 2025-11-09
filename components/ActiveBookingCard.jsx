"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Calendar, Clock, DollarSign, AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import BookingStatusBadge from "@/components/BookingStatusBadge"
import CancellationModal from "@/components/CancellationModal"

export default function ActiveBookingCard({ booking, onCancel }) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const checkIn = new Date(booking.check_in)
  const checkOut = new Date(booking.check_out)

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const daysUntil = Math.ceil((checkIn - new Date()) / (1000 * 60 * 60 * 24))
  const canCancelFreely = daysUntil > 2

  return (
    <div className="">
      <Card className="max-w-6xl p-6 border border-border hover:shadow-lg transition-shadow">
        {/* Header with Status */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{booking.room_name}</h3>
            <p className="text-sm text-foreground/60 flex items-center gap-1 mt-1">
              <MapPin size={16} />
              {booking.location || "Location"}
            </p>
          </div>
          <BookingStatusBadge status={booking.booking_status} />
        </div>

        {/* Booking Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-foreground/70">
            <Calendar size={18} className="text-primary" />
            <span className="text-sm">
              <strong>Check-in:</strong> {formatDate(checkIn)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground/70">
            <Clock size={18} className="text-primary" />
            <span className="text-sm">
              <strong>Check-out:</strong> {formatDate(checkOut)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground/70">
            <DollarSign size={18} className="text-primary" />
            <span className="text-sm">
              <strong>Total:</strong> ${booking.total_amount?.toFixed(2)} ({booking.total_hours}h)
            </span>
          </div>
        </div>

        {/* Payment Status */}
        {booking.booking_status === "pending_deposit" && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              50% deposit (${booking.deposit_amount?.toFixed(2)}) required to confirm booking
            </AlertDescription>
          </Alert>
        )}

        {/* Cancellation Warning */}
        {daysUntil <= 2 && booking.booking_status === "confirmed" && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              Cancelling within 24 hours will result in no refund
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Link href={`/rooms/${booking.$id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              View Details
            </Button>
          </Link>
          {booking.booking_status !== "completed" && booking.booking_status !== "cancelled" && (
            <Button variant="destructive" size="icon" onClick={() => setShowCancelModal(true)} title="Cancel booking" className="w-fit p-2">
              Cancel <Trash2 size={18} />
            </Button>
          )}
        </div>
      </Card>

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={booking}
        onConfirm={(refundAmount, refundPercentage) => {
          onCancel(booking.$id)
          setShowCancelModal(false)
        }}
      />
    </div>
  )
}
