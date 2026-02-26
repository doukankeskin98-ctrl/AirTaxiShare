import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value;
    const isLoginPage = request.nextUrl.pathname.startsWith('/login');

    // If no token and not on login page -> redirect to login
    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If token exists and trying to access login -> redirect to dashboard
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Match all routes except API and static chunks
};
