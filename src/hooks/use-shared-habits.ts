"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { HabitLog } from "@/types"
import { calculateHabitStats } from "./use-habit-logs"

export interface PartnerData {
  id: string
  email: string
  habits: PartnerHabit[]
}

export interface PartnerHabit {
  id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
  start_date: string
  habit_logs: HabitLog[]
  stats: {
    completionRate: number
    currentStreak: number
    completedDays: number
    failedDays: number
  }
  todayStatus: "completed" | "failed" | "skipped" | "pending"
  todayReason: string | null
}

export function useSharedHabits() {
  const [partners, setPartners] = useState<PartnerData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSharedData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setIsLoading(false)
        return
      }

      // Get active partnerships where I am the partner
      const { data: partnerships, error: partnerError } = await supabase
        .from("partnerships")
        .select("user_id, partner_email")
        .eq("partner_email", user.email)
        .eq("status", "active")

      if (partnerError) throw partnerError

      if (!partnerships || partnerships.length === 0) {
        setPartners([])
        setIsLoading(false)
        return
      }

      const userIds = partnerships.map((p) => p.user_id)

      // Fetch habits with logs for these users
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("*, habit_logs(*)")
        .in("user_id", userIds)
        .order("created_at", { ascending: false })

      if (habitsError) throw habitsError

      // Get user emails for display (from partnerships we already have)
      // For now, we'll group by user_id and use a placeholder
      const today = new Date().toISOString().split("T")[0]

      // Group habits by user_id
      const habitsByUser: Record<string, PartnerHabit[]> = {}

      for (const habit of habits || []) {
        if (!habitsByUser[habit.user_id]) {
          habitsByUser[habit.user_id] = []
        }

        const logs = habit.habit_logs || []
        const todayLog = logs.find((l: HabitLog) => l.date === today)
        const stats = calculateHabitStats(logs, habit.start_date || habit.created_at)

        habitsByUser[habit.user_id].push({
          id: habit.id,
          user_id: habit.user_id,
          title: habit.title,
          description: habit.description,
          created_at: habit.created_at,
          start_date: habit.start_date || habit.created_at,
          habit_logs: logs,
          stats: {
            completionRate: stats.completionRate,
            currentStreak: stats.currentStreak,
            completedDays: stats.completedDays,
            failedDays: stats.failedDays,
          },
          todayStatus: todayLog?.status || "pending",
          todayReason: todayLog?.reason || null,
        })
      }

      // Build partner data array
      const partnerData: PartnerData[] = userIds.map((userId) => ({
        id: userId,
        email: `Partner`, // We'd need another query to get actual email
        habits: habitsByUser[userId] || [],
      }))

      setPartners(partnerData)
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching shared habits:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSharedData()
  }, [fetchSharedData])

  return {
    partners,
    isLoading,
    error,
    refetch: fetchSharedData,
  }
}
