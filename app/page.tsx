"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BrainCircuit, Rows, FileText, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { AuthDialog } from "@/components/auth-dialog"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // redirect if already authenticated
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) router.replace("/dashboard")
  }, [router])

  return (
    <main className="min-h-dvh">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-balance text-4xl font-semibold tracking-tight md:text-5xl"
              >
                AI-powered Job Search with Smart Matching
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="mt-4 text-pretty text-muted-foreground md:text-lg"
              >
                Upload your resume, let the matcher score new roles, and manage your applications from a single
                dashboard. Built for speed, privacy, and clarity.
              </motion.p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <AuthDialog
                  trigger={
                    <Button size="lg" className="group">
                      <LogIn className="mr-2 h-4 w-4" />
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  }
                />
                <Link
                  href="/dashboard"
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Explore Dashboard
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Card className="border-muted/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    Matching
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  TF‑IDF + keywords to rank roles against your resume highlights.
                </CardContent>
              </Card>
              <Card className="border-muted/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Resume Parse
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Upload PDF/Docx; parsing runs async via a queue and stores profile JSON.
                </CardContent>
              </Card>
              <Card className="border-muted/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rows className="h-5 w-5 text-primary" />
                    Clean Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Filter by score, open postings quickly, and track status.
                </CardContent>
              </Card>
              <Card className="border-muted/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    Fast Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Local Postgres/Redis/MinIO via Docker — no Upstash required.
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
