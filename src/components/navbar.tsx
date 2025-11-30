"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "@/i18n/routing"
import { LogOut, User } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from "./language-switcher"

export function Navbar() {
    const router = useRouter()
    const supabase = createClient()
    const t = useTranslations('Navbar')

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <GlassCard className="mb-8 py-4 px-6 flex items-center justify-between" hoverEffect={false}>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary">C</span>
                </div>
                <span className="font-bold text-xl tracking-tight">Cronify</span>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                    {t('dashboard')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/partners")}>
                    {t('partners')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/shared")}>
                    {t('sharedView')}
                </Button>
                <LanguageSwitcher />
                <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                </Button>
            </div>
        </GlassCard>
    )
}
