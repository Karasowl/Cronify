"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "@/i18n/routing"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from 'next-intl'

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isLogin, setIsLogin] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const t = useTranslations('Auth')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        console.log("Form submitted. isLogin:", isLogin)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            if (isLogin) {
                console.log("Attempting sign in...")
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                console.log("Sign in successful")
                router.push("/dashboard")
            } else {
                console.log("Attempting sign up...")
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                console.log("Sign up successful")
                setIsSuccess(true)
                toast.success(t('checkEmail'))
            }
        } catch (error: any) {
            console.log("Auth error:", error) // Changed to log to avoid Next.js error overlay
            if (error.message.includes("Email not confirmed")) {
                toast.error(t('checkEmail'))
            } else {
                toast.error(error.message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-secondary-foreground/10 rounded-full blur-[100px]" />
                </div>

                <GlassCard className="w-full max-w-md text-center space-y-6 p-8" gradient>
                    <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold">{t('checkEmail')}</h2>
                    <p className="text-muted-foreground">
                        We've sent a confirmation link to your email. Please check your inbox (and spam folder) to activate your account.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setIsSuccess(false)}
                        className="w-full"
                    >
                        Back to Login
                    </Button>
                </GlassCard>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-secondary-foreground/10 rounded-full blur-[100px]" />
            </div>

            <GlassCard className="w-full max-w-md" gradient>
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter">
                            {isLogin ? t('welcomeBack') : t('createAccount')}
                        </h1>
                        <p className="text-muted-foreground">
                            {isLogin
                                ? t('enterCredentials')
                                : t('startJourney')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('emailLabel')}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={t('emailPlaceholder')}
                                required
                                className="bg-white/5 border-white/10 focus:bg-white/10 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('passwordLabel')}</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-white/5 border-white/10 focus:bg-white/10 transition-all"
                            />
                        </div>
                        <Button className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLogin ? t('signInButton') : t('signUpButton')}
                        </Button>
                    </form>

                    <div className="text-center">
                        <Button
                            variant="link"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin
                                ? t('noAccount')
                                : t('hasAccount')}
                        </Button>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}
