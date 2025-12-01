"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, Minus } from "lucide-react"
import type { HabitLogStatus } from "@/types"
import { cn } from "@/lib/utils"

interface HabitLogModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habitTitle: string
  date: string
  currentStatus?: HabitLogStatus
  currentReason?: string
  onSubmit: (status: HabitLogStatus, reason?: string) => Promise<void>
}

export function HabitLogModal({
  open,
  onOpenChange,
  habitTitle,
  date,
  currentStatus,
  currentReason,
  onSubmit,
}: HabitLogModalProps) {
  const [status, setStatus] = useState<HabitLogStatus | null>(currentStatus || null)
  const [reason, setReason] = useState(currentReason || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!status) return

    setIsSubmitting(true)
    try {
      await onSubmit(status, reason || undefined)
      onOpenChange(false)
      setStatus(null)
      setReason("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const statusOptions: { value: HabitLogStatus; label: string; icon: React.ReactNode; color: string }[] = [
    {
      value: "completed",
      label: "Completado",
      icon: <Check className="w-5 h-5" />,
      color: "border-green-500 bg-green-500/20 text-green-500",
    },
    {
      value: "failed",
      label: "Fallado",
      icon: <X className="w-5 h-5" />,
      color: "border-red-500 bg-red-500/20 text-red-500",
    },
    {
      value: "skipped",
      label: "Saltado",
      icon: <Minus className="w-5 h-5" />,
      color: "border-yellow-500 bg-yellow-500/20 text-yellow-500",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar hábito</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{habitTitle}</span>
            <br />
            <span className="text-xs capitalize">{formatDate(date)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label>¿Cómo te fue?</Label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    status === option.value
                      ? option.color
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  {option.icon}
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reason field - always show but highlight for failed */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              {status === "failed"
                ? "¿Qué pasó? (opcional pero recomendado)"
                : "Notas (opcional)"}
            </Label>
            <Textarea
              id="reason"
              placeholder={
                status === "failed"
                  ? "Ej: Me quedé trabajando hasta tarde..."
                  : "Añade notas sobre este día..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className={cn(
                status === "failed" && "border-red-500/50 focus:border-red-500"
              )}
            />
            {status === "failed" && (
              <p className="text-xs text-muted-foreground">
                Registrar la razón te ayuda a identificar patrones y tu accountability partner podrá apoyarte mejor.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!status || isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
