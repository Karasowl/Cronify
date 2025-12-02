import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next")

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // If this is email verification (no explicit next param), redirect to login
            // If there's an explicit next param (e.g., password reset), use that
            if (next) {
                return NextResponse.redirect(`${origin}${next}`)
            }
            // Sign out the user so they need to login manually after email verification
            await supabase.auth.signOut()
            // Redirect to login with verified flag
            return NextResponse.redirect(`${origin}/login?verified=true`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
