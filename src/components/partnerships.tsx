"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Loader2,
  UserPlus,
  Users,
  Trash2,
  Mail,
  Clock,
  CheckCircle2,
  Eye,
} from "lucide-react"
import { useTranslations } from "next-intl"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

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
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()
  const t = useTranslations("Partnerships")

  async function fetchPartnerships() {
    try {
      setIsLoadingList(true)
      const { data, error } = await supabase
        .from("partnerships")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      if (data) setPartnerships(data)
    } catch (error) {
      console.error("Error fetching partnerships:", error)
    } finally {
      setIsLoadingList(false)
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

      // Check if already exists
      const existing = partnerships.find(
        (p) => p.partner_email.toLowerCase() === email.toLowerCase()
      )
      if (existing) {
        toast.error(t("alreadyPartner") || "Este email ya es tu partner")
        return
      }

      const { error } = await supabase.from("partnerships").insert({
        user_id: user.id,
        partner_email: email.toLowerCase(),
        status: "active",
      })

      if (error) throw error

      toast.success(t("inviteSuccess"))
      setEmail("")
      fetchPartnerships()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function removePartner() {
    if (!deleteId) return
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from("partnerships")
        .delete()
        .eq("id", deleteId)

      if (error) throw error

      toast.success(t("removeSuccess"))
      setPartnerships((prev) => prev.filter((p) => p.id !== deleteId))
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <GlassCard className="border-l-4 border-l-primary">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("title")}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{t("description")}</p>

          {/* What will be shared */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {t("whatShared") || "Tu partner podrá ver:"}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• {t("sharedItem1") || "Tus hábitos y su progreso"}</li>
              <li>• {t("sharedItem2") || "Calendario con días completados/fallados"}</li>
              <li>• {t("sharedItem3") || "Razones cuando falles un día"}</li>
              <li>• {t("sharedItem4") || "Tu racha actual y porcentaje de cumplimiento"}</li>
            </ul>
          </div>

          <form onSubmit={invitePartner} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">
                {t("emailLabel")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
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
              {isLoading ? t("inviting") : t("inviteButton")}
            </Button>
          </form>
        </div>
      </GlassCard>

      {/* Partners List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("yourPartners")}</h3>

        {isLoadingList ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : partnerships.length === 0 ? (
          <GlassCard className="text-center py-8">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("noPartners")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("noPartnersHint") || "Invita a alguien para que te ayude a mantener tus hábitos"}
            </p>
          </GlassCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {partnerships.map((p) => (
              <GlassCard key={p.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{p.partner_email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                            p.status === "active"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          )}
                        >
                          {p.status === "active" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {p.status === "active"
                            ? t("statusActive") || "Activo"
                            : t("statusPending") || "Pendiente"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t("addedOn") || "Agregado"}: {formatDate(p.created_at)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("removeConfirmTitle") || "¿Eliminar partner?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeConfirmDesc") ||
                "Este partner ya no podrá ver tus hábitos ni tu progreso."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("cancel") || "Cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={removePartner}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
