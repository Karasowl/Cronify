"use client"

import { useTranslations } from "next-intl"
import { GlassCard } from "@/components/ui/glass-card"
import {
    Flame,
    Trophy,
    Star,
    Footprints,
    Users,
    Crown,
    Shield,
    Layers,
    Lock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BadgesProps {
    currentStreak: number
    bestStreak: number
    totalHabits: number
    totalPartners: number
    hasBreakHabitStreak7: boolean
    hasPerfectWeek: boolean
}

interface Badge {
    id: string
    icon: React.ReactNode
    unlocked: boolean
    color: string
}

export function Badges({
    currentStreak,
    bestStreak,
    totalHabits,
    totalPartners,
    hasBreakHabitStreak7,
    hasPerfectWeek,
}: BadgesProps) {
    const t = useTranslations("Badges")

    const maxStreak = Math.max(currentStreak, bestStreak)

    const badges: Badge[] = [
        {
            id: "firstHabit",
            icon: <Footprints className="w-6 h-6" />,
            unlocked: totalHabits >= 1,
            color: "text-green-500",
        },
        {
            id: "streak7",
            icon: <Flame className="w-6 h-6" />,
            unlocked: maxStreak >= 7,
            color: "text-orange-500",
        },
        {
            id: "firstPartner",
            icon: <Users className="w-6 h-6" />,
            unlocked: totalPartners >= 1,
            color: "text-blue-500",
        },
        {
            id: "perfectWeek",
            icon: <Star className="w-6 h-6" />,
            unlocked: hasPerfectWeek,
            color: "text-yellow-500",
        },
        {
            id: "streak30",
            icon: <Trophy className="w-6 h-6" />,
            unlocked: maxStreak >= 30,
            color: "text-purple-500",
        },
        {
            id: "breakHabitWeek",
            icon: <Shield className="w-6 h-6" />,
            unlocked: hasBreakHabitStreak7,
            color: "text-cyan-500",
        },
        {
            id: "tenHabits",
            icon: <Layers className="w-6 h-6" />,
            unlocked: totalHabits >= 10,
            color: "text-pink-500",
        },
        {
            id: "streak100",
            icon: <Crown className="w-6 h-6" />,
            unlocked: maxStreak >= 100,
            color: "text-amber-500",
        },
    ]

    const unlockedCount = badges.filter((b) => b.unlocked).length

    return (
        <GlassCard>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-semibold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {t("title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {unlockedCount}/{badges.length}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={cn(
                            "relative flex flex-col items-center p-3 rounded-lg transition-all",
                            badge.unlocked
                                ? "bg-white/5"
                                : "bg-black/20 opacity-50"
                        )}
                        title={badge.unlocked ? t("unlocked") : t("locked")}
                    >
                        <div
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                                badge.unlocked
                                    ? `bg-${badge.color.replace("text-", "")}/20 ${badge.color}`
                                    : "bg-gray-500/20 text-gray-500"
                            )}
                            style={badge.unlocked ? {
                                backgroundColor: `color-mix(in srgb, currentColor 20%, transparent)`,
                            } : undefined}
                        >
                            {badge.unlocked ? (
                                badge.icon
                            ) : (
                                <Lock className="w-5 h-5" />
                            )}
                        </div>
                        <span className={cn(
                            "text-xs text-center font-medium leading-tight",
                            !badge.unlocked && "text-muted-foreground"
                        )}>
                            {t(`${badge.id}.name`)}
                        </span>
                        {!badge.unlocked && (
                            <span className="text-[10px] text-muted-foreground text-center mt-1 leading-tight">
                                {t(`${badge.id}.desc`)}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </GlassCard>
    )
}
