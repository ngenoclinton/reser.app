'use server';

import { cookies } from 'next/headers';
import { Query } from 'node-appwrite';
import { redirect } from 'next/navigation';
import { createAdminClient } from '../../config/appwriteServer';
import { useAuth } from '../../context/authLogContext';

async function getMyBookings() {
  
  try {
    // const { databases } = await createSessionClient(sessionCookie.value);
    const { databases } = await createAdminClient();

    // Get user's ID
    // const { user } = await checkAuth();
    const user  = await useAuth(); 

    if (!user) {
      return {
        error: 'You must be logged in to view bookings',
      };
    }

    // Fetch users bookings
    const { documents: bookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [Query.equal('user_id', user.id)]
    );

    return bookings;
  } catch (error) {
    console.log('Failed to get user bookings', error);
    return {
      error: 'Failed to get bookings',
    };
  }
}

export default getMyBookings;