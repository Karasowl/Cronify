import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children?: React.ReactNode
    gradient?: boolean
    hoverEffect?: boolean
}

export function GlassCard({
    className,
    children,
    gradient = false,
    hoverEffect = true,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "glass rounded-xl p-6 relative overflow-hidden",
                hoverEffect && "glass-hover",
                gradient && "bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-transparent",
                className
            )}
            {...props}
        >
            {gradient && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
            )}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}
