"use client"
import { MapPin, Calendar, DollarSign, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import BookingStatusBadge from "@/components/BookingStatusBadge"

export default function PastBookingCard({ booking }) {
  const checkIn = new Date(booking.check_in)
  const checkOut = new Date(booking.check_out)

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="p-6 border border-border bg-muted/30 opacity-75">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{booking.room_name}</h3>
          <p className="text-sm text-foreground/60 flex items-center gap-1 mt-1">
            <MapPin size={16} />
            {booking.location || "Location"}
          </p>
        </div>
        <BookingStatusBadge booking_status="completed" />
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

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Star size={16} className="mr-1" />
          Leave Review
        </Button>
      </div>
    </Card>
  )
}
