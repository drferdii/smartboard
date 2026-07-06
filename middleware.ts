import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/admin/supabase/middleware';

// Basic in-memory rate limiting (Note: in Edge runtime, this is per-isolate, 
// but serves as a basic prototype safeguard against burst traffic)
const ipRequestMap = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 300; // 300 requests per minute

export async function middleware(request: NextRequest) {
  // --- Rate Limiting Logic ---
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const record = ipRequestMap.get(ip);
  
  if (record) {
    if (now - record.timestamp < RATE_LIMIT_WINDOW_MS) {
      if (record.count >= MAX_REQUESTS) {
        return new NextResponse('Too Many Requests - Harap tunggu beberapa saat', { status: 429 });
      }
      record.count++;
    } else {
      ipRequestMap.set(ip, { count: 1, timestamp: now });
    }
  } else {
    ipRequestMap.set(ip, { count: 1, timestamp: now });
  }
  // ---------------------------

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  // Public paths under /admin
  if (isLoginPage) return response;

  // All other /admin/* and /api/admin/* require auth
  if ((isAdminRoute || isAdminApi) && !user) {
    if (isAdminApi) {
      return Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Sesi habis. Silakan login ulang.' } },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public assets (public/)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
