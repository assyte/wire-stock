import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];
const PUBLIC_PREFIXES = ['/_next', '/api', '/favicon', '/images', '/icons'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Ana sayfa public
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Diğer tüm sayfalar için auth kontrolü
  // Not: Client-side'da daha detaylı kontrol yapılacak
  // Burada sadece basit bir cookie/token presence kontrolü
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
