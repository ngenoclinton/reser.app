import { createAdminClient } from "@/config/appwriteServer"

export async function POST(request) {
  try {
    const body = await request.json()
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = body.Body.stkCallback

    const { databases } = await createAdminClient() 

    if (ResultCode === 0) {
      // Payment successful
      const amount = CallbackMetadata.Item.find((item) => item.Name === "Amount")?.Value
      const mpesaCode = CallbackMetadata.Item.find((item) => item.Name === "MpesaReceiptNumber")?.Value
      const phone = CallbackMetadata.Item.find((item) => item.Name === "PhoneNumber")?.Value

      // Extract booking ID from MerchantRequestID or metadata
      const bookingId = MerchantRequestID.split("_")[1]

      const updatedBooking = await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_BOOKINGS,
        bookingId,
        {
          payment_status: "paid",//if deposit should set status to partial
          booking_status: "confirmed",
          mpesa_receipt: mpesaCode,
          updated_at: new Date().toISOString(),
        },
      )

      // Send SMS confirmation
      await sendSMS(phone, `Booking ${bookingId} confirmed! Amount: KES ${amount}. Receipt: ${mpesaCode}`)

      return Response.json({ success: true, message: "Payment confirmed" })
    } else {
      // Payment failed - auto-cancel booking
      console.log("Payment failed:", ResultDesc)
      return Response.json({ success: false, message: "Payment verification failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("M-Pesa callback error:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

async function sendSMS(phoneNumber, message) {
  try {
    // Placeholder for SMS integration (Africa's Talking)
    console.log(`[v0] SMS to ${phoneNumber}: ${message}`)
    // In production: implement Africa's Talking API call
  } catch (error) {
    console.error("SMS error:", error)
  }
}
