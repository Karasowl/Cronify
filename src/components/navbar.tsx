"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "@/i18n/routing"
import { User, Menu, X, Home, BarChart3, Users, Eye } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from "./language-switcher"
import { cn } from "@/lib/utils"

export function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const t = useTranslations('Navbar')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navItems = [
        { href: "/dashboard", label: t('dashboard'), icon: Home },
        { href: "/dashboard/stats", label: t('stats'), icon: BarChart3 },
        { href: "/dashboard/partners", label: t('partners'), icon: Users },
        { href: "/dashboard/shared", label: t('sharedView'), icon: Eye },
    ]

    const isActive = (href: string) => pathname === href

    return (
        <GlassCard className="mb-8 py-3 px-4 sm:py-4 sm:px-6" hoverEffect={false}>
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-bold text-primary">C</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">Cronify</span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.href}
                            variant={isActive(item.href) ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => router.push(item.href)}
                            className={cn(
                                "gap-1.5",
                                isActive(item.href) && "bg-primary/10"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Button>
                    ))}
                    <div className="h-6 w-px bg-border mx-1" />
                    <LanguageSwitcher />
                    <Button
                        variant={isActive("/dashboard/account") ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => router.push("/dashboard/account")}
                        title={t('account')}
                        className={cn(
                            isActive("/dashboard/account") && "bg-primary/10"
                        )}
                    >
                        <User className="w-4 h-4" />
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center gap-2">
                    <LanguageSwitcher />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="h-10 w-10"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-4 pt-4 border-t border-border/50">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={isActive(item.href) ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 h-12 text-base",
                                    isActive(item.href) && "bg-primary/10"
                                )}
                                onClick={() => {
                                    router.push(item.href)
                                    setMobileMenuOpen(false)
                                }}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Button>
                        ))}
                        <Button
                            variant={isActive("/dashboard/account") ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 h-12 text-base",
                                isActive("/dashboard/account") && "bg-primary/10"
                            )}
                            onClick={() => {
                                router.push("/dashboard/account")
                                setMobileMenuOpen(false)
                            }}
                        >
                            <User className="w-5 h-5" />
                            {t('account')}
                        </Button>
                    </nav>
                </div>
            )}
        </GlassCard>
    )
}
