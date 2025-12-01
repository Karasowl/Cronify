"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Loader2, Sparkles, Trophy, Target, Clock, StopCircle, Settings2, History, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { HabitCalendar, HabitLogModal, EncouragementList, StreakAchievements } from "@/components/habits"
import { useHabitLogs, calculateHabitStats, useTimer, formatGoalSeconds, GOAL_PRESETS } from "@/hooks"
import { toast } from "sonner"
import type { Habit, HabitLog, HabitLogStatus, Encouragement, Relapse } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default function HabitDetailPage({ params }: PageProps) {
  const { id, locale } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [habit, setHabit] = useState<Habit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [encouragements, setEncouragements] = useState<Encouragement[]>([])

  // Log modal state
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedLog, setSelectedLog] = useState<HabitLog | undefined>()

  // Fetch habit and encouragements
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch habit
        const { data: habitData, error: habitError } = await supabase
          .from("habits")
          .select("*")
          .eq("id", id)
          .single()

        if (habitError) throw habitError
        setHabit(habitData)

        // Fetch encouragements
        const { data: encData } = await supabase
          .from("encouragements")
          .select("*")
          .eq("habit_id", id)
          .order("created_at", { ascending: false })
          .limit(10)

        setEncouragements(encData || [])
      } catch (err: any) {
        toast.error("Error cargando hábito: " + err.message)
        router.push(`/${locale}/dashboard`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, locale, router])

  // Fetch logs using hook
  const {
    logs,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useHabitLogs(id)

  const handleDayClick = (date: string, log?: HabitLog) => {
    setSelectedDate(date)
    setSelectedLog(log)
    setLogModalOpen(true)
  }

  const handleLogSubmit = async (status: HabitLogStatus, reason?: string) => {
    try {
      const { error } = await supabase.from("habit_logs").upsert({
        habit_id: id,
        date: selectedDate,
        status,
        reason: reason || null,
      })

      if (error) throw error

      toast.success(
        status === "completed"
          ? "¡Excelente! Hábito completado"
          : status === "failed"
          ? "Registrado. ¡Mañana lo logras!"
          : "Día saltado registrado"
      )

      refetchLogs()
    } catch (err: any) {
      toast.error("Error registrando: " + err.message)
      throw err
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("habits").delete().eq("id", id)

      if (error) throw error

      toast.success("Hábito eliminado")
      router.push(`/${locale}/dashboard`)
    } catch (err: any) {
      toast.error("Error eliminando: " + err.message)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Hábito no encontrado</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/${locale}/dashboard`)}
        >
          Volver al dashboard
        </Button>
      </div>
    )
  }

  const stats = calculateHabitStats(logs, habit.start_date || habit.created_at)

  // For break habits - render timer view
  if (habit.habit_type === "break") {
    return (
      <BreakHabitDetail
        habit={habit}
        locale={locale}
        encouragements={encouragements}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        onHabitUpdate={(updated) => setHabit(updated)}
      />
    )
  }

  // For build habits - render calendar view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${locale}/dashboard`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{habit.title}</h1>
            {habit.description && (
              <p className="text-muted-foreground">{habit.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar hábito?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminarán todos los
                  registros asociados a este hábito.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <p className="text-3xl font-bold text-green-500">{stats.completedDays}</p>
          <p className="text-sm text-muted-foreground">Días completados</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-bold text-red-500">{stats.failedDays}</p>
          <p className="text-sm text-muted-foreground">Días fallados</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-bold text-primary">{stats.completionRate}%</p>
          <p className="text-sm text-muted-foreground">Cumplimiento</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-bold text-orange-500">
            {stats.currentStreak}
            {stats.currentStreak >= 3 && " 🔥"}
          </p>
          <p className="text-sm text-muted-foreground">Racha actual</p>
          {stats.bestStreak > stats.currentStreak && (
            <p className="text-xs text-muted-foreground mt-1">
              Mejor: {stats.bestStreak} días
            </p>
          )}
        </GlassCard>
      </div>

      {/* Streak Achievements */}
      {(stats.currentStreak >= 3 || stats.bestStreak >= 3) && (
        <GlassCard>
          <StreakAchievements
            currentStreak={stats.currentStreak}
            bestStreak={stats.bestStreak}
          />
        </GlassCard>
      )}

      {/* Calendar */}
      <GlassCard>
        {logsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <HabitCalendar
            logs={logs}
            startDate={habit.start_date || habit.created_at}
            onDayClick={handleDayClick}
            showStats={false}
          />
        )}
      </GlassCard>

      {/* Encouragements from Partners */}
      {encouragements.length > 0 && (
        <GlassCard className="border-l-4 border-l-pink-500">
          <EncouragementList encouragements={encouragements} />
        </GlassCard>
      )}

      {/* Recent Fails with Reasons */}
      {logs.filter((l) => l.status === "failed" && l.reason).length > 0 && (
        <GlassCard>
          <h3 className="font-semibold mb-4">Últimos fallos registrados</h3>
          <div className="space-y-3">
            {logs
              .filter((l) => l.status === "failed" && l.reason)
              .slice(0, 5)
              .map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {new Date(log.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{log.reason}</p>
                  </div>
                </div>
              ))}
          </div>
        </GlassCard>
      )}

      {/* Log Modal */}
      <HabitLogModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        habitTitle={habit.title}
        date={selectedDate}
        currentStatus={selectedLog?.status}
        currentReason={selectedLog?.reason || undefined}
        onSubmit={handleLogSubmit}
      />
    </div>
  )
}

// ============================================================
// Break Habit Detail Component (Timer View)
// ============================================================

interface BreakHabitDetailProps {
  habit: Habit
  locale: string
  encouragements: Encouragement[]
  onDelete: () => void
  isDeleting: boolean
  onHabitUpdate: (habit: Habit) => void
}

function BreakHabitDetail({
  habit,
  locale,
  encouragements,
  onDelete,
  isDeleting,
  onHabitUpdate,
}: BreakHabitDetailProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [newGoal, setNewGoal] = useState(habit.current_goal_seconds.toString())
  const [relapseReason, setRelapseReason] = useState("")
  const [relapses, setRelapses] = useState<Relapse[]>([])
  const [loadingRelapses, setLoadingRelapses] = useState(true)

  // Fetch relapses
  useEffect(() => {
    async function fetchRelapses() {
      const { data, error } = await supabase
        .from("relapses")
        .select("*")
        .eq("habit_id", habit.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (!error && data) {
        setRelapses(data)
      }
      setLoadingRelapses(false)
    }
    fetchRelapses()
  }, [habit.id, supabase])

  const {
    duration,
    progress,
    isNewRecord,
    formattedTime,
    formattedMaxStreak,
    reset,
    isResetting,
  } = useTimer({
    habitId: habit.id,
    lastReset: habit.last_reset,
    maxStreakSeconds: habit.max_streak_seconds,
    currentGoalSeconds: habit.current_goal_seconds,
  })

  const handleReset = async () => {
    await reset(relapseReason || undefined)
    setShowResetDialog(false)
    setRelapseReason("")

    // Refresh habit data
    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("id", habit.id)
      .single()
    if (data) onHabitUpdate(data)

    // Refresh relapses
    const { data: relapsesData } = await supabase
      .from("relapses")
      .select("*")
      .eq("habit_id", habit.id)
      .order("created_at", { ascending: false })
      .limit(10)
    if (relapsesData) setRelapses(relapsesData)
  }

  const handleGoalChange = async () => {
    const goalSeconds = parseInt(newGoal)
    const { error } = await supabase
      .from("habits")
      .update({ current_goal_seconds: goalSeconds })
      .eq("id", habit.id)

    if (error) {
      toast.error("Error actualizando meta")
      return
    }

    toast.success("Meta actualizada")
    setShowGoalDialog(false)
    onHabitUpdate({ ...habit, current_goal_seconds: goalSeconds })
  }

  // Calculate days since start
  const daysSinceStart = Math.floor(
    (Date.now() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${locale}/dashboard`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{habit.title}</h1>
            {habit.description && (
              <p className="text-muted-foreground">{habit.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar hábito?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminarán todos los
                  registros asociados a este hábito.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Big Timer */}
      <GlassCard className="relative overflow-hidden">
        {isNewRecord && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm font-medium rounded-full animate-pulse">
            <Trophy className="w-4 h-4" />
            ¡Nuevo récord!
          </div>
        )}

        <div className="flex flex-col items-center py-8">
          {/* Circular Timer */}
          <div className="relative mb-6">
            <div
              className="w-48 h-48 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(
                  from 0deg,
                  hsl(var(--primary)) ${progress * 3.6}deg,
                  hsl(var(--muted)) ${progress * 3.6}deg
                )`,
              }}
            >
              <div className="w-44 h-44 rounded-full bg-background flex flex-col items-center justify-center">
                {duration.years > 0 && (
                  <div className="text-lg text-muted-foreground">
                    {duration.years} año{duration.years !== 1 ? "s" : ""}
                  </div>
                )}
                {duration.months > 0 && (
                  <div className="text-lg text-muted-foreground">
                    {duration.months} mes{duration.months !== 1 ? "es" : ""}
                  </div>
                )}
                {duration.days > 0 && (
                  <div className="text-3xl font-bold text-primary">
                    {duration.days}
                    <span className="text-lg text-muted-foreground ml-1">
                      día{duration.days !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <div className="text-2xl font-mono font-semibold">
                  {String(duration.hours).padStart(2, "0")}:
                  {String(duration.minutes).padStart(2, "0")}:
                  {String(duration.seconds).padStart(2, "0")}
                </div>
              </div>
            </div>
            {/* Animated glow */}
            <div className="absolute inset-0 rounded-full animate-pulse opacity-20 bg-primary/30 -z-10 blur-xl" />
          </div>

          <p className="text-muted-foreground mb-2">Tiempo actual sin {habit.title.toLowerCase()}</p>

          {/* Goal Progress */}
          <div className="w-full max-w-md px-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Target className="w-4 h-4" />
                Meta: {formatGoalSeconds(habit.current_goal_seconds)}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <div className="flex items-center justify-center gap-2 text-orange-500 mb-1">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{formattedTime}</p>
          <p className="text-sm text-muted-foreground">Racha actual</p>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-500 mb-1">
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{formattedMaxStreak || "0s"}</p>
          <p className="text-sm text-muted-foreground">Mejor racha</p>
        </GlassCard>

        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-primary">{daysSinceStart}</p>
          <p className="text-sm text-muted-foreground">Días en el programa</p>
        </GlassCard>

        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-green-500">
            {progress >= 100 ? "✓" : `${Math.round(progress)}%`}
          </p>
          <p className="text-sm text-muted-foreground">Progreso a meta</p>
        </GlassCard>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Reset Button */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              className="flex-1 gap-2"
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <StopCircle className="w-5 h-5" />
              )}
              Registrar recaída
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registrar recaída</AlertDialogTitle>
              <AlertDialogDescription>
                Esto reiniciará tu contador a cero. Tu tiempo actual de{" "}
                <span className="font-semibold text-foreground">{formattedTime}</span>{" "}
                {duration.totalSeconds > habit.max_streak_seconds ? (
                  <span className="text-yellow-500">
                    se guardará como nuevo récord.
                  </span>
                ) : (
                  <span>será registrado.</span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <Textarea
                placeholder="¿Qué pasó? (opcional)"
                value={relapseReason}
                onChange={(e) => setRelapseReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Registrar la razón te ayuda a identificar patrones y mejorar.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRelapseReason("")}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirmar recaída
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Change Goal Button */}
        <AlertDialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="lg" className="flex-1 gap-2">
              <Settings2 className="w-5 h-5" />
              Cambiar meta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cambiar meta</AlertDialogTitle>
              <AlertDialogDescription>
                Selecciona una nueva meta para tu cronómetro.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Select value={newGoal} onValueChange={setNewGoal}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOAL_PRESETS.map((preset) => (
                  <SelectItem key={preset.seconds} value={preset.seconds.toString()}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleGoalChange}>
                Guardar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Encouragements from Partners */}
      {encouragements.length > 0 && (
        <GlassCard className="border-l-4 border-l-pink-500">
          <EncouragementList encouragements={encouragements} />
        </GlassCard>
      )}

      {/* Info */}
      <GlassCard className="bg-muted/30">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Consejo</h4>
            <p className="text-sm text-muted-foreground">
              Cada vez que sientas la tentación, recuerda cuánto tiempo has logrado.
              No pierdas tu progreso. Si recaes, registra la recaída para empezar de nuevo.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Relapse History */}
      {!loadingRelapses && relapses.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Historial de recaídas</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {relapses.length}
            </span>
          </div>
          <div className="space-y-3">
            {relapses.map((relapse) => {
              const relapseDate = new Date(relapse.created_at)
              const durationHours = Math.floor(relapse.duration_seconds / 3600)
              const durationDays = Math.floor(durationHours / 24)
              const remainingHours = durationHours % 24

              let durationText = ""
              if (durationDays > 0) {
                durationText = `${durationDays}d ${remainingHours}h`
              } else if (durationHours > 0) {
                durationText = `${durationHours}h`
              } else {
                const durationMinutes = Math.floor(relapse.duration_seconds / 60)
                durationText = `${durationMinutes}m`
              }

              return (
                <div
                  key={relapse.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {relapseDate.toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: relapseDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                        })}
                        {" "}
                        <span className="text-muted-foreground">
                          {relapseDate.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                        Racha: {durationText}
                      </span>
                    </div>
                    {relapse.reason && (
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {relapse.reason}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {relapses.length >= 10 && (
            <p className="text-xs text-center text-muted-foreground mt-4">
              Mostrando las últimas 10 recaídas
            </p>
          )}
        </GlassCard>
      )}
    </div>
  )
}
