"use server";

import { createAdminClient } from "../../config/appwriteServer";
// import { createAdminClient } from "@/config/appwrite";
import { cookies } from "next/headers";

async function createSession(previousState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");


  if (!email || !password) {
    return { error: "Please fill out all fields" };
  }

  try {
    // ✅ useSessionClient — NOT createAdminClient
    const { account } = await createAdminClient();
    const users = await account.listSessions(); // just to see if key works
    console.log(users);

    // ✅ create user session via Appwrite
    const session = await account.createEmailPasswordSession(email, password);
    console.log("Appwrite_session:", session);

    // ✅ store session cookie
    const cookieStore = cookies();
    cookieStore.set("appwrite-session", session.$id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      expires: new Date(session.expire),
    });

    return { success: true };
  } catch (error) {
    console.error("Authentication Error:", error);
    return { error: "Invalid credentials or server issue" };
  }
}


export default createSession;
