"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, CheckSquare, Timer, Target } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useRouter } from "@/i18n/routing"
import { GOAL_PRESETS } from "@/hooks"
import { cn } from "@/lib/utils"
import type { Habit, HabitType } from "@/types"

interface AddHabitDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onHabitAdded?: () => void
    onHabitCreated?: (habit: Habit) => void
}

export function AddHabitDialog({
    open: controlledOpen,
    onOpenChange,
    onHabitAdded,
    onHabitCreated
}: AddHabitDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    // Support both controlled and uncontrolled mode
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = (value: boolean) => {
        if (isControlled) {
            onOpenChange?.(value)
        } else {
            setInternalOpen(value)
        }
    }
    const [isLoading, setIsLoading] = useState(false)
    const [habitType, setHabitType] = useState<HabitType>("build")
    const [goalSeconds, setGoalSeconds] = useState(86400) // 1 día default
    const supabase = createClient()
    const router = useRouter()
    const t = useTranslations('HabitTracker')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const title = formData.get("title") as string
        const description = formData.get("description") as string

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error("Tu sesión ha expirado. Redirigiendo al login...")
                setOpen(false)
                router.push("/login")
                return
            }

            const now = new Date().toISOString()

            const habitData: Record<string, unknown> = {
                user_id: user.id,
                title,
                description,
                habit_type: habitType,
                frequency: { type: "daily" },
                start_date: now,
                last_reset: now,
                current_goal_seconds: habitType === "break" ? goalSeconds : 86400,
                max_streak_seconds: 0,
            }

            const { data, error } = await supabase.from("habits").insert(habitData).select().single()

            if (error) throw error

            toast.success(t('success'))
            setOpen(false)
            setHabitType("build")
            setGoalSeconds(86400)
            onHabitAdded?.()
            if (data) onHabitCreated?.(data as Habit)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" /> {t('addHabitButton')}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] glass border-white/10 w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('createTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('createDesc')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Habit Type Selector */}
                        <div className="grid gap-2">
                            <Label>{t('habitType') || "Tipo de hábito"}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setHabitType("build")}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                                        habitType === "build"
                                            ? "border-green-500 bg-green-500/10"
                                            : "border-white/10 bg-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <CheckSquare className={cn(
                                        "w-6 h-6",
                                        habitType === "build" ? "text-green-500" : "text-muted-foreground"
                                    )} />
                                    <div className="text-center">
                                        <p className="font-medium text-sm">
                                            {t('buildType') || "Construir"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('buildTypeDesc') || "Crear un nuevo hábito"}
                                        </p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHabitType("break")}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                                        habitType === "break"
                                            ? "border-orange-500 bg-orange-500/10"
                                            : "border-white/10 bg-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <Timer className={cn(
                                        "w-6 h-6",
                                        habitType === "break" ? "text-orange-500" : "text-muted-foreground"
                                    )} />
                                    <div className="text-center">
                                        <p className="font-medium text-sm">
                                            {t('breakType') || "Romper"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('breakTypeDesc') || "Dejar de hacer algo"}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">{t('habitTitleLabel')}</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder={
                                    habitType === "break"
                                        ? (t('breakTitlePlaceholder') || "Ej: Dejar de fumar, No redes sociales...")
                                        : t('habitTitlePlaceholder')
                                }
                                className="col-span-3 bg-white/5 border-white/10"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">{t('habitDescLabel')}</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder={t('habitDescPlaceholder')}
                                className="col-span-3 bg-white/5 border-white/10"
                            />
                        </div>

                        {/* Goal selector for break habits */}
                        {habitType === "break" && (
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    {t('goalLabel') || "Meta inicial"}
                                </Label>
                                <Select
                                    value={goalSeconds.toString()}
                                    onValueChange={(val) => setGoalSeconds(parseInt(val))}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Selecciona una meta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GOAL_PRESETS.map((preset) => (
                                            <SelectItem
                                                key={preset.seconds}
                                                value={preset.seconds.toString()}
                                            >
                                                {preset.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {t('goalHint') || "El cronómetro mostrará tu progreso hacia esta meta"}
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? t('creating') : t('createButton')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
