"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function DebugPage() {
    const [logs, setLogs] = useState<string[]>([])
    const supabase = createClient()

    const addLog = (msg: string, data?: any) => {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8)
        const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : ''
        setLogs(prev => [`[${timestamp}] ${msg}${dataStr}`, ...prev])
    }

    useEffect(() => {
        async function runDiagnostics() {
            addLog("Starting diagnostics...")

            // 1. Check Env Vars
            addLog("Checking Env Vars", {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Defined" : "Missing",
                key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Defined" : "Missing"
            })

            // 2. Check Auth
            const { data: { session }, error: authError } = await supabase.auth.getSession()
            if (authError) {
                addLog("Auth Error", authError)
            } else {
                addLog("Auth Session", session ? { user: session.user.email } : "No Session")
            }

            // 3. Check Habits Table
            addLog("Querying 'habits' table...")
            try {
                const { data, error, count } = await supabase
                    .from('habits')
                    .select('*', { count: 'exact', head: true })

                if (error) {
                    addLog("Habits Table Error (PostgrestError)", error)
                    addLog("Error Message", error.message)
                    addLog("Error Code", error.code)
                    addLog("Error Details", error.details)
                } else {
                    addLog("Habits Table OK", { count, status: "Accessible" })
                }
            } catch (err: any) {
                addLog("Habits Query Exception", {
                    message: err.message,
                    name: err.name,
                    stack: err.stack,
                    stringified: JSON.stringify(err)
                })
            }

            // 4. Test Insert (if auth)
            if (session?.user) {
                addLog("Skipping insert test to avoid pollution, but Auth is OK.")
            } else {
                addLog("Skipping insert test (Not Authenticated)")
            }
        }

        runDiagnostics()
    }, [])

    return (
        <div className="p-8 font-mono text-sm bg-black text-green-400 min-h-screen">
            <h1 className="text-xl font-bold mb-4 text-white">System Diagnostics</h1>
            <div className="space-y-2">
                {logs.map((log, i) => (
                    <pre key={i} className="whitespace-pre-wrap border-b border-green-900/30 pb-1">
                        {log}
                    </pre>
                ))}
            </div>
        </div>
    )
}
