"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { LogOut, UserRound, LayoutDashboard } from "lucide-react"
import { Button } from "./ui/button"

export function SiteHeader() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(!!localStorage.getItem("token"))
  }, [])

  const onLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-6 w-6 rounded bg-primary" aria-hidden />
          JobSearch AI
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <UserRound className="h-4 w-4" />
              Profile
            </Button>
          </Link>
          {authed ? (
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
