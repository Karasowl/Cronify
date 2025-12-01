import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
    // First, run the intl middleware to handle locale routing
    let response = intlMiddleware(request)

    // Create a Supabase client to refresh the session
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    // Update the response with new cookies
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh the session - this keeps the user logged in
    // IMPORTANT: This must be called to refresh expired sessions
    const { data: { user } } = await supabase.auth.getUser()

    // If there's a user, copy the auth cookies to the intl response
    if (user) {
        // Get all cookies that were set during auth refresh
        const allCookies = response.cookies.getAll()
        const intlResponse = intlMiddleware(request)

        // Copy auth cookies to the intl response
        allCookies.forEach(cookie => {
            intlResponse.cookies.set(cookie.name, cookie.value, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            })
        })

        return intlResponse
    }

    return response
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)']
}
