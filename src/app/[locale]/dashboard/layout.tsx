import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar could go here */}
            <main className="container mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}
