import { NextResponse } from 'next/server';
import checkAuth from './app/actions/checkAuth';

export async function middleware(request) {
  const { isAuthenticated } = await checkAuth();
    // const { isAuthenticated,  logout } = useAuth();

  // const token = request.headers.get('authorization');

  // if (!token) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Optionally verify token with Appwrite REST API
  // const res = await fetch(`${APPWRITE_ENDPOINT}/account`, { headers: { 'X-Appwrite-JWT': token } });

  return NextResponse.next();
}

export const config = {
  // matcher: ['/api/:path*'], // Protect all API routes
  matcher: ['/bookings', '/rooms/add', '/rooms/my'],
};