"use client"

import { cn } from "@/lib/utils"
import { Flame, Star, Trophy, Zap, Crown, Rocket } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StreakBadgeProps {
  streak: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

interface Badge {
  minStreak: number
  icon: React.ReactNode
  label: string
  color: string
  bgColor: string
}

const BADGES: Badge[] = [
  {
    minStreak: 100,
    icon: <Crown className="w-full h-full" />,
    label: "Leyenda",
    color: "text-yellow-400",
    bgColor: "bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-500/50",
  },
  {
    minStreak: 50,
    icon: <Trophy className="w-full h-full" />,
    label: "Campeón",
    color: "text-purple-400",
    bgColor: "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-500/50",
  },
  {
    minStreak: 30,
    icon: <Rocket className="w-full h-full" />,
    label: "Imparable",
    color: "text-blue-400",
    bgColor: "bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-500/50",
  },
  {
    minStreak: 14,
    icon: <Star className="w-full h-full" />,
    label: "Estrella",
    color: "text-green-400",
    bgColor: "bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-500/50",
  },
  {
    minStreak: 7,
    icon: <Zap className="w-full h-full" />,
    label: "En racha",
    color: "text-orange-400",
    bgColor: "bg-gradient-to-br from-orange-500/30 to-red-500/30 border-orange-500/50",
  },
  {
    minStreak: 3,
    icon: <Flame className="w-full h-full" />,
    label: "Encendido",
    color: "text-red-400",
    bgColor: "bg-gradient-to-br from-red-500/30 to-orange-500/30 border-red-500/50",
  },
]

export function StreakBadge({ streak, size = "md", showLabel = false }: StreakBadgeProps) {
  if (streak < 3) return null

  const badge = BADGES.find((b) => streak >= b.minStreak)
  if (!badge) return null

  const sizeClasses = {
    sm: "w-6 h-6 p-1",
    md: "w-10 h-10 p-2",
    lg: "w-14 h-14 p-3",
  }

  const labelSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", showLabel && "flex-col")}>
            <div
              className={cn(
                "rounded-full border-2 flex items-center justify-center",
                sizeClasses[size],
                badge.bgColor,
                badge.color
              )}
            >
              {badge.icon}
            </div>
            {showLabel && (
              <span className={cn("font-medium", labelSizeClasses[size], badge.color)}>
                {badge.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{badge.label}</p>
          <p className="text-xs text-muted-foreground">
            {streak} días de racha
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Component showing all unlocked badges
interface StreakAchievementsProps {
  currentStreak: number
  bestStreak: number
}

export function StreakAchievements({ currentStreak, bestStreak }: StreakAchievementsProps) {
  const maxStreak = Math.max(currentStreak, bestStreak)

  // Get all unlocked badges
  const unlockedBadges = BADGES.filter((b) => maxStreak >= b.minStreak)
  const nextBadge = BADGES.find((b) => maxStreak < b.minStreak)

  if (unlockedBadges.length === 0 && !nextBadge) return null

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">Logros de racha</h4>

      {/* Unlocked badges */}
      {unlockedBadges.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {unlockedBadges.map((badge) => (
            <TooltipProvider key={badge.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full border-2 flex items-center justify-center p-2",
                      badge.bgColor,
                      badge.color
                    )}
                  >
                    {badge.icon}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Desbloqueado con {badge.minStreak}+ días
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      {/* Next badge progress */}
      {nextBadge && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Próximo logro: {nextBadge.label}</span>
            <span className="font-medium">
              {maxStreak}/{nextBadge.minStreak} días
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", nextBadge.bgColor)}
              style={{ width: `${Math.min((maxStreak / nextBadge.minStreak) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
