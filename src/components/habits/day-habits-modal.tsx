"use client"

import { useState } from "react"
import { Check, X, Minus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/glass-card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { Habit, HabitLog, HabitLogStatus } from "@/types"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface DayHabitsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    date: string
    habits: Habit[]
    logs: Record<string, HabitLog>
    onLog: (habitId: string, status: HabitLogStatus, reason?: string) => Promise<void>
}

export function DayHabitsModal({
    open,
    onOpenChange,
    date,
    habits,
    logs,
    onLog,
}: DayHabitsModalProps) {
    const t = useTranslations("Calendar")
    const [loadingHabit, setLoadingHabit] = useState<string | null>(null)
    const [reasons, setReasons] = useState<Record<string, string>>({})
    const [showReasonFor, setShowReasonFor] = useState<string | null>(null)

    const formattedDate = new Date(date).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    // Filter only build habits for this date
    const buildHabits = habits.filter((h) => {
        if (h.habit_type !== "build") return false
        const habitStart = new Date(h.start_date || h.created_at)
        habitStart.setHours(0, 0, 0, 0)
        const targetDate = new Date(date)
        return targetDate >= habitStart
    })

    async function handleLog(habitId: string, status: HabitLogStatus) {
        if (status === "failed" && !reasons[habitId]) {
            // Show reason input for failed
            setShowReasonFor(habitId)
            return
        }

        setLoadingHabit(habitId)
        try {
            await onLog(habitId, status, reasons[habitId] || undefined)
            setReasons((prev) => ({ ...prev, [habitId]: "" }))
            setShowReasonFor(null)
        } finally {
            setLoadingHabit(null)
        }
    }

    async function confirmFailed(habitId: string) {
        setLoadingHabit(habitId)
        try {
            await onLog(habitId, "failed", reasons[habitId] || undefined)
            setReasons((prev) => ({ ...prev, [habitId]: "" }))
            setShowReasonFor(null)
        } finally {
            setLoadingHabit(null)
        }
    }

    function getStatusStyles(status?: HabitLogStatus) {
        switch (status) {
            case "completed":
                return "bg-green-500/20 border-green-500/50"
            case "failed":
                return "bg-red-500/20 border-red-500/50"
            case "skipped":
                return "bg-yellow-500/20 border-yellow-500/50"
            default:
                return "bg-muted/30 border-border/50"
        }
    }

    // Calculate summary
    const completed = buildHabits.filter((h) => logs[h.id]?.status === "completed").length
    const failed = buildHabits.filter((h) => logs[h.id]?.status === "failed").length
    const pending = buildHabits.filter((h) => !logs[h.id]).length

    // Quick actions for all habits
    async function markAllAs(status: HabitLogStatus) {
        for (const habit of buildHabits) {
            if (!logs[habit.id]) {
                setLoadingHabit(habit.id)
                await onLog(habit.id, status)
            }
        }
        setLoadingHabit(null)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                    <DialogTitle className="capitalize">{formattedDate}</DialogTitle>
                    <DialogDescription>
                        {buildHabits.length === 0
                            ? t("noHabitsForDay")
                            : `${buildHabits.length} hábitos • ${completed} completados, ${failed} fallados, ${pending} pendientes`}
                    </DialogDescription>
                </DialogHeader>

                {buildHabits.length > 0 && (
                    <>
                        {/* Quick actions */}
                        {pending > 0 && (
                            <div className="flex gap-2 mb-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2 text-green-600 h-11 sm:h-9 active:scale-[0.98]"
                                    onClick={() => markAllAs("completed")}
                                    disabled={loadingHabit !== null}
                                >
                                    <Check className="w-4 h-4" />
                                    {t("allCompleted")}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2 text-red-600 h-11 sm:h-9 active:scale-[0.98]"
                                    onClick={() => markAllAs("failed")}
                                    disabled={loadingHabit !== null}
                                >
                                    <X className="w-4 h-4" />
                                    {t("allFailed")}
                                </Button>
                            </div>
                        )}

                        {/* Habits list */}
                        <div className="space-y-3">
                            {buildHabits.map((habit) => {
                                const log = logs[habit.id]
                                const isLoading = loadingHabit === habit.id
                                const showingReason = showReasonFor === habit.id

                                return (
                                    <GlassCard
                                        key={habit.id}
                                        className={cn(
                                            "p-3 transition-all",
                                            getStatusStyles(log?.status)
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{habit.title}</p>
                                                {habit.description && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {habit.description}
                                                    </p>
                                                )}
                                                {log?.status === "failed" && log.reason && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        Razón: {log.reason}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status indicator or buttons */}
                                            <div className="flex items-center gap-1">
                                                {isLoading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : log ? (
                                                    <div className="flex items-center gap-1">
                                                        {log.status === "completed" && (
                                                            <Check className="w-5 h-5 text-green-500" />
                                                        )}
                                                        {log.status === "failed" && (
                                                            <X className="w-5 h-5 text-red-500" />
                                                        )}
                                                        {log.status === "skipped" && (
                                                            <Minus className="w-5 h-5 text-yellow-500" />
                                                        )}
                                                        {/* Allow re-editing */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs h-6 px-2"
                                                            onClick={() => {
                                                                setShowReasonFor(null)
                                                            }}
                                                        >
                                                            Cambiar
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-1.5">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-10 w-10 sm:h-8 sm:w-8 text-green-600 hover:bg-green-500/20 active:scale-95"
                                                            onClick={() => handleLog(habit.id, "completed")}
                                                        >
                                                            <Check className="w-5 h-5 sm:w-4 sm:h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-10 w-10 sm:h-8 sm:w-8 text-red-600 hover:bg-red-500/20 active:scale-95"
                                                            onClick={() => handleLog(habit.id, "failed")}
                                                        >
                                                            <X className="w-5 h-5 sm:w-4 sm:h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-10 w-10 sm:h-8 sm:w-8 text-yellow-600 hover:bg-yellow-500/20 active:scale-95"
                                                            onClick={() => handleLog(habit.id, "skipped")}
                                                        >
                                                            <Minus className="w-5 h-5 sm:w-4 sm:h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reason input for failed */}
                                        {showingReason && (
                                            <div className="mt-3 space-y-2">
                                                <Textarea
                                                    placeholder="¿Qué pasó? (opcional)"
                                                    value={reasons[habit.id] || ""}
                                                    onChange={(e) =>
                                                        setReasons((prev) => ({
                                                            ...prev,
                                                            [habit.id]: e.target.value,
                                                        }))
                                                    }
                                                    className="resize-none text-sm"
                                                    rows={2}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => confirmFailed(habit.id)}
                                                        disabled={isLoading}
                                                    >
                                                        Confirmar fallo
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setShowReasonFor(null)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </GlassCard>
                                )
                            })}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
