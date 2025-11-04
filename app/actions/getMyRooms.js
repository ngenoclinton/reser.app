"use client";

import { account, databases } from "../../config/appwriteClient";
import { Query } from "appwrite";

const getMyRooms = async () => {
  try {
    // Get current user
    const user = await account.get();
    const userId = user.$id;

    // Fetch user's rooms
    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.equal("user_id", userId)]
    );

    return res.documents;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error; // rethrow so the page can handle it
  }
};

export default getMyRooms;
