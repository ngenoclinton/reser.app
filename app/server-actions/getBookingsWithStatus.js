"use server"

import { Query } from "node-appwrite"
import { createAdminClient } from "@/config/appwriteServer"

/**
 * Get all bookings for a user, separated by status
 * active: pending_deposit, confirmed
 * past: completed
 * cancelled: cancelled
 */
async function getBookingsWithStatus(userId) {
  try {
    if (!userId) {
      return { error: "User ID is required" }
    }

    const { databases } = await createAdminClient()

    const allBookings = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      [Query.equal("user_id", userId)],
    )

    const now = new Date()
    const active = []
    const past = []
    const cancelled = []

    allBookings.documents.forEach((booking) => {
      if (booking.booking_status === "cancelled") {
        cancelled.push(booking)
      } else if (new Date(booking.check_out) < now) {
        past.push(booking)
      } else {
        active.push(booking)
      }
    })

    return {
      active,
      past,
      cancelled,
    }
  } catch (error) {
    console.error("Failed to get bookings:", error.message)
    return { error: error.message }
  }
}

export default getBookingsWithStatus
