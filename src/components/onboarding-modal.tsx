"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { CheckSquare, Timer, BarChart3, Users, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"

const ONBOARDING_KEY = "cronify_onboarding_completed"

interface OnboardingModalProps {
    forceShow?: boolean
}

export function OnboardingModal({ forceShow = false }: OnboardingModalProps) {
    const t = useTranslations("Onboarding")
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(0)

    useEffect(() => {
        // Check if user has seen onboarding
        const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY)
        if (!hasSeenOnboarding || forceShow) {
            setOpen(true)
        }
    }, [forceShow])

    const steps = [
        {
            icon: <Sparkles className="w-12 h-12 text-primary" />,
            title: t("welcome"),
            description: t("welcomeDesc"),
        },
        {
            icon: (
                <div className="flex gap-2">
                    <CheckSquare className="w-10 h-10 text-green-500" />
                    <Timer className="w-10 h-10 text-orange-500" />
                </div>
            ),
            title: t("step1Title"),
            description: t("step1Desc"),
        },
        {
            icon: <BarChart3 className="w-12 h-12 text-cyan-500" />,
            title: t("step2Title"),
            description: t("step2Desc"),
        },
        {
            icon: <Users className="w-12 h-12 text-blue-500" />,
            title: t("step3Title"),
            description: t("step3Desc"),
        },
    ]

    function handleComplete() {
        localStorage.setItem(ONBOARDING_KEY, "true")
        setOpen(false)
    }

    function handleSkip() {
        localStorage.setItem(ONBOARDING_KEY, "true")
        setOpen(false)
    }

    function nextStep() {
        if (step < steps.length - 1) {
            setStep(step + 1)
        } else {
            handleComplete()
        }
    }

    function prevStep() {
        if (step > 0) {
            setStep(step - 1)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/10">
                <div className="p-6">
                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    i === step
                                        ? "bg-primary w-6"
                                        : i < step
                                        ? "bg-primary/50"
                                        : "bg-white/20"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="text-center space-y-4"
                        >
                            <div className="flex justify-center mb-4">
                                {steps[step].icon}
                            </div>
                            <h2 className="text-2xl font-bold">{steps[step].title}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {steps[step].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
                        <div>
                            {step > 0 ? (
                                <Button variant="ghost" onClick={prevStep} className="gap-1">
                                    <ArrowLeft className="w-4 h-4" />
                                    {t("back")}
                                </Button>
                            ) : (
                                <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                                    {t("skip")}
                                </Button>
                            )}
                        </div>

                        <Button onClick={nextStep} className="gap-1">
                            {step === steps.length - 1 ? (
                                <>
                                    {t("getStarted")}
                                    <Sparkles className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    {t("next")}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
