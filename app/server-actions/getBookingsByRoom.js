'use server'

import { databases } from "@/config/appwriteClient"

export default async function getBookingsByRoom(roomId) {
  try {
    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [
        Query.equal("room_id", roomId)
      ]
    )

    return res.documents
  } catch (error) {
    return []
  }
}
