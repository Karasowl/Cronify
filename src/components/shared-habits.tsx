"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Check, X, User } from "lucide-react"

type SharedHabit = {
    id: string
    title: string
    description: string
    user_email: string // We'll need to join this or fetch it
    logs: { date: string; status: string }[]
}

export function SharedHabits() {
    const [sharedHabits, setSharedHabits] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    async function fetchSharedData() {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user || !user.email) return

            // 1. Get active partnerships where I am the partner
            const { data: partnerships } = await supabase
                .from("partnerships")
                .select("user_id")
                .eq("partner_email", user.email)
                .eq("status", "active")

            if (!partnerships || partnerships.length === 0) {
                setIsLoading(false)
                return
            }

            const userIds = partnerships.map((p) => p.user_id)

            // 2. Fetch habits for these users
            const { data: habits } = await supabase
                .from("habits")
                .select("*, habit_logs(*)")
                .in("user_id", userIds)

            setSharedHabits(habits || [])
        } catch (error) {
            console.error("Error fetching shared habits:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSharedData()
    }, [])

    if (isLoading) return <div>Loading shared view...</div>

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Shared With Me</h2>

            {sharedHabits.length === 0 ? (
                <p className="text-muted-foreground">No one has shared their habits with you yet.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sharedHabits.map((habit) => {
                        const log = habit.habit_logs?.find((l: any) => l.date === today)
                        const isCompleted = log?.status === "completed"
                        const isFailed = log?.status === "failed"

                        return (
                            <GlassCard key={habit.id} className="border-l-4 border-l-primary/50">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{habit.title}</h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <User className="w-3 h-3" /> Shared User
                                        </p>
                                    </div>
                                    {isCompleted && <Check className="text-green-500 w-6 h-6" />}
                                    {isFailed && <X className="text-red-500 w-6 h-6" />}
                                </div>

                                <div className="text-sm">
                                    Status today: <span className="font-medium">{log?.status || "Pending"}</span>
                                    {log?.reason && <p className="text-destructive mt-1">Reason: {log.reason}</p>}
                                </div>
                            </GlassCard>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
