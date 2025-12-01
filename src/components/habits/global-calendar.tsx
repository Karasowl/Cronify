"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Habit, HabitLog } from "@/types"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface GlobalCalendarProps {
    habits: Habit[]
    logs: HabitLog[]
    onDayClick: (date: string) => void
    onAddHabit: () => void
}

const DAYS_OF_WEEK = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]

// Generate consistent colors for habits
const HABIT_COLORS = [
    { bg: "bg-blue-500", dot: "bg-blue-500" },
    { bg: "bg-green-500", dot: "bg-green-500" },
    { bg: "bg-purple-500", dot: "bg-purple-500" },
    { bg: "bg-orange-500", dot: "bg-orange-500" },
    { bg: "bg-pink-500", dot: "bg-pink-500" },
    { bg: "bg-cyan-500", dot: "bg-cyan-500" },
    { bg: "bg-yellow-500", dot: "bg-yellow-500" },
    { bg: "bg-red-500", dot: "bg-red-500" },
]

export function GlobalCalendar({
    habits,
    logs,
    onDayClick,
    onAddHabit,
}: GlobalCalendarProps) {
    const t = useTranslations("Calendar")
    const [currentDate, setCurrentDate] = useState(new Date())

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Only show build habits in global calendar (break habits are timer-based)
    const buildHabits = useMemo(
        () => habits.filter((h) => h.habit_type === "build"),
        [habits]
    )

    // Create a map of habit colors
    const habitColors = useMemo(() => {
        const map: Record<string, typeof HABIT_COLORS[0]> = {}
        buildHabits.forEach((habit, index) => {
            map[habit.id] = HABIT_COLORS[index % HABIT_COLORS.length]
        })
        return map
    }, [buildHabits])

    // Create a map of logs by date and habit
    const logsByDateAndHabit = useMemo(() => {
        const map: Record<string, Record<string, HabitLog>> = {}
        logs.forEach((log) => {
            if (!map[log.date]) {
                map[log.date] = {}
            }
            map[log.date][log.habit_id] = log
        })
        return map
    }, [logs])

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)

        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        let startDay = firstDayOfMonth.getDay() - 1
        if (startDay === -1) startDay = 6

        const days: (Date | null)[] = []

        // Add empty slots for days before the first day of month
        for (let i = 0; i < startDay; i++) {
            days.push(null)
        }

        // Add all days of the month
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }, [year, month])

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const formatDateKey = (date: Date): string => {
        return date.toISOString().split("T")[0]
    }

    const isToday = (date: Date): boolean => {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    const isFuture = (date: Date): boolean => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date > today
    }

    const isBeforeAnyHabit = (date: Date): boolean => {
        if (buildHabits.length === 0) return true
        const earliestStart = Math.min(
            ...buildHabits.map((h) => new Date(h.start_date || h.created_at).getTime())
        )
        return date.getTime() < earliestStart
    }

    // Get habits that apply to a specific date
    const getHabitsForDate = (date: Date): Habit[] => {
        return buildHabits.filter((habit) => {
            const habitStart = new Date(habit.start_date || habit.created_at)
            habitStart.setHours(0, 0, 0, 0)
            return date >= habitStart
        })
    }

    // Check if a day has pending habits (habits without logs)
    const hasPendingHabits = (date: Date): boolean => {
        const dateKey = formatDateKey(date)
        const dayLogs = logsByDateAndHabit[dateKey] || {}
        const habitsForDay = getHabitsForDate(date)

        if (habitsForDay.length === 0) return false

        return habitsForDay.some((habit) => !dayLogs[habit.id])
    }

    // Get day summary for tooltip
    const getDaySummary = (date: Date) => {
        const dateKey = formatDateKey(date)
        const dayLogs = logsByDateAndHabit[dateKey] || {}
        const habitsForDay = getHabitsForDate(date)

        let completed = 0
        let failed = 0
        let pending = 0

        habitsForDay.forEach((habit) => {
            const log = dayLogs[habit.id]
            if (!log) {
                pending++
            } else if (log.status === "completed") {
                completed++
            } else if (log.status === "failed") {
                failed++
            }
        })

        return { completed, failed, pending, total: habitsForDay.length }
    }

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {monthNames[month]} {year}
                </h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                        {t("today")}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="default" size="sm" onClick={onAddHabit} className="gap-1 ml-2">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nuevo</span>
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {/* Day headers */}
                {DAYS_OF_WEEK.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground py-2"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                <TooltipProvider>
                    {calendarDays.map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} className="aspect-square" />
                        }

                        const dateKey = formatDateKey(date)
                        const dayLogs = logsByDateAndHabit[dateKey] || {}
                        const habitsForDay = getHabitsForDate(date)
                        const today = isToday(date)
                        const future = isFuture(date)
                        const beforeAny = isBeforeAnyHabit(date)
                        const disabled = future || beforeAny
                        const pending = !future && hasPendingHabits(date)
                        const summary = getDaySummary(date)

                        return (
                            <Tooltip key={dateKey}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => !disabled && onDayClick(dateKey)}
                                        disabled={disabled}
                                        className={cn(
                                            "aspect-square min-h-[44px] flex flex-col items-center justify-center rounded-lg border text-sm transition-all p-1",
                                            "hover:bg-accent/50 active:scale-95",
                                            today && "ring-2 ring-primary",
                                            disabled && "opacity-40 cursor-not-allowed",
                                            pending && !today && "border-orange-500 border-2",
                                            !pending && !disabled && "border-border/50 hover:border-border"
                                        )}
                                    >
                                        <span className={cn("text-xs", today && "font-bold")}>
                                            {date.getDate()}
                                        </span>

                                        {/* Habit dots */}
                                        {habitsForDay.length > 0 && (
                                            <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 max-w-full">
                                                {habitsForDay.slice(0, 4).map((habit) => {
                                                    const log = dayLogs[habit.id]
                                                    const color = habitColors[habit.id]
                                                    let dotClass = "opacity-30" // No log = pending (faded)

                                                    if (log) {
                                                        if (log.status === "completed") {
                                                            dotClass = "" // Full color
                                                        } else if (log.status === "failed") {
                                                            dotClass = "opacity-50 ring-1 ring-red-500"
                                                        } else if (log.status === "skipped") {
                                                            dotClass = "opacity-50"
                                                        }
                                                    }

                                                    return (
                                                        <div
                                                            key={habit.id}
                                                            className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                color.dot,
                                                                dotClass
                                                            )}
                                                        />
                                                    )
                                                })}
                                                {habitsForDay.length > 4 && (
                                                    <span className="text-[8px] text-muted-foreground">
                                                        +{habitsForDay.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                </TooltipTrigger>
                                {!disabled && summary.total > 0 && (
                                    <TooltipContent>
                                        <div className="text-sm space-y-1">
                                            <p className="font-medium">
                                                {new Date(dateKey).toLocaleDateString("es-ES", {
                                                    weekday: "long",
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </p>
                                            <div className="flex gap-3 text-xs">
                                                {summary.completed > 0 && (
                                                    <span className="text-green-500">
                                                        ✓ {summary.completed}
                                                    </span>
                                                )}
                                                {summary.failed > 0 && (
                                                    <span className="text-red-500">
                                                        ✗ {summary.failed}
                                                    </span>
                                                )}
                                                {summary.pending > 0 && (
                                                    <span className="text-orange-500">
                                                        ○ {summary.pending}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        )
                    })}
                </TooltipProvider>
            </div>

            {/* Legend */}
            <div className="space-y-3">
                {/* Status legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>{t("completed")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary/30 ring-1 ring-red-500" />
                        <span>{t("failed")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary/30" />
                        <span>{t("pending")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded border-2 border-orange-500" />
                        <span>Día con pendientes</span>
                    </div>
                </div>

                {/* Habit legend */}
                {buildHabits.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                        {buildHabits.map((habit) => (
                            <div key={habit.id} className="flex items-center gap-1">
                                <div
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        habitColors[habit.id]?.dot
                                    )}
                                />
                                <span className="text-muted-foreground truncate max-w-[100px]">
                                    {habit.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
