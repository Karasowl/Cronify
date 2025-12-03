"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { GlobalCalendar, DayHabitsModal, TimerCard, WeekHeatmap } from "@/components/habits"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { OnboardingModal } from "@/components/onboarding-modal"
import { createClient } from "@/lib/supabase/client"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { Loader2, Check, X, Clock, CheckSquare, MoreVertical, Trash2, ChevronRight, Calendar, ChevronDown, Flame, Trophy, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CircularProgress } from "@/components/ui/circular-progress"
import type { Habit, HabitLog, HabitLogStatus } from "@/types"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    const t = useTranslations("Dashboard")
    const tHabit = useTranslations("HabitTracker")
    const tCommon = useTranslations("Common")
    const locale = useLocale()
    const supabase = createClient()
    const router = useRouter()

    const [habits, setHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [completedHabitsOpen, setCompletedHabitsOpen] = useState(false)

    // Day modal state
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [dayModalOpen, setDayModalOpen] = useState(false)

    const today = new Date().toISOString().split("T")[0]

    // Fetch habits and logs
    useEffect(() => {
        async function fetchData() {
            try {
                // Check if user is authenticated
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    // Redirect to login if not authenticated
                    window.location.href = "/login"
                    return
                }

                // Fetch habits
                const { data: habitsData, error: habitsError } = await supabase
                    .from("habits")
                    .select("*")
                    .order("created_at", { ascending: true })

                if (habitsError) throw habitsError
                setHabits(habitsData || [])

                // Fetch logs for the last 90 days
                const startDate = new Date()
                startDate.setDate(startDate.getDate() - 90)

                const { data: logsData, error: logsError } = await supabase
                    .from("habit_logs")
                    .select("*")
                    .gte("date", startDate.toISOString().split("T")[0])

                if (logsError) throw logsError
                setLogs(logsData || [])
            } catch (err: any) {
                toast.error(t("errorLoading") + ": " + err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [supabase])

    // Split habits by type
    const buildHabits = useMemo(
        () => habits.filter((h) => h.habit_type === "build"),
        [habits]
    )
    const breakHabits = useMemo(
        () => habits.filter((h) => h.habit_type === "break"),
        [habits]
    )

    // Get logs by date
    const logsByDate = useMemo(() => {
        const map: Record<string, Record<string, HabitLog>> = {}
        logs.forEach((log) => {
            if (!map[log.date]) {
                map[log.date] = {}
            }
            map[log.date][log.habit_id] = log
        })
        return map
    }, [logs])

    // Today's logs
    const todayLogs = logsByDate[today] || {}

    // Calculate today's stats for hero section
    const todayStats = useMemo(() => {
        const todayDate = new Date(today)
        const activeHabits = buildHabits.filter((habit) => {
            const startDate = new Date(habit.start_date || habit.created_at)
            startDate.setHours(0, 0, 0, 0)
            return todayDate >= startDate
        })

        const completed = activeHabits.filter(
            (h) => todayLogs[h.id]?.status === "completed"
        ).length
        const failed = activeHabits.filter(
            (h) => todayLogs[h.id]?.status === "failed"
        ).length
        const pending = activeHabits.length - completed - failed

        return {
            total: activeHabits.length,
            completed,
            failed,
            pending,
            rate: activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0,
        }
    }, [buildHabits, todayLogs, today])

    // Separate pending and completed habits for today
    const { pendingHabits, completedHabits } = useMemo(() => {
        const todayDate = new Date(today)
        const pending: Habit[] = []
        const completed: Habit[] = []

        buildHabits.forEach((habit) => {
            const startDate = new Date(habit.start_date || habit.created_at)
            startDate.setHours(0, 0, 0, 0)

            // Skip habits that haven't started yet
            if (todayDate < startDate) return

            const log = todayLogs[habit.id]
            if (log?.status === "completed") {
                completed.push(habit)
            } else {
                pending.push(habit)
            }
        })

        return { pendingHabits: pending, completedHabits: completed }
    }, [buildHabits, todayLogs, today])

    // Calculate current streak (consecutive days with all habits completed)
    const currentStreak = useMemo(() => {
        if (buildHabits.length === 0) return 0

        let streak = 0
        const checkDate = new Date()
        checkDate.setHours(0, 0, 0, 0)

        // Don't count today if there are pending habits
        if (todayStats.pending > 0) {
            checkDate.setDate(checkDate.getDate() - 1)
        }

        while (true) {
            const dateKey = checkDate.toISOString().split("T")[0]
            const dayLogs = logsByDate[dateKey] || {}

            // Get habits that were active on this date
            const activeHabits = buildHabits.filter((habit) => {
                const startDate = new Date(habit.start_date || habit.created_at)
                startDate.setHours(0, 0, 0, 0)
                return checkDate >= startDate
            })

            if (activeHabits.length === 0) break

            // Check if all active habits were completed
            const allCompleted = activeHabits.every(
                (h) => dayLogs[h.id]?.status === "completed"
            )

            if (!allCompleted) break

            streak++
            checkDate.setDate(checkDate.getDate() - 1)

            // Safety limit
            if (streak > 365) break
        }

        return streak
    }, [buildHabits, logsByDate, todayStats.pending])

    // Handle day click from calendar
    function handleDayClick(date: string) {
        setSelectedDate(date)
        setDayModalOpen(true)
    }

    // Handle logging a habit
    async function handleLog(
        habitId: string,
        status: HabitLogStatus,
        reason?: string,
        date?: string
    ) {
        const targetDate = date || today

        try {
            const { error } = await supabase.from("habit_logs").upsert(
                {
                    habit_id: habitId,
                    date: targetDate,
                    status,
                    reason: reason || null,
                },
                { onConflict: "habit_id,date" }
            )

            if (error) throw error

            // Update local state
            setLogs((prev) => {
                const filtered = prev.filter(
                    (l) => !(l.habit_id === habitId && l.date === targetDate)
                )
                return [
                    ...filtered,
                    {
                        id: crypto.randomUUID(),
                        habit_id: habitId,
                        date: targetDate,
                        status,
                        reason: reason || null,
                        value: null,
                        notes: null,
                        mood: null,
                        logged_at: new Date().toISOString(),
                        created_at: new Date().toISOString(),
                    },
                ]
            })

            toast.success(status === "completed" ? tHabit("greatJob") : tHabit("logged"))
        } catch (err: any) {
            toast.error("Error: " + err.message)
        }
    }

    // Handle new habit created
    function handleHabitCreated(habit: Habit) {
        setHabits((prev) => [...prev, habit])
    }

    // Navigate to habit detail
    function goToHabitDetail(habitId: string) {
        router.push(`/${locale}/dashboard/habits/${habitId}`)
    }

    // Delete habit
    async function deleteHabit(habitId: string) {
        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from("habits")
                .delete()
                .eq("id", habitId)

            if (error) throw error

            setHabits((prev) => prev.filter((h) => h.id !== habitId))
            toast.success(tHabit("habitDeleted"))
        } catch (err: any) {
            toast.error("Error: " + err.message)
        } finally {
            setIsDeleting(false)
            setDeleteHabitId(null)
        }
    }

    // Render habit card
    function renderHabitCard(habit: Habit, isCompleted: boolean = false) {
        const log = todayLogs[habit.id]

        return (
            <GlassCard
                key={habit.id}
                className={cn(
                    "p-4 transition-all",
                    log?.status === "completed" && "bg-green-500/10 border-green-500/30",
                    log?.status === "failed" && "bg-red-500/10 border-red-500/30"
                )}
            >
                {/* Header with title and menu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                        className="flex-1 min-w-0 cursor-pointer group"
                        onClick={() => goToHabitDetail(habit.id)}
                    >
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {habit.title}
                        </p>
                        {habit.description && (
                            <p className="text-xs text-muted-foreground truncate">
                                {habit.description}
                            </p>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => goToHabitDetail(habit.id)}>
                                <Calendar className="w-4 h-4 mr-2" />
                                {tHabit("viewCalendar")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteHabitId(habit.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {tCommon("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Action buttons */}
                {log ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {log.status === "completed" && (
                                <>
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-green-500">{tHabit("done")}</span>
                                </>
                            )}
                            {log.status === "failed" && (
                                <>
                                    <X className="w-5 h-5 text-red-500" />
                                    <span className="text-sm text-red-500">{tHabit("fail")}</span>
                                </>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-muted-foreground hover:text-primary"
                            onClick={() => goToHabitDetail(habit.id)}
                        >
                            {tHabit("viewDetails")}
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 h-10 text-green-600 hover:bg-green-500/20 active:scale-95"
                                onClick={() => handleLog(habit.id, "completed")}
                            >
                                <Check className="w-4 h-4 mr-1" />
                                {tHabit("done")}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 h-10 text-red-600 hover:bg-red-500/20 active:scale-95"
                                onClick={() => handleLog(habit.id, "failed")}
                            >
                                <X className="w-4 h-4 mr-1" />
                                {tHabit("fail")}
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full gap-1 text-muted-foreground hover:text-primary"
                            onClick={() => goToHabitDetail(habit.id)}
                        >
                            {tHabit("viewDetails")}
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </GlassCard>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Navbar />
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Navbar />

            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-sm text-muted-foreground">{t("subtitle") || t("noHabits")}</p>
                </div>
                {habits.length > 0 && (
                    <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{tCommon("add") || "Nuevo"}</span>
                    </Button>
                )}
            </div>

            {/* Empty state - shown prominently when no habits */}
            {habits.length === 0 && (
                <GlassCard className="text-center py-12">
                    <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">{t("emptyTitle")}</h2>
                    <p className="text-muted-foreground mb-6">
                        {t("emptyDesc")}
                    </p>
                    <Button size="lg" onClick={() => setAddDialogOpen(true)} className="gap-2">
                        <CheckSquare className="w-5 h-5" />
                        {t("createFirst")}
                    </Button>
                </GlassCard>
            )}

            {/* Hero Section - Holistic Vision */}
            {habits.length > 0 && (
                <GlassCard className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Today's Progress Ring */}
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            <CircularProgress
                                value={todayStats.rate}
                                size={100}
                                strokeWidth={10}
                                progressColor={
                                    todayStats.rate === 100
                                        ? "text-green-500"
                                        : todayStats.rate >= 50
                                            ? "text-yellow-500"
                                            : "text-primary"
                                }
                            >
                                <div className="text-center">
                                    <p className="text-2xl font-bold">
                                        {todayStats.completed}/{todayStats.total}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                        {t("today") || "Hoy"}
                                    </p>
                                </div>
                            </CircularProgress>
                            <div className="mt-2 flex gap-2 text-xs">
                                <span className="text-green-500">✓{todayStats.completed}</span>
                                <span className="text-red-500">✗{todayStats.failed}</span>
                                <span className="text-muted-foreground">○{todayStats.pending}</span>
                            </div>
                        </div>

                        {/* Week Heatmap */}
                        <div className="col-span-1 lg:col-span-2 flex flex-col justify-center">
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                {t("thisWeek") || "Esta semana"}
                            </p>
                            <WeekHeatmap
                                habits={buildHabits}
                                logs={logs}
                                onDayClick={handleDayClick}
                            />
                        </div>

                        {/* Current Streak */}
                        <div className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center">
                            <Flame className={cn(
                                "w-10 h-10 mb-1",
                                currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
                            )} />
                            <p className="text-3xl font-bold">{currentStreak}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {t("streak") || "Racha"}
                            </p>
                            {todayStats.rate === 100 && todayStats.total > 0 && (
                                <div className="mt-2 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs">
                                    <Trophy className="w-3 h-3" />
                                    <span>{t("perfectDay") || "Día perfecto"}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Today's Habits - Pending First */}
            {buildHabits.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold">{tHabit("todaysHabits")}</h2>
                            <span className="text-sm text-muted-foreground">
                                ({todayStats.completed}/{todayStats.total})
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Pending Habits */}
                        {pendingHabits.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                    {t("pending") || "Pendientes"} ({pendingHabits.length})
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {pendingHabits.map((habit) => renderHabitCard(habit))}
                                </div>
                            </div>
                        )}

                        {/* Completed Habits - Collapsible */}
                        {completedHabits.length > 0 && (
                            <Collapsible open={completedHabitsOpen} onOpenChange={setCompletedHabitsOpen}>
                                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
                                    <ChevronRight className={cn(
                                        "w-4 h-4 transition-transform",
                                        completedHabitsOpen && "rotate-90"
                                    )} />
                                    <span>{t("completed") || "Completados"} ({completedHabits.length})</span>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
                                        {completedHabits.map((habit) => renderHabitCard(habit, true))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        )}

                        {/* All done message */}
                        {pendingHabits.length === 0 && todayStats.total > 0 && (
                            <GlassCard className="text-center py-8 bg-green-500/5 border-green-500/20">
                                <Trophy className="w-10 h-10 mx-auto text-green-500 mb-2" />
                                <p className="font-semibold text-green-500">
                                    {t("allDone") || "¡Todos los hábitos completados!"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t("greatWork") || "Excelente trabajo hoy"}
                                </p>
                            </GlassCard>
                        )}
                    </div>
                </div>
            )}

            {/* Break Habits (Timers) */}
            {breakHabits.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-semibold">{tHabit("breakHabits")}</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {breakHabits.map((habit) => (
                            <TimerCard
                                key={habit.id}
                                habit={habit}
                                locale={locale}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Calendar - Collapsible at the bottom */}
            {habits.length > 0 && (
                <Collapsible open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <GlassCard className="p-4">
                        <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <h2 className="text-lg font-semibold">
                                        {t("monthlyCalendar") || "Calendario mensual"}
                                    </h2>
                                </div>
                                <ChevronDown className={cn(
                                    "w-5 h-5 text-muted-foreground transition-transform",
                                    calendarOpen && "rotate-180"
                                )} />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="pt-4">
                                <GlobalCalendar
                                    habits={habits}
                                    logs={logs}
                                    onDayClick={handleDayClick}
                                    onAddHabit={() => setAddDialogOpen(true)}
                                />
                            </div>
                        </CollapsibleContent>
                    </GlassCard>
                </Collapsible>
            )}

            {/* Day Modal */}
            {selectedDate && (
                <DayHabitsModal
                    open={dayModalOpen}
                    onOpenChange={setDayModalOpen}
                    date={selectedDate}
                    habits={habits}
                    logs={logsByDate[selectedDate] || {}}
                    onLog={(habitId, status, reason) =>
                        handleLog(habitId, status, reason, selectedDate)
                    }
                />
            )}

            {/* Add Habit Dialog */}
            <AddHabitDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onHabitCreated={handleHabitCreated}
            />

            {/* Onboarding Modal - shows on first visit */}
            <OnboardingModal />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteHabitId} onOpenChange={(open) => !open && setDeleteHabitId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{tHabit("deleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {tHabit("deleteConfirmDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            {tCommon("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteHabitId && deleteHabit(deleteHabitId)}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {tCommon("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
