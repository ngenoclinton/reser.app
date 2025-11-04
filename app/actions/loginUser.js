
'use server';
import { createSessionClient } from '../../config/appwriteClient';
import { cookies } from 'next/headers';
// import { createSessionClient } from '@/config/appwriteClient';

export async function loginUser(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Please fill in all fields' };
  }

  try {
    // ✅ Use the normal client, not admin
    const { account } = createSessionClient();
    const session = await account.createEmailPasswordSession({email, password});

    // ✅ Save the session ID in cookies (for server-side access)
    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.$id, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(session.expire),
    });

    // ✅ Fetch user details
    const user = await account.get();

    return { success: true, user };
  } catch (err) {
    console.log('Login error:', err.message || err);
    return { error: 'Invalid credentials or server issue' };
  }
}
