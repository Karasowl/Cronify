"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Share2, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { LanguageSwitcher } from "@/components/language-switcher"

export default function Home() {
  const t = useTranslations('HomePage')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-foreground/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full space-y-12 z-10">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50 drop-shadow-sm">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button size="lg" className="rounded-full px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
                {t('getStarted')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Feature Showcase (Glass Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <GlassCard gradient className="col-span-1 md:col-span-2" transition={{ delay: 0.3 }}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="p-3 bg-primary/20 rounded-full w-fit">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">{t('features.trackingTitle')}</h3>
                <p className="text-muted-foreground">
                  {t('features.trackingDesc')}
                </p>
              </div>
              <div className="hidden md:block">
                {/* Mock UI Element */}
                <div className="bg-black/20 rounded-lg p-4 w-48 backdrop-blur-sm border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="h-2 w-20 bg-white/10 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="h-2 w-16 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard transition={{ delay: 0.4 }}>
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/20 rounded-full w-fit">
                <Share2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">{t('features.accountabilityTitle')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('features.accountabilityDesc')}
              </p>
            </div>
          </GlassCard>

          <GlassCard transition={{ delay: 0.5 }}>
            <div className="space-y-4">
              <div className="p-3 bg-purple-500/20 rounded-full w-fit">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">{t('features.privacyTitle')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('features.privacyDesc')}
              </p>
            </div>
          </GlassCard>


        </div>
      </div>
    </main>
  )
}
