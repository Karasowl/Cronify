"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { createClient } from "@/lib/supabase/client"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
    Loader2,
    TrendingUp,
    Calendar,
    Trophy,
    Target,
    BarChart3,
    Flame,
} from "lucide-react"
import type { Habit, HabitLog } from "@/types"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from "recharts"

export default function StatsPage() {
    const t = useTranslations("Stats")
    const supabase = createClient()

    const [habits, setHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            try {
                const { data: habitsData } = await supabase
                    .from("habits")
                    .select("*")
                    .eq("habit_type", "build")

                setHabits(habitsData || [])

                // Fetch all logs
                const { data: logsData } = await supabase
                    .from("habit_logs")
                    .select("*")
                    .order("date", { ascending: true })

                setLogs(logsData || [])
            } catch (err: any) {
                toast.error("Error: " + err.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [supabase])

    // Calculate overall stats
    const overallStats = useMemo(() => {
        const completed = logs.filter((l) => l.status === "completed").length
        const failed = logs.filter((l) => l.status === "failed").length
        const total = completed + failed

        // Current streak (consecutive completed days across all habits)
        const today = new Date()
        let currentStreak = 0
        const checkDate = new Date(today)

        while (true) {
            const dateStr = checkDate.toISOString().split("T")[0]
            const dayLogs = logs.filter((l) => l.date === dateStr)

            // If today and no logs yet, skip
            if (dateStr === today.toISOString().split("T")[0] && dayLogs.length === 0) {
                checkDate.setDate(checkDate.getDate() - 1)
                continue
            }

            // Check if all logged habits were completed
            if (dayLogs.length > 0 && dayLogs.every((l) => l.status === "completed")) {
                currentStreak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else {
                break
            }
        }

        return {
            totalDays: total,
            completedDays: completed,
            failedDays: failed,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            currentStreak,
        }
    }, [logs])

    // Weekly progress data (last 8 weeks)
    const weeklyData = useMemo(() => {
        const weeks: { week: string; completed: number; failed: number; rate: number }[] = []
        const today = new Date()

        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(today)
            weekStart.setDate(today.getDate() - (i * 7 + 6))
            const weekEnd = new Date(today)
            weekEnd.setDate(today.getDate() - i * 7)

            const weekLogs = logs.filter((l) => {
                const logDate = new Date(l.date)
                return logDate >= weekStart && logDate <= weekEnd
            })

            const completed = weekLogs.filter((l) => l.status === "completed").length
            const failed = weekLogs.filter((l) => l.status === "failed").length
            const total = completed + failed

            weeks.push({
                week: `S${8 - i}`,
                completed,
                failed,
                rate: total > 0 ? Math.round((completed / total) * 100) : 0,
            })
        }

        return weeks
    }, [logs])

    // Habit breakdown (completion rate per habit)
    const habitBreakdown = useMemo(() => {
        return habits
            .map((habit) => {
                const habitLogs = logs.filter((l) => l.habit_id === habit.id)
                const completed = habitLogs.filter((l) => l.status === "completed").length
                const total = habitLogs.length

                return {
                    id: habit.id,
                    name: habit.title,
                    completed,
                    total,
                    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
                }
            })
            .sort((a, b) => b.rate - a.rate)
    }, [habits, logs])

    // Day of week analysis
    const dayOfWeekStats = useMemo(() => {
        const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
        const dayStats = days.map((day, index) => {
            const dayLogs = logs.filter((l) => new Date(l.date).getDay() === index)
            const completed = dayLogs.filter((l) => l.status === "completed").length
            const total = dayLogs.length

            return {
                day,
                completed,
                total,
                rate: total > 0 ? Math.round((completed / total) * 100) : 0,
            }
        })

        return dayStats
    }, [logs])

    // Best day
    const bestDay = useMemo(() => {
        return dayOfWeekStats.reduce((best, day) => (day.rate > best.rate ? day : best), {
            day: "",
            rate: 0,
        })
    }, [dayOfWeekStats])

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

    if (logs.length === 0) {
        return (
            <div className="space-y-8">
                <Navbar />
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>
                <GlassCard className="text-center py-12">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("noData")}</p>
                </GlassCard>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <Navbar />

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <GlassCard className="text-center">
                    <Calendar className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-3xl font-bold">{overallStats.totalDays}</p>
                    <p className="text-sm text-muted-foreground">{t("totalDays")}</p>
                </GlassCard>

                <GlassCard className="text-center">
                    <Target className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <p className="text-3xl font-bold text-green-500">
                        {overallStats.completionRate}%
                    </p>
                    <p className="text-sm text-muted-foreground">{t("completionRate")}</p>
                </GlassCard>

                <GlassCard className="text-center">
                    <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                    <p className="text-3xl font-bold text-orange-500">
                        {overallStats.currentStreak}
                    </p>
                    <p className="text-sm text-muted-foreground">{t("currentStreak")}</p>
                </GlassCard>

                <GlassCard className="text-center">
                    <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                    <p className="text-3xl font-bold text-yellow-500">{bestDay.day}</p>
                    <p className="text-sm text-muted-foreground">Mejor día ({bestDay.rate}%)</p>
                </GlassCard>
            </div>

            {/* Weekly Progress Chart */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold">{t("weeklyProgress")}</h2>
                </div>
                <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="week" stroke="#888" />
                            <YAxis stroke="#888" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1a1a2e",
                                    border: "1px solid #333",
                                    borderRadius: "8px",
                                }}
                                labelStyle={{ color: "#fff" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="rate"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: "#3b82f6" }}
                                name="% Completado"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Day of Week Analysis */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-sm sm:text-base">Rendimiento por día de la semana</h2>
                </div>
                <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayOfWeekStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="day" stroke="#888" />
                            <YAxis stroke="#888" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1a1a2e",
                                    border: "1px solid #333",
                                    borderRadius: "8px",
                                }}
                                labelStyle={{ color: "#fff" }}
                            />
                            <Bar dataKey="rate" name="% Completado" radius={[4, 4, 0, 0]}>
                                {dayOfWeekStats.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.rate >= 70 ? "#22c55e" : entry.rate >= 40 ? "#f59e0b" : "#ef4444"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Habit Breakdown */}
            {habitBreakdown.length > 0 && (
                <GlassCard>
                    <h2 className="font-semibold mb-4">{t("habitBreakdown")}</h2>
                    <div className="space-y-4">
                        {habitBreakdown.map((habit) => (
                            <div key={habit.id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="truncate">{habit.name}</span>
                                    <span className="text-muted-foreground">
                                        {habit.completed}/{habit.total} ({habit.rate}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${habit.rate}%`,
                                            backgroundColor:
                                                habit.rate >= 70
                                                    ? "#22c55e"
                                                    : habit.rate >= 40
                                                    ? "#f59e0b"
                                                    : "#ef4444",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-2">
                <GlassCard>
                    <h3 className="font-semibold text-green-500 mb-2">{t("mostConsistent")}</h3>
                    {habitBreakdown[0] && (
                        <div>
                            <p className="font-medium">{habitBreakdown[0].name}</p>
                            <p className="text-sm text-muted-foreground">
                                {habitBreakdown[0].rate}% de cumplimiento
                            </p>
                        </div>
                    )}
                </GlassCard>

                <GlassCard>
                    <h3 className="font-semibold text-red-500 mb-2">{t("needsWork")}</h3>
                    {habitBreakdown[habitBreakdown.length - 1] && (
                        <div>
                            <p className="font-medium">
                                {habitBreakdown[habitBreakdown.length - 1].name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {habitBreakdown[habitBreakdown.length - 1].rate}% de cumplimiento
                            </p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    )
}
