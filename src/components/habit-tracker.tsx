"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Check, X, MoreVertical, Loader2 } from "lucide-react"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from 'next-intl'

type Habit = {
    id: string
    title: string
    description: string
    created_at: string
}

type Log = {
    habit_id: string
    date: string
    status: "completed" | "failed" | "skipped"
}

export function HabitTracker() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<Log[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]
    const t = useTranslations('HabitTracker')
    const tDashboard = useTranslations('Dashboard')
    const tCommon = useTranslations('Common')

    async function fetchHabits() {
        try {
            const { data: habitsData, error: habitsError } = await supabase
                .from("habits")
                .select("*")
                .order("created_at", { ascending: false })

            if (habitsError) throw habitsError

            const { data: logsData, error: logsError } = await supabase
                .from("habit_logs")
                .select("*")
                .eq("date", today)

            if (logsError) throw logsError

            setHabits(habitsData || [])
            setLogs(logsData || [])
        } catch (error: any) {
            console.error("Error fetching habits:", error)
            console.error("Error details:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            console.error("Full error object:", JSON.stringify(error, null, 2))
            toast.error("Failed to load habits: " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchHabits()
    }, [])

    async function logHabit(habitId: string, status: "completed" | "failed") {
        try {
            const { error } = await supabase.from("habit_logs").upsert({
                habit_id: habitId,
                date: today,
                status,
            })

            if (error) throw error

            setLogs((prev) => [
                ...prev.filter((l) => l.habit_id !== habitId),
                { habit_id: habitId, date: today, status },
            ])
            toast.success(status === "completed" ? t('greatJob') : t('logged'))
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t('todaysHabits')}</h2>
                <AddHabitDialog onHabitAdded={fetchHabits} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {habits.length === 0 ? (
                    <GlassCard className="col-span-full text-center py-12">
                        <p className="text-muted-foreground mb-4">{tDashboard('noHabits')}</p>
                        <AddHabitDialog onHabitAdded={fetchHabits} />
                    </GlassCard>
                ) : (
                    habits.map((habit) => {
                        const log = logs.find((l) => l.habit_id === habit.id)
                        const isCompleted = log?.status === "completed"
                        const isFailed = log?.status === "failed"

                        return (
                            <GlassCard key={habit.id} className="flex flex-col justify-between gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{habit.title}</h3>
                                        {habit.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {habit.description}
                                            </p>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem className="text-destructive">
                                                {tCommon('delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <Button
                                        className={`flex-1 ${isCompleted ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : ""
                                            }`}
                                        variant={isCompleted ? "outline" : "default"}
                                        onClick={() => logHabit(habit.id, "completed")}
                                        disabled={isCompleted}
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        {t('done')}
                                    </Button>
                                    <Button
                                        className={`flex-1 ${isFailed ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : ""
                                            }`}
                                        variant={isFailed ? "outline" : "secondary"}
                                        onClick={() => logHabit(habit.id, "failed")}
                                        disabled={isFailed}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        {t('fail')}
                                    </Button>
                                </div>
                            </GlassCard>
                        )
                    })
                )}
            </div>
        </div>
    )
}
