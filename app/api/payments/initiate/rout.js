import { createAdminClient } from "@/config/appwriteServer"

export async function POST(request) {
  try {
    const body = await request.json()
    
    const {
      userId,
      roomId,

      roomName,

      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,

      amount,
      price_per_hour,
      total_hours,

      paymentMethod,
      bookingDetails,
    } = body

    const { databases } = await createAdminClient()

    // Calculate deposit (50%)
    const depositAmount = Math.round(amount * 0.5 * 100) / 100

    // Create booking document
    const booking = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      "unique()",
      {
        user_id: userId,
        room_id: roomId,

        room_name:roomName,
        price_per_hour:Number(price_per_hour), 
        total_hours:Number(total_hours), 

        check_in: checkInDate,
        // check_in_time: checkInTime,
        check_out: checkOutDate,
        // check_out_time: checkOutTime,
        total_amount: Number(amount),
        deposit_amount: Number(depositAmount),
        payment_method: paymentMethod,

        payment_status: "pending",
        // payment_status: paymentMethod === "cash" ? "confirmed" : "pending_deposit",
        
        booker_name: bookingDetails.bookerName,
        booker_email: bookingDetails.bookerEmail,
        booker_phone: bookingDetails.bookerPhone,
        company_name: bookingDetails.companyName || "",
        special_requests: bookingDetails.specialRequests || "",
        attendee_count: Number(bookingDetails.attendeeCount) || 1,
      },
    )

    if (paymentMethod === "cash") {
      // For cash, just confirm and send SMS
      return Response.json({
        success: true,
        bookingId: booking.$id,
        message: "Booking confirmed! Pay on arrival.",
        paymentRequired: false,
      })
    }

    if (paymentMethod === "mpesa") {
      // Initiate M-Pesa STK Push
      const phoneNumber = bookingDetails.bookerPhone.replace(/^0/, "254") // Convert to international format
      const stkResponse = await initiateMpesaSTK(phoneNumber, depositAmount, booking.$id)

      if (stkResponse.success) {
        return Response.json({
          success: true,
          bookingId: booking.$id,
          message: "Payment request sent to your phone",
          stkRequestId: stkResponse.requestId,
          expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
        })
      } else {
        return Response.json({ success: false, error: "Failed to initiate M-Pesa payment" }, { status: 400 })
      }
    }

    if (paymentMethod === "card") {
      // For Stripe, return booking ID for next step
      return Response.json({
        success: true,
        bookingId: booking.$id,
        depositAmount,
        message: "Ready for card payment",
      })
    }

    return Response.json({ success: false, error: "Invalid payment method" }, { status: 400 })
  } catch (error) {
    console.error("Error initiating payment:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

async function initiateMpesaSTK(phoneNumber, amount, bookingId) {
  try {
    // Implementation would call M-Pesa Daraja API
    // For now, returning mock response
    console.log(`[v0] Initiating STK Push for ${phoneNumber}, amount: ${amount}, booking: ${bookingId}`)

    return {
      success: true,
      requestId: `STK_${bookingId}`,
      message: "STK Push initiated",
    }
  } catch (error) {
    console.error("M-Pesa error:", error)
    return { success: false, error: error.message }
  }
}
