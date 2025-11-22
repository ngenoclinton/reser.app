import { createAdminClient } from "@/config/appwriteServer"

export async function POST(request) {
  try {
    const body = await request.json()
    const { bookingId, amount, reason } = body

    const { databases } = await createAdminClient()

    // Get booking to verify M-Pesa payment
    const booking = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
    )

    if (booking.payment_method !== "mpesa" || booking.payment_status !== "paid") {
      return Response.json({ success: false, error: "Only M-Pesa payments can be refunded" }, { status: 400 })
    }

    // Initiate M-Pesa B2C refund
    const refundResult = await initiateMpesaRefund(booking.booker_phone, amount, booking.mpesa_receipt, bookingId)

    if (refundResult.success) {
      // Update booking with refund status
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_BOOKINGS,
        bookingId,
        {
          refund_status: "processing",
          refund_amount: amount,
          refund_reason: reason,
          updated_at: new Date().toISOString(),
        },
      )

      // Send SMS notification
      await sendSMS(
        booking.booker_phone,
        `Refund of KES ${amount} is being processed to your M-Pesa account. Reference: ${bookingId}`,
      )

      return Response.json({ success: true, message: "Refund initiated" })
    } else {
      return Response.json({ success: false, error: "Refund initiation failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Refund error:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

async function initiateMpesaRefund(phoneNumber, amount, originalReceipt, bookingId) {
  try {
    // Placeholder for M-Pesa B2C refund implementation
    console.log(`[v0] Initiating M-Pesa refund: ${phoneNumber}, amount: ${amount}, reference: ${originalReceipt}`)

    return {
      success: true,
      transactionId: `REFUND_${bookingId}`,
    }
  } catch (error) {
    console.error("M-Pesa refund error:", error)
    return { success: false, error: error.message }
  }
}

async function sendSMS(phoneNumber, message) {
  try {
    console.log(`[v0] SMS to ${phoneNumber}: ${message}`)
  } catch (error) {
    console.error("SMS error:", error)
  }
}
