export type PartnershipStatus = "pending" | "active" | "paused" | "ended"
export type PartnershipRole = "viewer" | "supporter"

export interface Partnership {
  id: string
  user_id: string
  partner_email: string
  partner_user_id: string | null
  status: PartnershipStatus
  role: PartnershipRole
  can_see_reasons: boolean
  can_see_notes: boolean
  can_send_encouragement: boolean
  created_at: string
  accepted_at: string | null
  ended_at: string | null
}

export interface PartnerWithHabits extends Partnership {
  habits: PartnerHabit[]
}

export interface PartnerHabit {
  id: string
  title: string
  description: string | null
  habit_type: "build" | "break"
  habit_logs: PartnerHabitLog[]
}

export interface PartnerHabitLog {
  date: string
  status: "completed" | "failed" | "skipped" | "partial"
  reason: string | null
}

export interface Encouragement {
  id: string
  habit_id: string
  from_email: string
  message: string
  emoji: string | null
  created_at: string
}

export interface CreatePartnershipInput {
  partner_email: string
  role?: PartnershipRole
  can_see_reasons?: boolean
  can_see_notes?: boolean
  can_send_encouragement?: boolean
}

export interface SendEncouragementInput {
  habit_id: string
  message: string
  emoji?: string
}
