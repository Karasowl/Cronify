"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, UserPlus, Users } from "lucide-react"
import { useTranslations } from 'next-intl'

type Partnership = {
    id: string
    partner_email: string
    status: "pending" | "active"
    created_at: string
}

export function Partnerships() {
    const [partnerships, setPartnerships] = useState<Partnership[]>([])
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const t = useTranslations('Partnerships')

    async function fetchPartnerships() {
        try {
            const { data, error } = await supabase
                .from("partnerships")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            if (data) setPartnerships(data)
        } catch (error) {
            console.error("Error fetching partnerships:", error)
        }
    }

    useEffect(() => {
        fetchPartnerships()
    }, [])

    async function invitePartner(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase.from("partnerships").insert({
                user_id: user.id,
                partner_email: email,
                status: "active", // Auto-active for MVP simplicity
            })

            if (error) throw error

            toast.success(t('inviteSuccess'))
            setEmail("")
            fetchPartnerships()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    async function removePartner(id: string) {
        try {
            const { error } = await supabase
                .from("partnerships")
                .delete()
                .eq("id", id)

            if (error) throw error

            toast.success(t('removeSuccess'))
            fetchPartnerships()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="space-y-6">
            <GlassCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">{t('title')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t('description')}
                    </p>

                    <form onSubmit={invitePartner} className="flex gap-2">
                        <div className="flex-1">
                            <Label htmlFor="email" className="sr-only">
                                {t('emailLabel')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <UserPlus className="w-4 h-4 mr-2" />
                            )}
                            {isLoading ? t('inviting') : t('inviteButton')}
                        </Button>
                    </form>
                </div>
            </GlassCard>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('yourPartners')}</h3>
                {partnerships.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t('noPartners')}</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {partnerships.map((p) => (
                            <GlassCard key={p.id} className="flex items-center justify-between p-4">
                                <div>
                                    <p className="font-medium">{p.partner_email}</p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {p.status}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => removePartner(p.id)}
                                >
                                    {t('remove')}
                                </Button>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
