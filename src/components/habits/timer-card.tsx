"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
import { useTimer, formatGoalSeconds } from "@/hooks"
import { StopCircle, Trophy, Target, Flame, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Habit } from "@/types"

interface TimerCardProps {
  habit: Habit
  locale: string
  onReset?: () => void
}

export function TimerCard({ habit, locale, onReset }: TimerCardProps) {
  const router = useRouter()
  const [showResetDialog, setShowResetDialog] = useState(false)

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
    await reset()
    setShowResetDialog(false)
    onReset?.()
  }

  const handleCardClick = () => {
    router.push(`/${locale}/dashboard/habits/${habit.id}`)
  }

  return (
    <GlassCard
      className={cn(
        "relative overflow-hidden transition-all",
        isNewRecord && "ring-2 ring-yellow-500/50"
      )}
    >
      {/* New Record Badge */}
      {isNewRecord && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs font-medium rounded-full">
          <Trophy className="w-3 h-3" />
          Nuevo récord
        </div>
      )}

      {/* Header */}
      <div
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        <h3 className="font-semibold text-lg pr-20">{habit.title}</h3>
        {habit.description && (
          <p className="text-sm text-muted-foreground truncate">
            {habit.description}
          </p>
        )}
      </div>

      {/* Timer Display */}
      <div
        className="flex items-center justify-center py-6 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative">
          {/* Circular Progress Background */}
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(
                from 0deg,
                hsl(var(--primary)) ${progress * 3.6}deg,
                hsl(var(--muted)) ${progress * 3.6}deg
              )`,
            }}
          >
            {/* Inner circle */}
            <div className="w-28 h-28 rounded-full bg-background flex flex-col items-center justify-center">
              {/* Time display */}
              <div className="text-center">
                {duration.days > 0 && (
                  <div className="text-2xl font-bold text-primary">
                    {duration.days}
                    <span className="text-sm text-muted-foreground ml-1">días</span>
                  </div>
                )}
                <div className="text-xl font-mono font-semibold">
                  {String(duration.hours).padStart(2, "0")}:
                  {String(duration.minutes).padStart(2, "0")}:
                  {String(duration.seconds).padStart(2, "0")}
                </div>
                {duration.months > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {duration.years > 0 && `${duration.years}a `}
                    {duration.months}m
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Animated glow for active timer */}
          <div className="absolute inset-0 rounded-full animate-pulse opacity-30 bg-primary/20 -z-10 blur-md" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-orange-500">
            <Flame className="w-4 h-4" />
            <span className="font-semibold">{formattedTime}</span>
          </div>
          <p className="text-xs text-muted-foreground">Tiempo actual</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-yellow-500">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold">{formattedMaxStreak || "0s"}</span>
          </div>
          <p className="text-xs text-muted-foreground">Récord</p>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Target className="w-3 h-3" />
            Meta: {formatGoalSeconds(habit.current_goal_seconds)}
          </div>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <StopCircle className="w-4 h-4" />
              )}
              Recaída
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
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirmar recaída
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
          onClick={handleCardClick}
        >
          Ver detalles
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </GlassCard>
  )
}
