'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '../../config/appwriteServer';

async function cancelBooking(bookingId, userId) {
  if (!userId) {
    return { error: 'User not authenticated' };
  }

  try {
    const { databases } = await createAdminClient();

    // Fetch the booking
    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    // ✅ Authorization check
    if (booking.user_id !== userId) {
      return { error: 'You are not authorized to cancel this booking' };
    }

    // ✅ Delete booking
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    // ✅ Refresh the bookings page
    // revalidatePath('/bookings');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to cancel booking:', error);
    return { error: error.message || 'Failed to cancel booking' };
  }
}

export default cancelBooking;
