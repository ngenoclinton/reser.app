'use server';

import { createAdminClient } from '../../config/appwriteServer';
import { revalidatePath } from 'next/cache';

async function deleteRoom(roomId) {
  try {
    const { databases } = await createAdminClient();

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      roomId
    );

    // Revalidate relevant pages
    revalidatePath('/rooms/my');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to delete room:', error);
    return { success: false, message: error.message };
  }
}

export default deleteRoom;
