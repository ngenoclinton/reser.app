"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/config/appwriteServer";

/**
 * Create booking with 50% deposit requirement
 * Booking status: pending_deposit -> confirmed -> completed -> past
 */
async function createBookingWithDeposit(previousState, formData) {
  try {
    const { databases } = await createAdminClient();

    const checkInDate = formData.get("check_in_date");
    const checkInTime = formData.get("check_in_time");
    const checkOutDate = formData.get("check_out_date");
    const checkOutTime = formData.get("check_out_time");

    const total_hours = Math.ceil(Number(formData.get("total_hours")));

    const roomId = formData.get("room_id");
    const room_name = formData.get("room_name");
    const userId = formData.get("user_id");

    const pricePerHour = Number.parseFloat(formData.get("price_per_hour"));

    if (!userId) {
      return { error: "Please log in to book a room." };
    }

    const checkInDateTime = `${checkInDate}T${checkInTime}`;
    const checkOutDateTime = `${checkOutDate}T${checkOutTime}`;

    // Check for overlapping bookings (only confirmed/paid bookings block availability)
    const bookings = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [
        Query.equal("room_id", roomId),
        // Query.or([Query.equal("status", "confirmed"), Query.equal("status", "completed")]),
      ]
    );

    const overlapping = bookings.documents.some((b) => {
      return (
        (checkInDateTime >= b.check_in && checkInDateTime < b.check_out) ||
        (checkOutDateTime > b.check_in && checkOutDateTime <= b.check_out) ||
        (checkInDateTime <= b.check_in && checkOutDateTime >= b.check_out)
      );
    });

    const overlap = bookings.documents.some((b) => {
      const bStart = new Date(b.check_in);
      const bEnd = new Date(b.check_out);

      const cIn = new Date(checkInDateTime);
      const cOut = new Date(checkOutDateTime);

      return cIn < bEnd && cOut > bStart;
    });

    if (overlap) {
      return {
        error: "This room is already booked for the selected time.",
      };
    }

    // Calculate total hours and 50% deposit
    const checkInDT = new Date(checkInDateTime);
    const checkOutDT = new Date(checkOutDateTime);
    const hours = Math.ceil((checkOutDT - checkInDT) / (1000 * 60 * 60));
    const totalAmount = Math.ceil(Number(total_hours * pricePerHour));
    const depositAmount = Number(totalAmount * 0.5);

    const bookingData = {
      room_id: roomId,
      room_name: room_name,
      user_id: userId,
      check_in: checkInDateTime,
      check_out: checkOutDateTime,

      total_hours: total_hours,
      price_per_hour: pricePerHour,
      total_amount: totalAmount,
      deposit_amount: depositAmount,

      status: "pending_deposit", // Awaiting 50% deposit
      payment_status: "pending",
      payment_method: null,
      payment_id: null,
    };

    const booking = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      ID.unique(),
      bookingData
    );

    revalidatePath("/bookings");

    return {
      success: true,
      booking,
      depositAmount,
      totalAmount,
    };
  } catch (error) {
    console.error("Failed to create booking:", error.message);
    return { error: error.message || "Failed to create booking" };
  }
}

export default createBookingWithDeposit;
