"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Check,
  X,
  User,
  Loader2,
  Calendar,
  Flame,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { useSharedHabits, PartnerHabit } from "@/hooks/use-shared-habits"
import { HabitCalendar, SendEncouragement } from "@/components/habits"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function SharedHabits() {
  const { partners, isLoading, error } = useSharedHabits()
  const [selectedHabit, setSelectedHabit] = useState<PartnerHabit | null>(null)
  const t = useTranslations("SharedHabits")

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <GlassCard className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive">{error}</p>
      </GlassCard>
    )
  }

  const allHabits = partners.flatMap((p) => p.habits)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {allHabits.length === 0 ? (
        <GlassCard className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noHabits")}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("noHabitsHint") || "Cuando alguien te agregue como accountability partner, sus hábitos aparecerán aquí."}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {partners.map((partner) => (
            <div key={partner.id} className="space-y-4">
              {/* Partner Header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">
                  {partner.habits.length} hábito{partner.habits.length !== 1 ? "s" : ""} compartido{partner.habits.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Habits Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {partner.habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onClick={() => setSelectedHabit(habit)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Dialog */}
      <Dialog open={!!selectedHabit} onOpenChange={() => setSelectedHabit(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedHabit && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle>{selectedHabit.title}</DialogTitle>
                    {selectedHabit.description && (
                      <p className="text-sm text-muted-foreground">
                        {selectedHabit.description}
                      </p>
                    )}
                  </div>
                  <SendEncouragement
                    habitId={selectedHabit.id}
                    habitTitle={selectedHabit.title}
                  />
                </div>
              </DialogHeader>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
                <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xl font-bold text-green-500">
                    {selectedHabit.stats.completedDays}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("completed") || "Completados"}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xl font-bold text-red-500">
                    {selectedHabit.stats.failedDays}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("failed") || "Fallados"}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xl font-bold text-primary">
                    {selectedHabit.stats.completionRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">{t("completion") || "Cumplimiento"}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="text-xl font-bold text-orange-500">
                    {selectedHabit.stats.currentStreak}
                    {selectedHabit.stats.currentStreak >= 3 && " 🔥"}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("streak") || "Racha"}</p>
                </div>
              </div>

              {/* Calendar */}
              <HabitCalendar
                logs={selectedHabit.habit_logs}
                startDate={selectedHabit.start_date}
                showStats={false}
              />

              {/* Recent Failures */}
              {selectedHabit.habit_logs.filter((l) => l.status === "failed" && l.reason).length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-sm">{t("failReasons") || "Razones de fallos recientes"}:</h4>
                  <div className="space-y-2">
                    {selectedHabit.habit_logs
                      .filter((l) => l.status === "failed" && l.reason)
                      .slice(0, 3)
                      .map((log, idx) => (
                        <div
                          key={idx}
                          className="text-sm p-2 rounded bg-red-500/10 border border-red-500/20"
                        >
                          <span className="text-muted-foreground">
                            {new Date(log.date).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                            :
                          </span>{" "}
                          {log.reason}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HabitCard({
  habit,
  onClick,
}: {
  habit: PartnerHabit
  onClick: () => void
}) {
  const getStatusStyles = () => {
    switch (habit.todayStatus) {
      case "completed":
        return "border-l-green-500 bg-green-500/5"
      case "failed":
        return "border-l-red-500 bg-red-500/5"
      default:
        return "border-l-muted-foreground/30"
    }
  }

  const getStatusIcon = () => {
    switch (habit.todayStatus) {
      case "completed":
        return <Check className="w-5 h-5 text-green-500" />
      case "failed":
        return <X className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
    }
  }

  return (
    <GlassCard
      className={cn(
        "border-l-4 cursor-pointer hover:scale-[1.02] transition-transform",
        getStatusStyles()
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{habit.title}</h3>
          {habit.description && (
            <p className="text-xs text-muted-foreground truncate">
              {habit.description}
            </p>
          )}
        </div>
        {getStatusIcon()}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Cumplimiento</span>
          <span className="font-medium">{habit.stats.completionRate}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              habit.stats.completionRate >= 80
                ? "bg-green-500"
                : habit.stats.completionRate >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
            style={{ width: `${habit.stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Flame className="w-3 h-3 text-orange-500" />
          <span>
            {habit.stats.currentStreak} día{habit.stats.currentStreak !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Ver más</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Today's Reason if Failed */}
      {habit.todayStatus === "failed" && habit.todayReason && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-red-400">
            <span className="font-medium">Hoy:</span> {habit.todayReason}
          </p>
        </div>
      )}
    </GlassCard>
  )
}
