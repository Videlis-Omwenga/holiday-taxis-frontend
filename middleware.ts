import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/setup', '/unauthorized']

  // Allow access to public routes without any checks
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // For all other routes, check authentication
  const token = request.cookies.get('token')?.value

  // If no token in cookies and trying to access protected route, redirect to login
  if (!token && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|robots.txt).*)',
  ],
}
