//Polling Fallback: In your client, poll /api/bookings/[id] every 10s during "waiting_pin" to check status.
import { createAdminClient } from "@/config/appwriteServer"

export async function GET(request, { params }) {
  try {
    const bookingId = params.id

    if (!bookingId) {
      return Response.json({ error: "Booking ID required" }, { status: 400 })
    }

    const { databases } = await createAdminClient()

    // Fetch booking from database
    const booking = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
    )

    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 })
    }

    return Response.json(booking)
  } catch (error) {
    console.error("[v0] Error fetching booking:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
