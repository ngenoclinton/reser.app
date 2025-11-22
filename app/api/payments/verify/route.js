import { createAdminClient } from "@/config/appwriteServer"
import { sendSMS } from "@/utils/sendSMS" // Declare the sendSMS variable

export async function POST(request) {
  try {
    const body = await request.json()
    const { bookingId, status, transactionId } = body

    const { databases } = await createAdminClient()

    // Update booking status
    const updatedBooking = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        payment_status: status === "success" ? "paid" : "failed",
        booking_status: status === "success" ? "confirmed" : "pending_payment",
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      },
    )

    // Send SMS notification
    if (status === "success") {
      await sendSMS(
        updatedBooking.booker_phone,
        `Your Reser booking ${bookingId} is confirmed! Details will be sent shortly.`,
      )
    }

    return Response.json({ success: true, booking: updatedBooking })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
