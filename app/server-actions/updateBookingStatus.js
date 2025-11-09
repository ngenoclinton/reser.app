"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/config/appwriteServer"

/**
 * Update booking status and payment information
 * Used when deposit is paid or booking is completed
 */
async function updateBookingStatus(bookingId, status, paymentInfo) {
  try {
    const { databases } = await createAdminClient()

    const updateData = { status }

    if (paymentInfo) {
      updateData.payment_status = paymentInfo.payment_status || "completed"
      updateData.payment_method = paymentInfo.payment_method
      updateData.payment_id = paymentInfo.payment_id
      updateData.payment_date = new Date().toISOString()
    }

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      updateData,
    )

    revalidatePath("/bookings")

    return { success: true }
  } catch (error) {
    console.error("Failed to update booking status:", error.message)
    return { error: error.message }
  }
}

export default updateBookingStatus
