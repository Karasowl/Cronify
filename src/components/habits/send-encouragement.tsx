"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { Heart, Loader2, Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface SendEncouragementProps {
  habitId: string
  habitTitle: string
  onSent?: () => void
}

const QUICK_EMOJIS = ["💪", "🔥", "⭐", "👏", "🎯", "💯", "🚀", "❤️"]

const QUICK_MESSAGES = [
  { emoji: "💪", text: "¡Tú puedes!" },
  { emoji: "🔥", text: "¡Sigue así!" },
  { emoji: "⭐", text: "¡Eres increíble!" },
  { emoji: "🎯", text: "¡Un día a la vez!" },
]

export function SendEncouragement({
  habitId,
  habitTitle,
  onSent,
}: SendEncouragementProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()

  const handleSend = async (quickMessage?: string) => {
    const finalMessage = quickMessage || message
    if (!finalMessage.trim()) {
      toast.error("Escribe un mensaje")
      return
    }

    setIsSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error("No autenticado")

      const { error } = await supabase.from("encouragements").insert({
        habit_id: habitId,
        from_email: user.email,
        message: finalMessage,
        emoji: selectedEmoji,
      })

      if (error) throw error

      toast.success("¡Mensaje de apoyo enviado!")
      setMessage("")
      setSelectedEmoji(null)
      setOpen(false)
      onSent?.()
    } catch (err: any) {
      toast.error(err.message || "Error al enviar")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Heart className="w-4 h-4" />
          Enviar ánimo
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Enviar apoyo</h4>
            <p className="text-xs text-muted-foreground">
              Para: {habitTitle}
            </p>
          </div>

          {/* Quick Messages */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Mensajes rápidos:</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_MESSAGES.map((qm) => (
                <Button
                  key={qm.text}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs h-auto py-2"
                  onClick={() => handleSend(`${qm.emoji} ${qm.text}`)}
                  disabled={isSending}
                >
                  <span className="mr-1">{qm.emoji}</span>
                  {qm.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">O escribe tu mensaje:</p>

            {/* Emoji selector */}
            <div className="flex gap-1 flex-wrap">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-lg hover:bg-accent transition-colors",
                    selectedEmoji === emoji && "bg-primary/20 ring-2 ring-primary"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <Textarea
              placeholder="Escribe algo motivador..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="resize-none"
            />

            <Button
              onClick={() => handleSend()}
              disabled={isSending || !message.trim()}
              className="w-full"
              size="sm"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Simple display for received encouragements
interface EncouragementListProps {
  encouragements: Array<{
    id: string
    from_email: string
    message: string
    emoji: string | null
    created_at: string
  }>
}

export function EncouragementList({ encouragements }: EncouragementListProps) {
  if (encouragements.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        Mensajes de apoyo ({encouragements.length})
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {encouragements.map((enc) => (
          <div
            key={enc.id}
            className="p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20"
          >
            <div className="flex items-start gap-2">
              {enc.emoji && <span className="text-lg">{enc.emoji}</span>}
              <div className="flex-1 min-w-0">
                <p className="text-sm">{enc.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  De: {enc.from_email.split("@")[0]} •{" "}
                  {new Date(enc.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
