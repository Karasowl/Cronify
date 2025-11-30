import { Navbar } from "@/components/navbar"
import { Partnerships } from "@/components/partnerships"

export default function SharePage() {
    return (
        <div className="space-y-8">
            <Navbar />

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Accountability Partners</h1>
                <p className="text-muted-foreground">
                    Manage who can see your progress.
                </p>
            </div>

            <Partnerships />
        </div>
    )
}
