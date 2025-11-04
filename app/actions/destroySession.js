// /app/actions/destroySession.js
'use server';

import { account } from "../../config/appwriteServer";

export default async function destroySession() {
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error) {
    console.error('Error destroying session:', error.message);
    return { error: error.message || 'Failed to logout' };
  }
}
