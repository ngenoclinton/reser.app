'use server';

import { createAdminClient } from '../../config/appwriteServer';

async function getSingleRoom(id) {
  try {
    if (!id) throw new Error("Missing room ID");

    const { databases } = await createAdminClient();

    const room = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      id
    );

    return room; //---> returning the room after successfull fetching from the database 

  } catch (error) {
    console.error("❌ Failed to fetch room:", error);
    return null; // prevent redirect loop
  }
}

export default getSingleRoom;
