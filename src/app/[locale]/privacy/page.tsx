"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function PrivacyPage() {
    const t = useTranslations("Legal")

    const sections = [
        { title: t("privacy.section1Title"), content: t("privacy.section1Content") },
        { title: t("privacy.section2Title"), content: t("privacy.section2Content") },
        { title: t("privacy.section3Title"), content: t("privacy.section3Content") },
        { title: t("privacy.section4Title"), content: t("privacy.section4Content") },
        { title: t("privacy.section5Title"), content: t("privacy.section5Content") },
        { title: t("privacy.section6Title"), content: t("privacy.section6Content") },
        { title: t("privacy.section7Title"), content: t("privacy.section7Content") },
    ]

    return (
        <main className="min-h-screen p-4 md:p-12 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Back button */}
                <Link href="/">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        {t("backToHome")}
                    </Button>
                </Link>

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">{t("privacyTitle")}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t("termsLastUpdated")}: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Content */}
                <GlassCard>
                    <p className="text-muted-foreground mb-6">{t("privacy.intro")}</p>

                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <div key={index}>
                                <h2 className="font-semibold text-lg mb-2">{section.title}</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Footer links */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <Link href="/terms" className="hover:text-primary transition-colors">
                        {t("termsTitle")}
                    </Link>
                </div>
            </div>
        </main>
    )
}
