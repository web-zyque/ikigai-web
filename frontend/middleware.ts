import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const PROTECTED_ROUTES = ['/profile', '/orders'];
const AUTH_ROUTES = ['/login', '/forgot-password'];
const ADMIN_ROUTES = ['/admin'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('token')?.value;
  const authSession = request.cookies.get('ikigai_auth')?.value;
  const isAuthenticated = Boolean(token || authSession === 'true');

  // Handle protected customer routes
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes (login, forgot-password) 
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthRoute && isAuthenticated) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect');
    if (redirectUrl && redirectUrl.startsWith('/')) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // Handle admin routes - let AdminAuthWrapper handle the detailed role checking
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};