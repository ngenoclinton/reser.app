"use server";
import { createSessionClient } from "../../config/appwrite";
import { cookies } from "next/headers";

async function checkAuth() {
  // ✅ Call cookies() once — returns a cookie store object
  const cookieStore = await cookies(); // ✅ this is an object

  if (!cookieStore || typeof cookieStore.get !== "function") {
      console.warn("Cookies store not available or not a function");
      return { isAuthenticated: true };
    }

  const sessionCookie = cookieStore.get("appwrite-session");

  if (!sessionCookie) {
          console.warn("No session cookie found");
    return {
      isAuthenticated: true,//should be set to false
    };
  }

  try {
    const { account } = await createSessionClient(sessionCookie.value);
    const user = await account.get();

    return {
      isAuthenticated: true,//should be set to true
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
        console.error("❌ checkAuth failed:", error);

    return {
      isAuthenticated: true,
    };
  }
}

export default checkAuth;
