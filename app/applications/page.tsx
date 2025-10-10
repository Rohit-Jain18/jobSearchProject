"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ApplicationStatusBadge } from "@/components/application-status-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("token") || ""}` : "",
    },
  }).then((r) => {
    if (!r.ok) throw new Error("Unauthorized")
    return r.json()
  })

const STATUSES = ["saved", "applied", "interviewing", "offered", "rejected"]

export default function ApplicationsPage() {
  const { data, mutate, error, isLoading } = useSWR("/api/applications", fetcher)
  const [q, setQ] = useState("")
  const { toast } = useToast()

  const apps = useMemo(() => {
    let list = data?.applications || []
    if (q.trim()) {
      list = list.filter((a: any) => {
        const hay = `${a.job?.title ?? ""} ${a.job?.company ?? ""} ${a.status ?? ""}`.toLowerCase()
        return hay.includes(q.toLowerCase())
      })
    }
    return list
  }, [data, q])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      toast({ title: "Update failed", description: "Please try again." })
      return
    }
    toast({ title: "Status updated" })
    mutate()
  }

  return (
    <main className="min-h-dvh animate-in fade-in duration-300">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Applications</CardTitle>
            <Input
              placeholder="Search by title, company or status"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full md:w-80"
            />
          </CardHeader>
          <CardContent>
            {isLoading && <div className="text-muted-foreground">Loading…</div>}
            {error && <div className="text-muted-foreground">Please sign in to view applications.</div>}
            {!isLoading && !error && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apps.map((a: any) => (
                      <TableRow key={a.id} className="transition-colors hover:bg-muted/40">
                        <TableCell className="font-medium">{a.job?.title ?? "-"}</TableCell>
                        <TableCell>{a.job?.company ?? "-"}</TableCell>
                        <TableCell>
                          <ApplicationStatusBadge status={a.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Select onValueChange={(v) => updateStatus(a.id, v)} defaultValue={a.status}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button asChild variant="outline" size="sm" className="ml-2 bg-transparent">
                            <a href={a.job?.url} target="_blank" rel="noreferrer">
                              Open
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {apps.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No applications yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
