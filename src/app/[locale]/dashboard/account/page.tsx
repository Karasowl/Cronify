"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, LogOut, Trash2, Loader2, Settings, Mail, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface UserSettings {
    auto_fail_enabled: boolean
}

export default function AccountPage() {
    const router = useRouter()
    const supabase = createClient()
    const t = useTranslations("Account")

    const [user, setUser] = useState<{ email: string; created_at: string } | null>(null)
    const [settings, setSettings] = useState<UserSettings>({ auto_fail_enabled: false })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        async function fetchData() {
            // Get current user
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                setUser({
                    email: authUser.email || "",
                    created_at: authUser.created_at,
                })

                // Get user settings
                const { data: settingsData } = await supabase
                    .from("user_settings")
                    .select("*")
                    .eq("user_id", authUser.id)
                    .single()

                if (settingsData) {
                    setSettings({
                        auto_fail_enabled: settingsData.auto_fail_enabled || false,
                    })
                }
            }
            setIsLoading(false)
        }
        fetchData()
    }, [supabase])

    async function handleAutoFailChange(enabled: boolean) {
        setIsSaving(true)
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            const { error } = await supabase
                .from("user_settings")
                .upsert({
                    user_id: authUser.id,
                    auto_fail_enabled: enabled,
                    updated_at: new Date().toISOString(),
                })

            if (error) throw error

            setSettings({ ...settings, auto_fail_enabled: enabled })
            toast.success("Configuración guardada")
        } catch (err: any) {
            toast.error("Error guardando configuración")
        } finally {
            setIsSaving(false)
        }
    }

    async function handleLogout() {
        // Clear remember_session cookie
        document.cookie = 'remember_session=; path=/; max-age=0'
        await supabase.auth.signOut()
        router.push("/login")
    }

    async function handleDeleteAccount() {
        setIsDeleting(true)
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            // Delete all user data (cascades will handle related data)
            await supabase.from("habits").delete().eq("user_id", authUser.id)
            await supabase.from("partnerships").delete().eq("user_id", authUser.id)
            await supabase.from("user_settings").delete().eq("user_id", authUser.id)

            // Note: Actual user deletion requires admin API or Edge Function
            // For now, we sign out the user after deleting their data
            document.cookie = 'remember_session=; path=/; max-age=0'
            await supabase.auth.signOut()

            toast.success("Cuenta eliminada")
            router.push("/")
        } catch (err: any) {
            toast.error("Error eliminando cuenta")
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Navbar />
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <Navbar />
            <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">{t("title")}</h1>
                <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            {/* Profile Info */}
            <GlassCard>
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{t("emailLabel")}</span>
                        </div>
                        <p className="font-medium">{user?.email}</p>

                        <div className="flex items-center gap-2 text-muted-foreground mt-4">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{t("memberSince")}</span>
                        </div>
                        <p className="font-medium">
                            {user?.created_at && new Date(user.created_at).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* Settings */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <h2 className="font-semibold">{t("settings")}</h2>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label htmlFor="auto-fail">{t("autoFailTitle")}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t("autoFailDesc")}
                        </p>
                    </div>
                    <Switch
                        id="auto-fail"
                        checked={settings.auto_fail_enabled}
                        onCheckedChange={handleAutoFailChange}
                        disabled={isSaving}
                    />
                </div>
            </GlassCard>

            {/* Logout */}
            <GlassCard>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full gap-2">
                            <LogOut className="w-4 h-4" />
                            {t("logout")}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("logoutConfirmTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("logoutConfirmDesc")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("logout")}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>
                                {t("logout")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </GlassCard>

            {/* Danger Zone */}
            <GlassCard className="border-red-500/30">
                <h2 className="font-semibold text-red-500 mb-4">{t("dangerZone")}</h2>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="w-full gap-2"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            {t("deleteAccount")}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("deleteAccountTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("deleteAccountDesc")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {t("deleteConfirmButton")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </GlassCard>
            </div>
        </div>
    )
}
