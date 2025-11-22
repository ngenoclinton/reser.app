"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/config/appwriteServer"

/**
 * Cancel a booking and handle refunds based on cancellation policy
 * Cancellations more than 48 hours before = 100% refund
 * Cancellations 24-48 hours before = 50% refund
 * Cancellations within 24 hours = no refund
 */
async function cancelBookingWithRefund(bookingId, userId) {
  if (!userId) {
    return { error: "User not authenticated" }
  }

  try {
    const { databases } = await createAdminClient()

    // Fetch booking
    const booking = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
    )

    // Authorization check
    if (booking.user_id !== userId) {
      return { error: "You are not authorized to cancel this booking" }
    }

    // Calculate refund based on cancellation policy
    const checkInTime = new Date(booking.check_in)
    const now = new Date()
    const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60)

    let refundPercentage = 0
    let refundReason = ""

    if (hoursUntilCheckIn > 48) {
      refundPercentage = 100
      refundReason = "Full refund - cancelled more than 48 hours before"
    } else if (hoursUntilCheckIn > 24) {
      refundPercentage = 50
      refundReason = "50% refund - cancelled 24-48 hours before"
    } else {
      refundPercentage = 0
      refundReason = "No refund - cancelled within 24 hours"
    }

    const refundAmount = (booking.total_amount * refundPercentage) / 100

    // Create history record
    const cancelledBooking = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        booking_status: "cancelled",
        cancelled_at: new Date().toISOString(),
        refund_percentage: refundPercentage,
        refund_amount: refundAmount,
        refund_reason: refundReason,
      },
    )

    revalidatePath("/bookings")

    return {
      success: true,
      booking: cancelledBooking,
      refundAmount,
      refundPercentage,
    }
  } catch (error) {
    console.error("Failed to cancel booking:", error.message)
    return { error: error.message || "Failed to cancel booking" }
  }
}

export default cancelBookingWithRefund
