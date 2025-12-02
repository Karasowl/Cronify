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
    Download,
    AlertCircle,
    FileText,
} from "lucide-react"
import { jsPDF } from "jspdf"
import { Button } from "@/components/ui/button"
import { Badges } from "@/components/badges"
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
    const [allHabits, setAllHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [partnersCount, setPartnersCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch all habits (for badges)
                const { data: allHabitsData } = await supabase
                    .from("habits")
                    .select("*")

                setAllHabits(allHabitsData || [])

                // Filter build habits for stats
                const buildHabits = (allHabitsData || []).filter(h => h.habit_type === "build")
                setHabits(buildHabits)

                // Fetch all logs
                const { data: logsData } = await supabase
                    .from("habit_logs")
                    .select("*")
                    .order("date", { ascending: true })

                setLogs(logsData || [])

                // Fetch partners count
                const { count } = await supabase
                    .from("partnerships")
                    .select("*", { count: "exact", head: true })

                setPartnersCount(count || 0)
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
        const days = t.raw("daysOfWeek") as string[]
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
    }, [logs, t])

    // Best day
    const bestDay = useMemo(() => {
        return dayOfWeekStats.reduce((best, day) => (day.rate > best.rate ? day : best), {
            day: "",
            rate: 0,
        })
    }, [dayOfWeekStats])

    // Badge calculations
    const badgeStats = useMemo(() => {
        // Check for perfect week (any week with 100% completion)
        let hasPerfectWeek = false
        const today = new Date()

        for (let i = 0; i < 52; i++) {
            const weekStart = new Date(today)
            weekStart.setDate(today.getDate() - (i * 7 + 6))
            const weekEnd = new Date(today)
            weekEnd.setDate(today.getDate() - i * 7)

            const weekLogs = logs.filter((l) => {
                const logDate = new Date(l.date)
                return logDate >= weekStart && logDate <= weekEnd
            })

            if (weekLogs.length >= 7) {
                const completed = weekLogs.filter((l) => l.status === "completed").length
                if (completed === weekLogs.length) {
                    hasPerfectWeek = true
                    break
                }
            }
        }

        // Check for break habit 7-day streak
        const breakHabits = allHabits.filter((h) => h.habit_type === "break")
        let hasBreakHabitStreak7 = false

        for (const habit of breakHabits) {
            const startDate = new Date(habit.last_reset || habit.created_at)
            const now = new Date()
            const daysSince = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            if (daysSince >= 7) {
                hasBreakHabitStreak7 = true
                break
            }
        }

        return {
            hasPerfectWeek,
            hasBreakHabitStreak7,
        }
    }, [logs, allHabits])

    // Failure reasons analysis
    const failureReasons = useMemo(() => {
        const reasonCounts: Record<string, number> = {}

        logs
            .filter((l) => l.status === "failed" && l.reason)
            .forEach((log) => {
                const reason = log.reason!.trim().toLowerCase()
                if (reason) {
                    // Normalize common patterns
                    const normalizedReason = log.reason!.trim()
                    reasonCounts[normalizedReason] = (reasonCounts[normalizedReason] || 0) + 1
                }
            })

        // Sort by count and take top 5
        return Object.entries(reasonCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([reason, count]) => ({ reason, count }))
    }, [logs])

    // Export to CSV function
    function exportToCSV() {
        // Create CSV content
        const headers = ["Date", "Habit", "Status", "Reason"]
        const rows = logs.map((log) => {
            const habit = habits.find((h) => h.id === log.habit_id)
            return [
                log.date,
                habit?.title || "Unknown",
                log.status,
                log.reason || "",
            ]
        })

        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n")

        // Create and download file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `cronify-export-${new Date().toISOString().split("T")[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success(t("exportSuccess"))
    }

    // Export to PDF function
    function exportToPDF() {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        let yPos = 20

        // Title
        doc.setFontSize(24)
        doc.setTextColor(124, 58, 237) // Primary color
        doc.text("Cronify", pageWidth / 2, yPos, { align: "center" })
        yPos += 10

        doc.setFontSize(16)
        doc.setTextColor(100, 100, 100)
        doc.text(t("title"), pageWidth / 2, yPos, { align: "center" })
        yPos += 15

        // Date
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: "center" })
        yPos += 15

        // Overview stats
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text(t("overview"), 20, yPos)
        yPos += 10

        doc.setFontSize(11)
        doc.setTextColor(60, 60, 60)
        doc.text(`${t("totalDays")}: ${overallStats.totalDays}`, 25, yPos)
        yPos += 7
        doc.text(`${t("completedDays")}: ${overallStats.completedDays}`, 25, yPos)
        yPos += 7
        doc.text(`${t("failedDays")}: ${overallStats.failedDays}`, 25, yPos)
        yPos += 7
        doc.text(`${t("completionRate")}: ${overallStats.completionRate}%`, 25, yPos)
        yPos += 7
        doc.text(`${t("currentStreak")}: ${overallStats.currentStreak} days`, 25, yPos)
        yPos += 15

        // Habit breakdown
        if (habitBreakdown.length > 0) {
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text(t("habitBreakdown"), 20, yPos)
            yPos += 10

            doc.setFontSize(10)
            doc.setTextColor(60, 60, 60)
            habitBreakdown.forEach((habit) => {
                if (yPos > 270) {
                    doc.addPage()
                    yPos = 20
                }
                doc.text(`• ${habit.name}: ${habit.rate}% (${habit.completed}/${habit.total})`, 25, yPos)
                yPos += 6
            })
            yPos += 10
        }

        // Failure reasons
        if (failureReasons.length > 0) {
            if (yPos > 240) {
                doc.addPage()
                yPos = 20
            }

            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text(t("failureReasons"), 20, yPos)
            yPos += 10

            doc.setFontSize(10)
            doc.setTextColor(60, 60, 60)
            failureReasons.forEach((item, index) => {
                if (yPos > 270) {
                    doc.addPage()
                    yPos = 20
                }
                doc.text(`${index + 1}. ${item.reason} (${item.count}x)`, 25, yPos)
                yPos += 6
            })
        }

        // Save
        doc.save(`cronify-report-${new Date().toISOString().split("T")[0]}.pdf`)
        toast.success(t("exportSuccess"))
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToCSV} className="gap-2">
                        <Download className="w-4 h-4" />
                        {t("exportCSV")}
                    </Button>
                    <Button variant="outline" onClick={exportToPDF} className="gap-2">
                        <FileText className="w-4 h-4" />
                        {t("exportPDF")}
                    </Button>
                </div>
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
                    <p className="text-sm text-muted-foreground">{t("bestDay")} ({bestDay.rate}%)</p>
                </GlassCard>
            </div>

            {/* Badges / Achievements */}
            <Badges
                currentStreak={overallStats.currentStreak}
                bestStreak={overallStats.currentStreak}
                totalHabits={allHabits.length}
                totalPartners={partnersCount}
                hasBreakHabitStreak7={badgeStats.hasBreakHabitStreak7}
                hasPerfectWeek={badgeStats.hasPerfectWeek}
            />

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
                                name={t("percentCompleted")}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Day of Week Analysis */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-sm sm:text-base">{t("dayPerformance")}</h2>
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
                            <Bar dataKey="rate" name={t("percentCompleted")} radius={[4, 4, 0, 0]}>
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

            {/* Failure Reasons Analysis */}
            <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="font-semibold">{t("failureReasons")}</h2>
                        <p className="text-xs text-muted-foreground">{t("failureReasonsDesc")}</p>
                    </div>
                </div>

                {failureReasons.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {t("noReasons")}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {failureReasons.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-medium text-red-500">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{item.reason}</p>
                                </div>
                                <div className="flex-shrink-0 text-xs text-muted-foreground">
                                    {item.count} {t("timesRecorded")}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                                {habitBreakdown[0].rate}% {t("compliance")}
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
                                {habitBreakdown[habitBreakdown.length - 1].rate}% {t("compliance")}
                            </p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    )
}
