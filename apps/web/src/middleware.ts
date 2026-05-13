import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminRoute = pathname.startsWith('/admin');
  const isAgentRoute = pathname.startsWith('/agent');

  if (!token && (isAdminRoute || isAgentRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/agent/:path*', '/login', '/register'],
};
