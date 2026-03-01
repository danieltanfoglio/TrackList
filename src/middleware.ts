import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const adminToken = req.cookies.get('admin_token')?.value;

    const isAdminDashboardPath = req.nextUrl.pathname.startsWith('/admin/dashboard');

    if (isAdminDashboardPath && adminToken !== 'authenticated') {
        const url = req.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
    }

    // if logged in and trying to go to /admin (login page), redirect to dashboard
    if (req.nextUrl.pathname === '/admin' && adminToken === 'authenticated') {
        const url = req.nextUrl.clone();
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/admin'],
};
