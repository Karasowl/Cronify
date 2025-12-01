"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { TimerDuration } from "@/types"

interface UseTimerOptions {
  habitId: string
  lastReset: string
  maxStreakSeconds: number
  currentGoalSeconds: number
  onMaxReached?: (newMax: number) => void
}

interface UseTimerReturn {
  duration: TimerDuration
  progress: number // 0-100 percentage towards goal
  isNewRecord: boolean
  formattedTime: string
  formattedMaxStreak: string
  reset: (reason?: string) => Promise<void>
  isResetting: boolean
}

function calculateDuration(fromDate: Date): TimerDuration {
  const now = new Date()
  const diffMs = now.getTime() - fromDate.getTime()
  const totalSeconds = Math.floor(diffMs / 1000)

  if (totalSeconds < 0) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 }
  }

  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const totalDays = Math.floor(totalHours / 24)

  // Approximate months and years
  const years = Math.floor(totalDays / 365)
  const remainingDaysAfterYears = totalDays % 365
  const months = Math.floor(remainingDaysAfterYears / 30)
  const days = remainingDaysAfterYears % 30

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
  }
}

function formatDuration(duration: TimerDuration): string {
  const { years, months, days, hours, minutes, seconds } = duration

  if (years > 0) {
    return `${years}a ${months}m ${days}d`
  }
  if (months > 0) {
    return `${months}m ${days}d ${hours}h`
  }
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

function formatSeconds(totalSeconds: number): string {
  return formatDuration(calculateDuration(new Date(Date.now() - totalSeconds * 1000)))
}

export function useTimer({
  habitId,
  lastReset,
  maxStreakSeconds,
  currentGoalSeconds,
  onMaxReached,
}: UseTimerOptions): UseTimerReturn {
  const supabase = createClient()
  const [duration, setDuration] = useState<TimerDuration>(() =>
    calculateDuration(new Date(lastReset))
  )
  const [isResetting, setIsResetting] = useState(false)
  const [localMaxStreak, setLocalMaxStreak] = useState(maxStreakSeconds)

  // Update timer every second
  useEffect(() => {
    const resetDate = new Date(lastReset)

    const updateTimer = () => {
      const newDuration = calculateDuration(resetDate)
      setDuration(newDuration)

      // Check if we beat the record
      if (newDuration.totalSeconds > localMaxStreak) {
        setLocalMaxStreak(newDuration.totalSeconds)
        onMaxReached?.(newDuration.totalSeconds)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [lastReset, localMaxStreak, onMaxReached])

  // Reset (recaída)
  const reset = useCallback(async (reason?: string) => {
    setIsResetting(true)
    try {
      const now = new Date().toISOString()
      const currentSeconds = duration.totalSeconds

      // Save the relapse to history
      const { error: relapseError } = await supabase
        .from("relapses")
        .insert({
          habit_id: habitId,
          duration_seconds: currentSeconds,
          reason: reason || null,
        })

      if (relapseError) {
        console.error("Error saving relapse:", relapseError)
        // Continue even if relapse logging fails
      }

      // Update the habit with new last_reset and potentially new max
      const updates: Record<string, unknown> = {
        last_reset: now,
        updated_at: now,
      }

      // If current streak is a new record, save it
      if (currentSeconds > maxStreakSeconds) {
        updates.max_streak_seconds = currentSeconds
        setLocalMaxStreak(currentSeconds)
      }

      const { error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", habitId)

      if (error) throw error

      // Reset local state
      setDuration({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
      })
    } finally {
      setIsResetting(false)
    }
  }, [habitId, duration.totalSeconds, maxStreakSeconds, supabase])

  // Calculate progress towards goal (0-100)
  const progress = useMemo(() => {
    if (currentGoalSeconds <= 0) return 0
    return Math.min((duration.totalSeconds / currentGoalSeconds) * 100, 100)
  }, [duration.totalSeconds, currentGoalSeconds])

  // Check if current is a new record
  const isNewRecord = duration.totalSeconds > maxStreakSeconds

  // Formatted strings
  const formattedTime = useMemo(() => formatDuration(duration), [duration])
  const formattedMaxStreak = useMemo(
    () => formatSeconds(localMaxStreak),
    [localMaxStreak]
  )

  return {
    duration,
    progress,
    isNewRecord,
    formattedTime,
    formattedMaxStreak,
    reset,
    isResetting,
  }
}

// Helper to format goal duration
export function formatGoalSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds} segundos`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutos`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} días`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} semanas`
  return `${Math.floor(seconds / 2592000)} meses`
}

// Goal presets
export const GOAL_PRESETS = [
  { label: "1 hora", seconds: 3600 },
  { label: "6 horas", seconds: 21600 },
  { label: "12 horas", seconds: 43200 },
  { label: "1 día", seconds: 86400 },
  { label: "3 días", seconds: 259200 },
  { label: "1 semana", seconds: 604800 },
  { label: "2 semanas", seconds: 1209600 },
  { label: "1 mes", seconds: 2592000 },
  { label: "3 meses", seconds: 7776000 },
  { label: "6 meses", seconds: 15552000 },
  { label: "1 año", seconds: 31536000 },
]
