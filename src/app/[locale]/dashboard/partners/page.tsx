"use client"

import { Partnerships } from "@/components/partnerships"
import { Navbar } from "@/components/navbar"
import { useTranslations } from 'next-intl'

export default function PartnersPage() {
    const t = useTranslations('Partnerships')

    return (
        <div className="space-y-8">
            <Navbar />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('description')}
                </p>
            </div>
            <Partnerships />
        </div>
    )
}
