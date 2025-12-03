"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Habit, HabitLog } from "@/types"

interface WeekHeatmapProps {
    habits: Habit[]
    logs: HabitLog[]
    onDayClick?: (date: string) => void
}

const DAY_NAMES_SHORT = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]

export function WeekHeatmap({ habits, logs, onDayClick }: WeekHeatmapProps) {
    // Get last 7 days including today
    const last7Days = useMemo(() => {
        const days: Date[] = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            days.push(date)
        }
        return days
    }, [])

    // Create logs map by date and habit
    const logsByDateHabit = useMemo(() => {
        const map: Record<string, Record<string, HabitLog>> = {}
        logs.forEach((log) => {
            if (!map[log.date]) {
                map[log.date] = {}
            }
            map[log.date][log.habit_id] = log
        })
        return map
    }, [logs])

    // Only build habits for the heatmap
    const buildHabits = useMemo(
        () => habits.filter((h) => h.habit_type === "build"),
        [habits]
    )

    // Calculate completion rate for a day
    const getDayStats = (date: Date) => {
        const dateKey = date.toISOString().split("T")[0]
        const dayLogs = logsByDateHabit[dateKey] || {}

        // Filter habits that were active on this date
        const activeHabits = buildHabits.filter((habit) => {
            const startDate = new Date(habit.start_date || habit.created_at)
            startDate.setHours(0, 0, 0, 0)
            return date >= startDate
        })

        if (activeHabits.length === 0) {
            return { completed: 0, failed: 0, pending: 0, total: 0, rate: 0 }
        }

        let completed = 0
        let failed = 0
        let pending = 0

        activeHabits.forEach((habit) => {
            const log = dayLogs[habit.id]
            if (!log) {
                pending++
            } else if (log.status === "completed") {
                completed++
            } else {
                failed++
            }
        })

        const rate = Math.round((completed / activeHabits.length) * 100)

        return { completed, failed, pending, total: activeHabits.length, rate }
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    const isFuture = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date > today
    }

    const formatDateKey = (date: Date) => date.toISOString().split("T")[0]

    const formatDateDisplay = (date: Date) => {
        return date.toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
            month: "short",
        })
    }

    // Get day name based on index
    const getDayName = (date: Date) => {
        const dayIndex = date.getDay()
        // Convert Sunday (0) to 6, Monday (1) to 0, etc.
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
        return DAY_NAMES_SHORT[adjustedIndex]
    }

    return (
        <TooltipProvider>
            <div className="flex gap-1.5 sm:gap-2">
                {last7Days.map((date) => {
                    const dateKey = formatDateKey(date)
                    const stats = getDayStats(date)
                    const today = isToday(date)
                    const future = isFuture(date)

                    // Determine background color based on rate
                    let bgClass = "bg-muted/50"
                    if (!future && stats.total > 0) {
                        if (stats.rate === 100) {
                            bgClass = "bg-green-500 text-white"
                        } else if (stats.rate >= 75) {
                            bgClass = "bg-green-500/60"
                        } else if (stats.rate >= 50) {
                            bgClass = "bg-yellow-500/60"
                        } else if (stats.rate > 0) {
                            bgClass = "bg-orange-500/40"
                        } else if (stats.pending > 0) {
                            bgClass = "bg-red-500/30"
                        }
                    }

                    return (
                        <Tooltip key={dateKey}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => !future && onDayClick?.(dateKey)}
                                    disabled={future}
                                    className={cn(
                                        "flex flex-col items-center justify-center rounded-lg transition-all",
                                        "w-10 h-12 sm:w-12 sm:h-14",
                                        "hover:scale-105 active:scale-95",
                                        bgClass,
                                        today && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                        future && "opacity-40 cursor-not-allowed"
                                    )}
                                >
                                    <span className="text-[10px] sm:text-xs font-medium opacity-70">
                                        {getDayName(date)}
                                    </span>
                                    <span className="text-sm sm:text-base font-bold">
                                        {stats.total > 0 && !future && stats.rate === 100 ? (
                                            "✓"
                                        ) : (
                                            date.getDate()
                                        )}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            {!future && stats.total > 0 && (
                                <TooltipContent>
                                    <div className="text-sm space-y-1">
                                        <p className="font-medium">{formatDateDisplay(date)}</p>
                                        <div className="flex gap-3 text-xs">
                                            <span className="text-green-500">
                                                ✓ {stats.completed}
                                            </span>
                                            <span className="text-red-500">
                                                ✗ {stats.failed}
                                            </span>
                                            {stats.pending > 0 && (
                                                <span className="text-orange-500">
                                                    ○ {stats.pending}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground">
                                            {stats.rate}% completado
                                        </p>
                                    </div>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    )
                })}
            </div>
        </TooltipProvider>
    )
}
