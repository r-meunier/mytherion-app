import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that do not require authentication
const publicPaths = ['/login', '/register', '/verify-email']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for the HttpOnly JWT cookie set by the Spring Boot backend
  const token = request.cookies.get('mytherion_token')

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // If the user is NOT logged in and tries to access a protected route (like /, /projects, etc.)
  if (!token && !isPublicPath) {
    // Redirect them immediately to /login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If the user IS logged in and tries to access /login or /register
  if (token && isPublicPath && pathname !== '/verify-email') {
    // Redirect them immediately to the dashboard
    const dashboardUrl = new URL('/', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

// Configure the matcher to run on all paths EXCEPT static files and APIs
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  ],
}
