"use client"

import { cn } from "@/lib/utils"

interface CircularProgressProps {
    value: number
    size?: number
    strokeWidth?: number
    className?: string
    children?: React.ReactNode
    trackColor?: string
    progressColor?: string
}

export function CircularProgress({
    value,
    size = 120,
    strokeWidth = 12,
    className,
    children,
    trackColor = "text-muted",
    progressColor = "text-primary",
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

    return (
        <div className={cn("relative", className)} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
                viewBox={`0 0 ${size} ${size}`}
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className={trackColor}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={cn(progressColor, "transition-all duration-500 ease-out")}
                    strokeLinecap="round"
                />
            </svg>
            {children && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    )
}
