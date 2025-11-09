"use client"

import { useState } from "react"
import { AlertCircle, DollarSign, Clock, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import cancelBookingWithRefund from "@/app/server-actions/cancelBookingWithRefund"
import { useAuth } from "@/context/authLogContext"
import CancelBookingButton from "@/components/CancelBookingButton"; 

export default function CancellationModal({ isOpen, onClose, booking, onConfirm }) {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const checkInTime = new Date(booking.check_in)
  const now = new Date()
  const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60)

  let refundInfo = {}
  if (hoursUntilCheckIn > 48) {
    refundInfo = {
      percentage: 100,
      reason: "Full refund - cancelled more than 48 hours before",
      color: "green",
    }
  } else if (hoursUntilCheckIn > 24) {
    refundInfo = {
      percentage: 50,
      reason: "50% refund - cancelled 24-48 hours before",
      color: "yellow",
    }
  } else {
    refundInfo = {
      percentage: 0,
      reason: "No refund - cancelled within 24 hours",
      color: "red",
    }
  }

  const refundAmount = (booking.total_amount * refundInfo.percentage) / 100

  const handleCancelBooking = async () => {
    if (!user?.$id) {
      toast.error("User not authenticated")
      return
    }

    setIsProcessing(true)
    try {
      const result = await cancelBookingWithRefund(booking.$id, user.$id)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          `Booking cancelled. ${
            result.refundAmount > 0 ? `Refund: $${result.refundAmount.toFixed(2)}` : "No refund applicable"
          }`,
        )
        onConfirm(result.refundAmount, result.refundPercentage)
        onClose()
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to cancel booking")
    } finally {
      setIsProcessing(false)
    }
  }

  const colorClasses = {
    green: "border-green-200 bg-green-50",
    yellow: "border-yellow-200 bg-yellow-50",
    red: "border-red-200 bg-red-50",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="text-destructive" size={24} />
            Cancel Booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="font-semibold text-foreground">{booking.room_name}</p>
            <div className="text-sm text-foreground/70">
              <p className="flex items-center gap-2">
                <Clock size={16} />
                Check-in: {checkInTime.toLocaleDateString()}
              </p>
              <p className="flex items-center gap-2">
                <DollarSign size={16} />
                Total: ${booking.total_amount?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Refund Information */}
          <Alert className={colorClasses[refundInfo.color]}>
            <RotateCcw className={`h-4 w-4 text-${refundInfo.color}-600`} />
            <AlertDescription className={`text-${refundInfo.color}-800`}>
              <div className="font-semibold mb-1">{refundInfo.reason}</div>
              <div className="text-lg font-bold">
                Refund: ${refundAmount.toFixed(2)} ({refundInfo.percentage}%)
              </div>
            </AlertDescription>
          </Alert>

          {/* Time Warning */}
          {hoursUntilCheckIn <= 24 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Cancelling within 24 hours will result in no refund.
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation Text */}
          <p className="text-sm text-foreground/70">Once cancelled, this booking cannot be recovered. Are you sure?</p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Keep Booking
          </Button>
          <Button variant="destructive" onClick={handleCancelBooking} disabled={isProcessing}>
            {isProcessing ? "Cancelling..." : "Cancel Booking"}
          </Button>
          {/* <CancelBookingButton bookingId={booking.$id}/> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
