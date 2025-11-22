// app/api/payments/status/[id]/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/config/appwriteServer";

export const GET = async (
  request,
  context// ← NEW: params is a Promise
) => {
  try {
    const { id } = await context.params;  // ← AWAIT IT

    console.log("STATUS CHECK → Booking ID:", id);

    const { databases } = await createAdminClient();

    const booking = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,           // ← NO NEXT_PUBLIC
      process.env.APPWRITE_COLLECTION_BOOKINGS,  // ← NO NEXT_PUBLIC
      id
    );

    console.log("STATUS CHECK → SUCCESS:", {
      id: booking.$id,
      payment_status: booking.payment_status,
      receipt: booking.mpesa_receipt,
    });

    return NextResponse.json({
      success: true,
      payment_status: booking.payment_status,
      mpesa_receipt: booking.mpesa_receipt,
      paid_amount: booking.paid_amount,
    });
  } catch (error) {
    console.error("STATUS CHECK → FAILED:", error.message);
    return NextResponse.json({
      success: false,
      error: "Not found",
      message: error.message,
    });
  }
};