"use client"

import { HabitTracker } from "@/components/habit-tracker"
import { Navbar } from "@/components/navbar"
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
    const t = useTranslations('Dashboard')

    return (
        <div className="space-y-8">
            <Navbar />

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('noHabits')}
                </p>
            </div>

            <HabitTracker />
        </div>
    )
}
