// app/api/payments/mpesa/callback/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/config/appwriteServer";
import { Query } from "appwrite";

export async function POST(req) {

  try {
      // Add this at the top
    // const pushToClient = (bookingId, data) => {
    //   const send = activeStreams.get(bookingId);
    //   if (send) {
    //     send(JSON.stringify(data));
    //     activeStreams.delete(bookingId);
    //   }
    // };
    
    const body = await req.json();
    console.log("M-PESA CALLBACK:", JSON.stringify(body, null, 2));

    const { Body } = body;
    
    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;
    
    // Extract phone from callback
    // const phoneItem = CallbackMetadata?.Item?.find(i => i.Name === "PhoneNumber");
    // if (!phoneItem) {
    //   console.log("NO PHONE NUMBER IN CALLBACK");
    //   return NextResponse.json({ ResultCode: 1 });
    // }

 // YOU decide how booking is matched → by phone, or by CheckoutRequestID
    // const bookingId = callback.MerchantRequestID.split("-")[0]; 

    const { databases } = await createAdminClient();
    // FIND LATEST PENDING BOOKING FOR THIS PHONE NUMBER 
      // OR
    // MATCH BY CHECKOUT ID IF YOU STORE IT DURING INITIATION
    const result= await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      [
        Query.equal("mpesa_checkout_id", CheckoutRequestID), //USING CHECKOUT REQUEST ID
        Query.limit(1)
      ]
    );

  if (result.documents.length === 0) {
      console.log("No booking found for CheckoutRequestID:", CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0 });
    }
    
   const booking = result.documents[0];
    console.log("BOOKING FOUND:", booking.$id, "CREATED AT:", booking.$createdAt);

    if (ResultCode === 0) {
      const receipt = CallbackMetadata.Item.find(i => i.Name === "MpesaReceiptNumber")?.Value || "";
      const amount = CallbackMetadata.Item.find(i => i.Name === "Amount")?.Value || 0;

      try{
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_BOOKINGS,
        booking.$id,
        {
          payment_status: "paid",
          booking_status: "confirmed",
          mpesa_receipt: receipt,
          paid_amount: Number(amount),
          payment_error: null,
        }
      );
      // INSTANTLY NOTIFY FRONTEND
      // pushToClient(booking.$id, {
      //   type: "SUCCESS",
      //   receipt: receipt,
      //   message: "Payment received!"
      // });
    console.log("SUCCESS: Booking", booking.$id, "PAID KES", amount, "Receipt:", receipt);   

        }catch (updateError){ console.error("UPDATE FAILED:", updateError); }
      } else {
// FAILURE: Wrong PIN, Cancelled, Insufficient funds, etc.
      const errorMessage = ResultDesc || "Payment failed or cancelled by user";

      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_BOOKINGS,
        booking.$id,
        {
          payment_status: "failed",
          booking_status: "cancelled",
          payment_error: errorMessage,
          mpesa_receipt: null,
        }
      );
    console.log("PAYMENT FAILED:", ResultDesc, "Code:", ResultCode);
    }

    return NextResponse.json({ ResultCode: 0 });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ ResultCode: 1 }, { status: 500 });
  }
}