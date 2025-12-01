"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Loader2, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { HabitCalendar, HabitLogModal, EncouragementList, StreakAchievements } from "@/components/habits"
import { useHabitLogs, calculateHabitStats } from "@/hooks"
import { toast } from "sonner"
import type { Habit, HabitLog, HabitLogStatus, Encouragement } from "@/types"
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
