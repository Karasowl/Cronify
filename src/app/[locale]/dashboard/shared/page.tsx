"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { useTranslations } from 'next-intl'
import { Loader2 } from "lucide-react"

type SharedHabit = {
    id: string
    title: string
    description: string
    user_email: string
    logs: { date: string; status: string }[]
}

export default function SharedHabitsPage() {
    const [sharedHabits, setSharedHabits] = useState<SharedHabit[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const t = useTranslations('SharedHabits')
    const today = new Date().toISOString().split("T")[0]

    useEffect(() => {
        async function fetchSharedHabits() {
            try {
                // This is a complex query. We need habits where the user is a partner.
                // 1. Get active partnerships where I am the partner_email
                const { data: { user } } = await supabase.auth.getUser()
                if (!user || !user.email) return

                const { data: partnerships } = await supabase
                    .from("partnerships")
                    .select("user_id")
                    .eq("partner_email", user.email)
                    .eq("status", "active")

                if (!partnerships || partnerships.length === 0) {
                    setIsLoading(false)
                    return
                }

                const partnerIds = partnerships.map(p => p.user_id)

                // 2. Fetch habits from these users
                const { data: habits } = await supabase
                    .from("habits")
                    .select(`
                        *,
                        habit_logs(date, status)
                    `)
                    .in("user_id", partnerIds)
                    .order("created_at", { ascending: false })

                if (habits) {
                    setSharedHabits(habits.map(h => ({
                        ...h,
                        user_email: "Partner", // Placeholder
                        logs: h.habit_logs
                    })))
                }

            } catch (error) {
                console.error("Error fetching shared habits:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSharedHabits()
    }, [])

    return (
        <div className="space-y-8">
            <Navbar />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : sharedHabits.length === 0 ? (
                <GlassCard className="text-center py-12">
                    <p className="text-muted-foreground">{t('noHabits')}</p>
                </GlassCard>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sharedHabits.map((habit) => {
                        const todayLog = habit.logs.find(l => l.date === today)
                        return (
                            <GlassCard key={habit.id} className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{habit.title}</h3>
                                    {habit.description && (
                                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">{t('statusToday')}</span>
                                    {todayLog ? (
                                        <span className={todayLog.status === 'completed' ? 'text-green-500' : 'text-red-500 capitalize'}>
                                            {todayLog.status}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">{t('pending')}</span>
                                    )}
                                </div>
                            </GlassCard>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
