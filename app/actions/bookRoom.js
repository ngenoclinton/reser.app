"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "../../config/appwriteServer";

/**
 * Book a room using Appwrite client SDK
 */
async function bookRoom(previousState, formData) {
  try {
    const { databases } = await createAdminClient();

    // Extract date and time from the formData
    const checkInDate = formData.get("check_in_date");
    const checkInTime = formData.get("check_in_time");
    const checkOutDate = formData.get("check_out_date");
    const checkOutTime = formData.get("check_out_time");
    const roomId = formData.get("room_id");
    const room_name = formData.get("room_name")
    // Get user ID from form (not from account.get)
    const userId = formData.get("user_id");
    if (!userId) {
      return { error: "Please log in to book a room." };
    }

    // Combine date and time to ISO 8601 format
    const checkInDateTime = `${checkInDate}T${checkInTime}`;
    const checkOutDateTime = `${checkOutDate}T${checkOutTime}`;

    // Check if the room is already booked during this time
    const bookings = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      [Query.equal("room_id", roomId)]
    );

    const overlapping = bookings.documents.some((b) => {
      return (
        (checkInDateTime >= b.check_in && checkInDateTime < b.check_out) ||
        (checkOutDateTime > b.check_in && checkOutDateTime <= b.check_out)
      );
    });

    if (overlapping) {
      return {
        error: "This room is already booked for the selected time.",
      };
    }

    const bookingData = {
      room_id: roomId,
      room_name:room_name,
      user_id: userId,
      check_in: checkInDateTime,
      check_out: checkOutDateTime,
    };

    // Create the booking document
    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      ID.unique(),
      bookingData
    );
    // Revalidate cache
    revalidatePath("/bookings");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Failed to book room:", error.message, error.stack);
    throw error; // temporarily rethrow for full stacktrace in terminal
  }
}

export default bookRoom;
