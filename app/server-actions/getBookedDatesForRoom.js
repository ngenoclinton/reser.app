"use server"

import { Query } from "node-appwrite"
import { createAdminClient } from "@/config/appwriteServer"

/**
 * Get all booked dates and times for a specific room
 * Used for calendar unavailability display
 */
async function getBookedDatesForRoom(roomId) {
  try {
    if (!roomId) throw new Error("Room ID is required")

    const { databases } = await createAdminClient()

    const bookings = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      [
        Query.equal("room_id", roomId),
        Query.or([Query.equal("status", "confirmed"), Query.equal("status", "completed")]),
      ],
    )

    const bookedDates = bookings.documents.map((booking) => ({
      id: booking.$id,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      status: booking.status,
    }))

    return bookedDates
  } catch (error) {
    console.error("Failed to get booked dates:", error.message)
    return []
  }
}

export default getBookedDatesForRoom
