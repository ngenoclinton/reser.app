// app/api/payments/stripe/confirm/route.js
export const dynamic = 'force-dynamic'; //

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/config/appwriteServer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { paymentIntentId, bookingId } = body; // From request body

    const { databases } = await createAdminClient();

    console.log('Confirm request:', { paymentIntentId, bookingId }); // DEBUG: Log input

    if (!paymentIntentId) {
      return NextResponse.json({ success: false, error: "Missing paymentIntentId" }, { status: 400 });
    }

    // Retrieve PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Stripe PI:', { id: paymentIntent.id, status: paymentIntent.status, metadata: paymentIntent.metadata }); // DEBUG

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ success: false, error: `Payment not succeeded: ${paymentIntent.status}` });
    }

    // Use request bookingId or fallback to metadata
    const finalBookingId = bookingId || paymentIntent.metadata.bookingId;
    if (!finalBookingId) {
      return NextResponse.json({ success: false, error: "Missing bookingId" }, { status: 400 });
    }

    console.log('Updating booking ID:', finalBookingId); // DEBUG

    // const { databases } = await (await getAdminClient());

    // Update booking in Appwrite
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      finalBookingId,
      {
        payment_method: "card",
        payment_status: "paid",
        booking_status: "confirmed",
        stripe_payment_intent: paymentIntentId,
        paid_amount: paymentIntent.amount / 100, // Ensure number
        paid_at: new Date().toISOString(),
      }
    );

    console.log('Booking updated successfully'); // DEBUG

    return NextResponse.json({ success: true, bookingId: finalBookingId });
  } catch (err) {
    console.error('Confirm payment error FULL:', err); // ← CRITICAL: Full error log
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}