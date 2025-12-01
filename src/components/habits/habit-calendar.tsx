"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Check, X, Minus, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { HabitLog, HabitStats } from "@/types"
import { calculateHabitStats } from "@/hooks"
import { cn } from "@/lib/utils"

interface HabitCalendarProps {
  logs: HabitLog[]
  startDate: string
  onDayClick?: (date: string, log?: HabitLog) => void
  showStats?: boolean
}

const DAYS_OF_WEEK = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]

export function HabitCalendar({
  logs,
  startDate,
  onDayClick,
  showStats = true,
}: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Create a map of logs by date for quick lookup
  const logsByDate = useMemo(() => {
    const map: Record<string, HabitLog> = {}
    logs.forEach((log) => {
      map[log.date] = log
    })
    return map
  }, [logs])

  // Calculate stats
  const stats = useMemo(() => calculateHabitStats(logs, startDate), [logs, startDate])

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

  const isBeforeStart = (date: Date): boolean => {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    return date < start
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />
      case "failed":
        return <X className="w-4 h-4 text-red-500" />
      case "skipped":
        return <Minus className="w-4 h-4 text-yellow-500" />
      case "partial":
        return <Circle className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 border-green-500/50"
      case "failed":
        return "bg-red-500/20 border-red-500/50"
      case "skipped":
        return "bg-yellow-500/20 border-yellow-500/50"
      case "partial":
        return "bg-blue-500/20 border-blue-500/50"
      default:
        return ""
    }
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
            Hoy
          </Button>
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
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
            const log = logsByDate[dateKey]
            const today = isToday(date)
            const future = isFuture(date)
            const beforeStart = isBeforeStart(date)
            const disabled = future || beforeStart

            return (
              <Tooltip key={dateKey}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => !disabled && onDayClick?.(dateKey, log)}
                    disabled={disabled}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-lg border text-sm transition-all",
                      "hover:bg-accent/50",
                      today && "ring-2 ring-primary",
                      disabled && "opacity-40 cursor-not-allowed",
                      log && getStatusColor(log.status),
                      !log && !disabled && "border-border/50 hover:border-border"
                    )}
                  >
                    <span className={cn("text-xs", today && "font-bold")}>
                      {date.getDate()}
                    </span>
                    {log && (
                      <span className="mt-0.5">
                        {getStatusIcon(log.status)}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                {log && (
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-medium capitalize">{log.status}</p>
                      {log.reason && (
                        <p className="text-muted-foreground mt-1">
                          Razón: {log.reason}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>

      {/* Stats */}
      {showStats && (
        <GlassCard className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-500">{stats.completedDays}</p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{stats.failedDays}</p>
              <p className="text-xs text-muted-foreground">Fallados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.completionRate}%</p>
              <p className="text-xs text-muted-foreground">Cumplimiento</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">
                {stats.currentStreak}
                {stats.currentStreak > 0 && " 🔥"}
              </p>
              <p className="text-xs text-muted-foreground">Racha actual</p>
            </div>
          </div>
          {stats.bestStreak > stats.currentStreak && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              Mejor racha: {stats.bestStreak} días
            </p>
          )}
        </GlassCard>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50" />
          <span>Completado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50" />
          <span>Fallado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50" />
          <span>Saltado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded ring-2 ring-primary" />
          <span>Hoy</span>
        </div>
      </div>
    </div>
  )
}
