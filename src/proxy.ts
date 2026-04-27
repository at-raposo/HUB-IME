import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    let response = NextResponse.next({ request });

    // --- Supabase Session Refresh ---
    // Refreshes the auth token on every request to prevent silent logouts.
    // Uses @supabase/ssr with cookie get/set on the response object.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Forward cookies to both the request (for downstream SSR)
                    // and the response (for the browser)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Performance: Only refresh auth token on routes that need it
    // Public routes skip getUser() to save ~100-200ms TTFB
    const isPublicRoute = pathname === '/' ||
        pathname.startsWith('/gcif') ||
        pathname.startsWith('/comunidade') ||
        pathname.startsWith('/labdiv') ||
        pathname.startsWith('/fluxo') ||
        pathname.startsWith('/drops') ||
        pathname.startsWith('/api/og');

    if (!isPublicRoute) {
        // This call triggers the token refresh if needed
        await supabase.auth.getUser();
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://*.supabase.co https://*.cloudinary.com https://*.youtube.com https://www.clarity.ms https://scripts.clarity.ms https://c.bing.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://api.dicebear.com https://*.supabase.co https://*.cloudinary.com https://i.ytimg.com https://*.ytimg.com https://*.googleusercontent.com https://*.google.com https://*.google-analytics.com https://*.googletagmanager.com https://*.clarity.ms https://c.bing.com https://*.bing.com;
        font-src 'self' data: https://fonts.gstatic.com;
        connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.cloudinary.com https://*.resend.com https://fonts.googleapis.com https://*.google-analytics.com https://*.googletagmanager.com https://*.clarity.ms https://*.bing.com https://c.bing.com;
        media-src 'self' https://*.supabase.co https://*.cloudinary.com https://*.youtube.com;
        frame-src 'self' https://*.youtube.com https://*.youtube-nocookie.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        ${isProd ? 'upgrade-insecure-requests;' : ''}
    `.replace(/\s{2,}/g, ' ').trim();

    const applyHeaders = (res: NextResponse) => {
        res.headers.set('Content-Security-Policy', cspHeader);
        res.headers.set('X-Frame-Options', 'DENY');
        res.headers.set('X-Content-Type-Options', 'nosniff');
        res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        if (isProd) {
            res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        return res;
    };

    // --- Admin Auth Check (Hardened) ---
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        // Check for password-based session cookie first (bypass)
        const adminSession = request.cookies.get('admin_session');
        if (adminSession?.value === 'authenticated') {
            return applyHeaders(response);
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            const loginUrl = new URL('/admin/login', request.url);
            return applyHeaders(NextResponse.redirect(loginUrl));
        }

        // Verify role in profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role || 'user';

        // 1. If not admin nor moderator, kick out
        if (role !== 'admin' && role !== 'moderator') {
            const homeUrl = new URL('/', request.url);
            return applyHeaders(NextResponse.redirect(homeUrl));
        }

        // 2. Strict Admin-only routes
        const isAdminOnlyRoute = pathname.startsWith('/admin/perigo') || 
                               pathname.startsWith('/admin/profiles') ||
                               pathname.startsWith('/admin/trails');
        
        if (isAdminOnlyRoute && role !== 'admin') {
            const adminHomeUrl = new URL('/admin', request.url);
            return applyHeaders(NextResponse.redirect(adminHomeUrl));
        }
    }

    return applyHeaders(response);
}

export const config = {
    matcher: [
        // Run middleware on all routes except static files and images
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

