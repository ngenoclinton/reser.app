// app/api/payments/cancel/[bookingId]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/config/appwriteServer";

export async function POST( request, {params}) {
  try {
    const { bookingId } =  await params;
    const { databases } = await createAdminClient();

    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        payment_status: "cancelled",
        booking_status: "cancelled",
        payment_error: "Cancelled by user",
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}