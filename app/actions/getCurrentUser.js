'use server';

import { account } from "../../config/appwriteServer";

// import { account } from '@/config/appwriteServer'; // 👈 use *server* client

export async function getCurrentUser() {
  try {
    const user = await account.get();
    return { user };
  } catch (error) {
    // If no session exists, Appwrite throws error
    console.error('getCurrentUser error:', error.message);
    return { user: null };
  }
}
