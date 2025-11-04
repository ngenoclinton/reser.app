'use server';

import { Query } from 'node-appwrite';
import { createAdminClient } from '../../config/appwriteServer';

async function getMyBookings(userId) {
  try {
    if (!userId) {
      return { error: 'User ID is required to fetch bookings' };
    }

    const { databases } = await createAdminClient();

    const { documents } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [Query.equal('user_id', userId)]
    );

    // ✅ Always return an array
    return documents || [];
  } catch (error) {
    console.error('❌ Failed to get user bookings:', error);
    return { error: error.message || 'Failed to fetch bookings' };
  }
}

export default getMyBookings;
