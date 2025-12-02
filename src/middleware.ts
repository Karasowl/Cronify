import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Skip auth check for non-dashboard routes to avoid redirect loops
    const isProtectedRoute = pathname.includes('/dashboard')

    // If not a protected route, just run intl middleware
    if (!isProtectedRoute) {
        return intlMiddleware(request)
    }

    // For protected routes, check auth first
    // We need to create a response first to properly handle cookies
    let response = intlMiddleware(request)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // Refresh the session
    const { data: { user } } = await supabase.auth.getUser()

    // Check for remember_session cookie
    const rememberSession = request.cookies.get('remember_session')

    // If user has a session but no remember_session cookie, they closed the browser
    // without "Remember me" checked - sign them out
    if (user && !rememberSession) {
        await supabase.auth.signOut()
        const locale = pathname.split('/')[1] || 'es'
        const loginUrl = new URL(`/${locale}/login`, request.url)
        // Clear Supabase cookies in the redirect response
        const redirectResponse = NextResponse.redirect(loginUrl)
        // Delete all supabase auth cookies
        request.cookies.getAll().forEach(cookie => {
            if (cookie.name.startsWith('sb-')) {
                redirectResponse.cookies.delete(cookie.name)
            }
        })
        return redirectResponse
    }

    // If not authenticated, redirect to login
    if (!user) {
        const locale = pathname.split('/')[1] || 'es'
        const loginUrl = new URL(`/${locale}/login`, request.url)
        return NextResponse.redirect(loginUrl)
    }

    // User is authenticated, return the response with cookies
    return response
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)']
}
