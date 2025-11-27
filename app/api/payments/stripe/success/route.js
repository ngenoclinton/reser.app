// app/api/payments/stripe/success/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/config/appwriteServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { paymentIntentId, userId, roomId, bookingData } = await req.json();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ success: false });
    }

    const { databases } = await createAdminClient();

    const booking = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      "unique()",
      {
        user_id: userId,
        room_id: roomId,
        payment_method: "card",
        payment_status: "paid",
        booking_status: "confirmed",
        total_amount: bookingData.chargeAmount,
        stripe_payment_intent: paymentIntentId,
        paid_amount: paymentIntent.amount / 100,
        // ... include all other booking fields
        room_name: bookingData.roomName,
        check_in: bookingData.checkInDate,
        check_out: bookingData.checkOutDate,
        // etc.
      }
    );

    return NextResponse.json({ success: true, bookingId: booking.$id });
  } catch (err) {
    console.error("Stripe success handler error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}