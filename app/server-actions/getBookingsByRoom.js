'use server'

import { databases } from "@/config/appwriteClient"

export default async function getBookingsByRoom(roomId) {
  try {
    const res = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_BOOKINGS,
      [
        Query.equal("room_id", roomId)
      ]
    )

    return res.documents
  } catch (error) {
    return []
  }
}
