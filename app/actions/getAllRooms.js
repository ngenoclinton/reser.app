"use server";

import { createAdminClient } from "../../config/appwriteServer";


async function getAllRooms() {
  try {
    const { databases } = await createAdminClient();

    const { documents: rooms } = await databases.listDocuments({
      databaseId: process.env.APPWRITE_DATABASE_ID,
      collectionId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
    });

    return rooms;
  } catch (error) {
    console.error('Failed to get rooms', error);
    return []; // Return empty array to prevent crash
  }
}

export default getAllRooms;
