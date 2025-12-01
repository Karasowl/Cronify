"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { HabitLog, LogHabitInput, HabitStats } from "@/types"

export function useTodayLogs() {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("date", today)

      if (fetchError) throw fetchError

      setLogs(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching logs:", err)
    } finally {
      setIsLoading(false)
    }
  }, [today])

  const logHabit = useCallback(async (input: LogHabitInput) => {
    try {
      const { data, error: logError } = await supabase
        .from("habit_logs")
        .upsert(
          {
            habit_id: input.habit_id,
            date: input.date,
            status: input.status,
            value: input.value || null,
            reason: input.reason || null,
            notes: input.notes || null,
            mood: input.mood || null,
          },
          { onConflict: "habit_id,date" }
        )
        .select()
        .single()

      if (logError) throw logError

      setLogs((prev) => [
        ...prev.filter((l) => !(l.habit_id === input.habit_id && l.date === input.date)),
        data,
      ])
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    logHabit,
    today,
  }
}

export function useHabitLogs(habitId: string, startDate?: string, endDate?: string) {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .order("date", { ascending: false })

      if (startDate) {
        query = query.gte("date", startDate)
      }
      if (endDate) {
        query = query.lte("date", endDate)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setLogs(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching habit logs:", err)
    } finally {
      setIsLoading(false)
    }
  }, [habitId, startDate, endDate])

  useEffect(() => {
    if (habitId) {
      fetchLogs()
    }
  }, [habitId, fetchLogs])

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs,
  }
}

export function calculateHabitStats(logs: HabitLog[], startDate: string): HabitStats {
  const today = new Date()
  const start = new Date(startDate)

  // Calculate total days since start
  const totalDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const completedDays = logs.filter((l) => l.status === "completed").length
  const failedDays = logs.filter((l) => l.status === "failed").length
  const skippedDays = logs.filter((l) => l.status === "skipped").length

  // Calculate completion rate (only count logged days)
  const loggedDays = completedDays + failedDays
  const completionRate = loggedDays > 0 ? Math.round((completedDays / loggedDays) * 100) : 0

  // Calculate current streak
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let currentStreak = 0
  let checkDate = new Date()

  for (const log of sortedLogs) {
    const logDate = new Date(log.date)
    const daysDiff = Math.floor((checkDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff > 1) break // Gap in dates

    if (log.status === "completed") {
      currentStreak++
      checkDate = logDate
    } else if (log.status === "failed") {
      break
    }
  }

  // Calculate best streak
  let bestStreak = 0
  let tempStreak = 0
  const chronologicalLogs = [...logs].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (const log of chronologicalLogs) {
    if (log.status === "completed") {
      tempStreak++
      bestStreak = Math.max(bestStreak, tempStreak)
    } else if (log.status === "failed") {
      tempStreak = 0
    }
  }

  return {
    totalDays,
    completedDays,
    failedDays,
    skippedDays,
    completionRate,
    currentStreak,
    bestStreak,
  }
}
