import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for **Client Components** ('use client').
 * Uses @supabase/ssr's createBrowserClient which automatically handles
 * cookie-based auth in the browser environment.
 */
// Bypass native browser lock to prevent timeouts in multi-tab environments
export function createClientSupabase() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        }
    });
}

// Singleton instance to prevent Next.js Fast Refresh (HMR) zombie clients
export const supabase = (() => {
    if (typeof window === 'undefined') return createClientSupabase();

    // Check if we already have an instance saved on the window object
    if (!(window as any)._supabaseInstance) {
        (window as any)._supabaseInstance = createClientSupabase();
    }

    return (window as any)._supabaseInstance as ReturnType<typeof createClientSupabase>;
})();
