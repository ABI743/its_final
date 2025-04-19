"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function FirebaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<{ [key: string]: boolean }>({})

  const checkFirebase = async () => {
    setStatus("loading")
    setErrorMessage(null)

    // Check environment variables
    const vars = {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    setEnvVars(vars)

    // Check if any env vars are missing
    const missingVars = Object.entries(vars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      setStatus("error")
      setErrorMessage(`Missing environment variables: ${missingVars.join(", ")}`)
      return
    }

    try {
      // Try to import Firebase dynamically
      const firebase = await import("@/lib/firebase")

      // Try to get entries as a test
      await firebase.getEntries()

      setStatus("connected")
    } catch (error: any) {
      console.error("Firebase connection error:", error)
      setStatus("error")
      setErrorMessage(error.message || "Failed to connect to Firebase")
    }
  }

  useEffect(() => {
    checkFirebase()
  }, [])

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="rounded-lg bg-amber-900/80 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {status === "loading" && (
            <>
              <RefreshCw className="h-5 w-5 animate-spin text-amber-100" />
              <span className="text-sm text-amber-100">Checking Firebase...</span>
            </>
          )}

          {status === "connected" && (
            <>
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-amber-100">Firebase connected</span>
            </>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-amber-100">Firebase error</span>
              </div>
              {errorMessage && <p className="max-w-xs text-xs text-red-300">{errorMessage}</p>}
              <div className="text-xs text-amber-200">
                <p>Environment variables:</p>
                <ul className="ml-2 mt-1">
                  {Object.entries(envVars).map(([key, value]) => (
                    <li key={key} className={value ? "text-green-400" : "text-red-400"}>
                      {key}: {value ? "✓" : "✗"}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={checkFirebase}
                className="mt-2 w-full border-amber-200/30 bg-amber-900/40 text-amber-100 hover:bg-amber-800/60"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
