'use client'

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      })
    } catch (error) {
      console.error("Sign in failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 text-zinc-100 antialiased p-4">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] 
            w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl opacity-50"
        />
      </div>

      {/* Card Container */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* Glass Card Effect */}
        <div className="absolute inset-0 -z-10 rounded-2xl 
          bg-zinc-900/20 backdrop-blur-xl border border-zinc-800/50
          shadow-[0_8px_32px_rgb(0_0_0/0.3)]" 
        />

        {/* Content */}
        <div className="relative p-8 space-y-8">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800/50 
            flex items-center justify-center mx-auto shadow-lg">
            <svg
              className="w-6 h-6 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome to GPTMe
            </h1>
            <p className="text-zinc-400 text-base">
              Turn yourself into a GPT in minutes
            </p>
          </div>

          {/* Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={cn(
              "w-full h-12 relative group",
              "bg-zinc-900/50 hover:bg-zinc-800/50",
              "border border-zinc-800/50 hover:border-zinc-700/50",
              "text-zinc-300 hover:text-zinc-100",
              "transition-all duration-200 ease-in-out",
              "flex items-center justify-center gap-3",
              "rounded-lg"
            )}
          >
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/10 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
              />
            </div>
            
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                viewBox="0 0 488 512"
                fill="currentColor"
              >
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
            )}
            <span className="text-sm font-medium">
              {isLoading ? "Signing in..." : "Continue with Google"}
            </span>
          </Button>

          {/* Terms */}
          <p className="text-center text-xs text-zinc-500">
            By continuing, you agree to our{" "}
            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}