// lib/appwrite-server-dynamic.js
export async function getAdminClient() {
  const { createAdminClient } = await import('@/config/appwriteServer');
  return createAdminClient();
}