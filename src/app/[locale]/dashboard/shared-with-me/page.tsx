import { Navbar } from "@/components/navbar"
import { SharedHabits } from "@/components/shared-habits"

export default function SharedWithMePage() {
    return (
        <div className="space-y-8">
            <Navbar />
            <SharedHabits />
        </div>
    )
}
