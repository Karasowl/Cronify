"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { useTranslations } from 'next-intl'

export function AddHabitDialog({ onHabitAdded }: { onHabitAdded: () => void }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const t = useTranslations('HabitTracker')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const title = formData.get("title") as string
        const description = formData.get("description") as string

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase.from("habits").insert({
                user_id: user.id,
                title,
                description,
                frequency: { type: "daily" },
            })

            if (error) throw error

            toast.success(t('success'))
            setOpen(false)
            onHabitAdded()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> {t('addHabitButton')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-white/10">
                <DialogHeader>
                    <DialogTitle>{t('createTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('createDesc')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">{t('habitTitleLabel')}</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder={t('habitTitlePlaceholder')}
                                className="col-span-3 bg-white/5 border-white/10"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">{t('habitDescLabel')}</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder={t('habitDescPlaceholder')}
                                className="col-span-3 bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? t('creating') : t('createButton')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
