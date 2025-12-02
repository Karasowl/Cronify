"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function TermsPage() {
    const t = useTranslations("Legal")

    const sections = [
        { title: t("terms.section1Title"), content: t("terms.section1Content") },
        { title: t("terms.section2Title"), content: t("terms.section2Content") },
        { title: t("terms.section3Title"), content: t("terms.section3Content") },
        { title: t("terms.section4Title"), content: t("terms.section4Content") },
        { title: t("terms.section5Title"), content: t("terms.section5Content") },
        { title: t("terms.section6Title"), content: t("terms.section6Content") },
        { title: t("terms.section7Title"), content: t("terms.section7Content") },
    ]

    return (
        <main className="min-h-screen p-4 md:p-12 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
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
                    <h1 className="text-3xl font-bold">{t("termsTitle")}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t("termsLastUpdated")}: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Content */}
                <GlassCard>
                    <p className="text-muted-foreground mb-6">{t("terms.intro")}</p>

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
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                        {t("privacyTitle")}
                    </Link>
                </div>
            </div>
        </main>
    )
}
