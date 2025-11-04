// /lib/destroySessionClient.js
import { account } from "../config/appwriteClient";

export async function destroySessionClient() {
  try {
    await account.deleteSession("current");
    return { success: true };
  } catch (error) {
    console.error("Error destroying session:", error.message);
    return { error: error.message || "Failed to logout" };
  }
}
