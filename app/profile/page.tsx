"use client"

import useSWR from "swr"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMemo, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { ResumeUploader } from "@/components/resume-uploader"
import Link from "next/link"

const fetcher = (url: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  }).then((r) => {
    if (!r.ok) throw new Error("Unauthorized")
    return r.json()
  })

export default function ProfilePage() {
  const { data, mutate, error, isLoading } = useSWR("/api/users/me", fetcher)
  const [profileRaw, setProfileRaw] = useState("")
  const { toast } = useToast()

  const skills = useMemo(() => {
    const p = (data?.profileJson as any) || {}
    const arr: string[] = Array.from(
      new Set(
        ([] as string[])
          .concat(p.skills ?? [], p.keywords ?? [], p.tech ?? [])
          .filter(Boolean)
          .map((s) => String(s).trim()),
      ),
    )
    return arr.slice(0, 20)
  }, [data])

  const onSave = async () => {
    try {
      const parsed = profileRaw ? JSON.parse(profileRaw) : {}
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ profileJson: parsed }),
      })
      if (!res.ok) throw new Error("Save failed")
      await mutate()
      toast({ title: "Saved", description: "Profile updated." })
    } catch (e: any) {
      toast({ title: "Invalid JSON", description: e?.message || "Please check the JSON format." })
    }
  }

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading…</div>
  if (error) return <div className="p-6 text-muted-foreground">Please sign in from the homepage.</div>

  return (
    <main className="min-h-dvh animate-in fade-in duration-300">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-6 py-10 md:py-12">
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-balance">Your Profile</CardTitle>
            <div className="flex items-center gap-2">
              <ResumeUploader />
              <Button asChild variant="secondary">
                <Link href="/applications">View applications</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-1">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{data.email}</div>
            </div>
            <div className="grid gap-1">
              <div className="text-sm text-muted-foreground">Resume</div>
              <div className="font-medium">{data.resumeUrl || "—"}</div>
            </div>

            {skills.length > 0 && (
              <div className="grid gap-2">
                <div className="text-sm text-muted-foreground">Detected skills</div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-1 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Profile JSON</div>
              <Textarea
                value={profileRaw || JSON.stringify(data.profileJson ?? {}, null, 2)}
                onChange={(e) => setProfileRaw(e.target.value)}
                className="min-h-[260px] font-mono text-sm"
              />
              <div className="flex justify-end">
                <Button onClick={onSave}>Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
