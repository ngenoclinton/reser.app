// app/api/payments/stripe/create-intent/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/config/appwriteServer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { amount, metadata } = await req.json();

    // Create booking first (same as initiate)
    const body = JSON.parse(metadata.booking_details);
    const { databases } = await createAdminClient();
    
    console.log(body); 

    // const booking = await databases.updateDocument(
    //   process.env.APPWRITE_DATABASE_ID,
    //   process.env.APPWRITE_COLLECTION_BOOKINGS,
    //   'unique()',
    //   {
    //     user_id: body.userId,
    //     room_id: body.roomId,
    //     payment_method: 'card',
    //     payment_status: 'pending',
    //     booking_status: 'pending_deposit',
    //     total_amount: body.chargeAmount,
    //     // ... other fields
    //   }
    // );

 const booking = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      'unique()',
      {
        payment_method: 'card',
        payment_status: 'pending',
        booking_status: 'pending_deposit',
        total_amount: body.chargeAmount,
        // ... other fields
        user_id: body.userId,
        room_id: body.roomId,
        room_name: body.roomName,
        price_per_hour:Number(body.roomPrice),
        check_in: body.checkInDate,
        check_out: body.checkOutDate,
        deposit_amount: body.paymentType === "deposit" ? Math.floor(deposit) : 0,
        payment_type: body.paymentType,
        booker_name: body.bookerName,
        booker_email: body.bookerEmail,
        booker_phone: body.bookerPhone,
        company_name: body.companyName || "",
        special_requests: body.specialRequests || "",
        attendee_count: Math.floor(body.attendeeCount) || 1,
        total_hours:body.totalHours
          // body.checkInDate
          // body.checkOutDate
          // body.depositAmount
          // body.depositPrice
          // body.discountAmount
          // body.roomPrice
          // body.totalAmount
          // body.totalPrice
      }
    );
    console.log('Booking created:', booking.$id); // Debug


    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'kes',
      automatic_payment_methods:{ enabled: true },
      metadata: {
        bookingId: booking.$id,
        userId: body.userId,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.$id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}