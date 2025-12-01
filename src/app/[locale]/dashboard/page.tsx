"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { GlobalCalendar, DayHabitsModal, TimerCard } from "@/components/habits"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { createClient } from "@/lib/supabase/client"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { Loader2, Check, X, Clock, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Habit, HabitLog, HabitLogStatus } from "@/types"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    const t = useTranslations("Dashboard")
    const tHabit = useTranslations("HabitTracker")
    const locale = useLocale()
    const supabase = createClient()

    const [habits, setHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [addDialogOpen, setAddDialogOpen] = useState(false)

    // Day modal state
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [dayModalOpen, setDayModalOpen] = useState(false)

    const today = new Date().toISOString().split("T")[0]

    // Fetch habits and logs
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch habits
                const { data: habitsData, error: habitsError } = await supabase
                    .from("habits")
                    .select("*")
                    .order("created_at", { ascending: true })

                if (habitsError) throw habitsError
                setHabits(habitsData || [])

                // Fetch logs for the last 90 days
                const startDate = new Date()
                startDate.setDate(startDate.getDate() - 90)

                const { data: logsData, error: logsError } = await supabase
                    .from("habit_logs")
                    .select("*")
                    .gte("date", startDate.toISOString().split("T")[0])

                if (logsError) throw logsError
                setLogs(logsData || [])
            } catch (err: any) {
                toast.error("Error cargando datos: " + err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [supabase])

    // Split habits by type
    const buildHabits = useMemo(
        () => habits.filter((h) => h.habit_type === "build"),
        [habits]
    )
    const breakHabits = useMemo(
        () => habits.filter((h) => h.habit_type === "break"),
        [habits]
    )

    // Get logs by date
    const logsByDate = useMemo(() => {
        const map: Record<string, Record<string, HabitLog>> = {}
        logs.forEach((log) => {
            if (!map[log.date]) {
                map[log.date] = {}
            }
            map[log.date][log.habit_id] = log
        })
        return map
    }, [logs])

    // Today's logs
    const todayLogs = logsByDate[today] || {}

    // Handle day click from calendar
    function handleDayClick(date: string) {
        setSelectedDate(date)
        setDayModalOpen(true)
    }

    // Handle logging a habit
    async function handleLog(
        habitId: string,
        status: HabitLogStatus,
        reason?: string,
        date?: string
    ) {
        const targetDate = date || today

        try {
            const { error } = await supabase.from("habit_logs").upsert(
                {
                    habit_id: habitId,
                    date: targetDate,
                    status,
                    reason: reason || null,
                },
                { onConflict: "habit_id,date" }
            )

            if (error) throw error

            // Update local state
            setLogs((prev) => {
                const filtered = prev.filter(
                    (l) => !(l.habit_id === habitId && l.date === targetDate)
                )
                return [
                    ...filtered,
                    {
                        id: crypto.randomUUID(),
                        habit_id: habitId,
                        date: targetDate,
                        status,
                        reason: reason || null,
                        value: null,
                        notes: null,
                        mood: null,
                        logged_at: new Date().toISOString(),
                        created_at: new Date().toISOString(),
                    },
                ]
            })

            toast.success(status === "completed" ? tHabit("greatJob") : tHabit("logged"))
        } catch (err: any) {
            toast.error("Error: " + err.message)
        }
    }

    // Handle new habit created
    function handleHabitCreated(habit: Habit) {
        setHabits((prev) => [...prev, habit])
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

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("noHabits")}</p>
            </div>

            {/* Global Calendar */}
            <GlassCard>
                <GlobalCalendar
                    habits={habits}
                    logs={logs}
                    onDayClick={handleDayClick}
                    onAddHabit={() => setAddDialogOpen(true)}
                />
            </GlassCard>

            {/* Today's Quick Log */}
            {buildHabits.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">{tHabit("todaysHabits")}</h2>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {buildHabits.map((habit) => {
                            const log = todayLogs[habit.id]
                            const habitStart = new Date(habit.start_date || habit.created_at)
                            habitStart.setHours(0, 0, 0, 0)
                            const todayDate = new Date(today)

                            // Don't show if habit hasn't started yet
                            if (todayDate < habitStart) return null

                            return (
                                <GlassCard
                                    key={habit.id}
                                    className={cn(
                                        "p-4 transition-all",
                                        log?.status === "completed" && "bg-green-500/10 border-green-500/30",
                                        log?.status === "failed" && "bg-red-500/10 border-red-500/30"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{habit.title}</p>
                                            {habit.description && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {habit.description}
                                                </p>
                                            )}
                                        </div>

                                        {log ? (
                                            <div className="flex items-center gap-1">
                                                {log.status === "completed" && (
                                                    <Check className="w-5 h-5 text-green-500" />
                                                )}
                                                {log.status === "failed" && (
                                                    <X className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-10 sm:h-8 px-3 text-green-600 hover:bg-green-500/20 active:scale-95"
                                                    onClick={() => handleLog(habit.id, "completed")}
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    {tHabit("done")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-10 sm:h-8 px-3 text-red-600 hover:bg-red-500/20 active:scale-95"
                                                    onClick={() => handleLog(habit.id, "failed")}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    {tHabit("fail")}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Break Habits (Timers) */}
            {breakHabits.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-semibold">{tHabit("breakHabits")}</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {breakHabits.map((habit) => (
                            <TimerCard
                                key={habit.id}
                                habit={habit}
                                locale={locale}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {habits.length === 0 && (
                <GlassCard className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        No tienes hábitos todavía. ¡Empieza creando uno!
                    </p>
                    <Button onClick={() => setAddDialogOpen(true)}>
                        Crear mi primer hábito
                    </Button>
                </GlassCard>
            )}

            {/* Day Modal */}
            {selectedDate && (
                <DayHabitsModal
                    open={dayModalOpen}
                    onOpenChange={setDayModalOpen}
                    date={selectedDate}
                    habits={habits}
                    logs={logsByDate[selectedDate] || {}}
                    onLog={(habitId, status, reason) =>
                        handleLog(habitId, status, reason, selectedDate)
                    }
                />
            )}

            {/* Add Habit Dialog */}
            <AddHabitDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onHabitCreated={handleHabitCreated}
            />
        </div>
    )
}
