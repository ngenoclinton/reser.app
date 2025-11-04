// /lib/loginUser.js (client helper)
import { account } from "../config/appwriteClient";

export async function loginUserClient(email, password) {
  try {
    const session = await account.createEmailPasswordSession({email, password});

    const user = await account.get();

    return { success: true, user, session };

  } catch (error) {
    return { error: error.message || "Invalid credentials or server issue" };
  }
}
