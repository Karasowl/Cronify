"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Habit, HabitWithLogs, CreateHabitInput } from "@/types"

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchHabits = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setHabits(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching habits:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createHabit = useCallback(async (input: CreateHabitInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const now = new Date().toISOString()

      const { data, error: createError } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          habit_type: input.habit_type || "build",
          frequency: input.frequency || { type: "daily" },
          start_date: input.start_date || now,
          last_reset: now,
          current_goal_seconds: 86400,
          max_streak_seconds: 0,
        })
        .select()
        .single()

      if (createError) throw createError

      setHabits((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }, [])

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId)

      if (deleteError) throw deleteError

      setHabits((prev) => prev.filter((h) => h.id !== habitId))
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }, [])

  const updateHabit = useCallback(async (habitId: string, updates: Partial<CreateHabitInput>) => {
    try {
      const { data, error: updateError } = await supabase
        .from("habits")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", habitId)
        .select()
        .single()

      if (updateError) throw updateError

      setHabits((prev) => prev.map((h) => (h.id === habitId ? data : h)))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  return {
    habits,
    isLoading,
    error,
    fetchHabits,
    createHabit,
    deleteHabit,
    updateHabit,
  }
}

export function useHabit(habitId: string) {
  const [habit, setHabit] = useState<HabitWithLogs | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchHabit = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("habits")
        .select("*, habit_logs(*)")
        .eq("id", habitId)
        .single()

      if (fetchError) throw fetchError

      setHabit(data)
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching habit:", err)
    } finally {
      setIsLoading(false)
    }
  }, [habitId])

  useEffect(() => {
    if (habitId) {
      fetchHabit()
    }
  }, [habitId, fetchHabit])

  return {
    habit,
    isLoading,
    error,
    refetch: fetchHabit,
  }
}
