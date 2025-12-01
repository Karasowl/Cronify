export type HabitType = "build" | "break"

export type HabitFrequency =
  | { type: "daily" }
  | { type: "weekly"; days: number[] } // 0=Sunday, 1=Monday, etc.
  | { type: "times_per_week"; times: number }

export interface Habit {
  id: string
  user_id: string
  title: string
  description: string | null
  habit_type: HabitType
  frequency: HabitFrequency
  target_value: number | null
  target_unit: string | null
  start_date: string
  end_date: string | null
  is_public: boolean
  // Timer fields for "break" habits (cronómetro de abstinencia)
  last_reset: string
  max_streak_seconds: number
  current_goal_seconds: number
  created_at: string
  updated_at: string
}

// Duration broken down into components
export interface TimerDuration {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

// Relapse record for "break" habits
export interface Relapse {
  id: string
  habit_id: string
  duration_seconds: number
  reason: string | null
  created_at: string
}

export interface HabitWithLogs extends Habit {
  habit_logs: HabitLog[]
}

export interface HabitLog {
  id: string
  habit_id: string
  date: string
  status: HabitLogStatus
  value: number | null
  reason: string | null
  notes: string | null
  mood: number | null
  logged_at: string
  created_at: string
}

export type HabitLogStatus = "completed" | "failed" | "skipped" | "partial"

export interface HabitStats {
  totalDays: number
  completedDays: number
  failedDays: number
  skippedDays: number
  completionRate: number
  currentStreak: number
  bestStreak: number
}

export interface CreateHabitInput {
  title: string
  description?: string
  habit_type?: HabitType
  frequency?: HabitFrequency
  target_value?: number
  target_unit?: string
  start_date?: string
  end_date?: string
  is_public?: boolean
}

export interface LogHabitInput {
  habit_id: string
  date: string
  status: HabitLogStatus
  value?: number
  reason?: string
  notes?: string
  mood?: number
}
