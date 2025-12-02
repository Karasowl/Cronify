"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { GlobalCalendar, DayHabitsModal, TimerCard } from "@/components/habits"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { OnboardingModal } from "@/components/onboarding-modal"
import { createClient } from "@/lib/supabase/client"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { Loader2, Check, X, Clock, CheckSquare, MoreVertical, Trash2, ChevronRight, Calendar } from "lucide-react"
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
        <div className="space-y-8">
            <Navbar />

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground">{t("noHabits")}</p>
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

            {/* Global Calendar - only show when there are habits */}
            {habits.length > 0 && (
                <GlassCard>
                    <GlobalCalendar
                        habits={habits}
                        logs={logs}
                        onDayClick={handleDayClick}
                        onAddHabit={() => setAddDialogOpen(true)}
                    />
                </GlassCard>
            )}

            {/* Today's Quick Log */}
            {buildHabits.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">{tHabit("todaysHabits")}</h2>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {buildHabits.map((habit) => {
                            const log = todayLogs[habit.id]
                            const habitStart = new Date(habit.start_date || habit.created_at)
                            habitStart.setHours(0, 0, 0, 0)
                            const todayDate = new Date(today)

                            // Don't show if habit hasn't started yet
                            if (todayDate < habitStart) return null

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
                        })}
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
