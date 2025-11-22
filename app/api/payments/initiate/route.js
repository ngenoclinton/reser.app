// app/api/payments/initiate/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/config/appwriteServer";
import paystack from "@/lib/paystack";
import { initiateSTKPush } from "@/lib/mpesa";
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      userId,
      roomId,
      roomName,
      checkInDate,
      checkOutDate,
      amount,
      price_per_hour,
      total_hours,
      paymentMethod,
      paymentType,
      bookingDetails,
    } = body;

    const { databases } = await createAdminClient();

    const deposit = Math.round(amount); //Amount: Uses deposit (50%) for STK.
    const hours_booked = Math.floor(total_hours);
    const sum_amount = Math.floor(amount);

    // create booking in database 
    const booking = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      "unique()",
      {
        user_id: userId,
        room_id: roomId,
        room_name: roomName,
        price_per_hour: Number(price_per_hour),
        total_hours: hours_booked,
        check_in: checkInDate,
        check_out: checkOutDate,
        total_amount: paymentType === "deposit" ? sum_amount * 2 : sum_amount,
        deposit_amount: paymentType === "deposit" ? Math.floor(deposit) : 0,
        payment_method: paymentMethod,
        payment_type: paymentType,
        payment_status: paymentMethod === "cash" ? "over_counter" : "pending",
        booking_status:
          paymentMethod === "cash" ? "confirmed" : "pending_deposit",
        booker_name: bookingDetails.bookerName,
        booker_email: bookingDetails.bookerEmail,
        booker_phone: bookingDetails.bookerPhone,
        company_name: bookingDetails.companyName || "",
        special_requests: bookingDetails.specialRequests || "",
        attendee_count: Math.floor(bookingDetails.attendeeCount) || 1,
      }
    );
  // cash payment
    if (paymentMethod === "cash") {
      return NextResponse.json({
        success: true,
        bookingId: booking.$id,
        message: "Booking confirmed! Pay on arrival.",
      });
    }

  // M-PESA (Daraja STK Push) payment
    if (paymentMethod === "mpesa") {
      // Real STK Push
      const phoneNumber = bookingDetails.bookerPhone.replace(/^0/, "254"); // Phone Conversion: 07xx → 2547xx
      const stkResponse = await initiateSTKPush(phoneNumber, amount, booking.$id);

      if (stkResponse.success) {
        // Update DB with STK request ID
        // Save CheckoutRequestID for polling
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_COLLECTION_BOOKINGS,
          booking.$id,
          {
            mpesa_phone: phoneNumber, // ← THIS IS KEY
            mpesa_checkout_id: stkResponse.checkoutRequestId,  // ← CRITICAL
          }
        );

        return NextResponse.json({
          success: true,
          bookingId: booking.$id,
          message: "STK Push sent to phone",
          stkRequestId: stkResponse.checkoutRequestId,
          expiresIn: 120,
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            error: stkResponse.error 
          },
          { status: 400 }
        );
      }
    }

    //USING CARD PAYMENT
    if (paymentMethod === "card") {
      return NextResponse.json({
        success: true,
        bookingId: booking.$id,
        depositAmount: deposit,
        message: "Ready for card payment",
      });
    }

  // ------USING PAYSTACK to pay-------///
    // if (paymentMethod === "card" || paymentMethod === "mpesa") {
    //   const amountKobo = Math.round(deposit * 100); // 50% deposit
    //   const channels = paymentMethod === "mpesa" ? ["mobile_money"] : undefined;

    //   const tx = await paystack.transaction.initialize({
    //     email: bookingDetails.bookerEmail,
    //     amount: amountKobo,
    //     reference: booking.$id,
    //     channels,
    //     currency: "KES",
    //   });

    //   return NextResponse.json({
    //     success: true,
    //     bookingId: booking.$id,
    //     authorization_url: tx.data.authorization_url,
    //     reference: tx.data.reference,
    //   });
    // }

    return NextResponse.json(
      { success: false, error: "Invalid method" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Initiate error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
