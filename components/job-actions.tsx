"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, Send, Info, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { JobDetailSheet } from "./job-detail-sheet"

export function JobActions({ job, onChanged }: { job: any; onChanged?: () => void }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const act = async (status: "saved" | "applied") => {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({ jobId: job.id, status }),
    })
    if (!res.ok) {
      toast({ title: "Action failed", description: "Please sign in and try again." })
      return
    }
    onChanged?.()
    toast({ title: status === "applied" ? "Marked as applied" : "Saved", description: job.title })
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" aria-label="Details" onClick={() => setOpen(true)}>
        <Info className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Save" onClick={() => act("saved")}>
        <Bookmark className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Mark applied" onClick={() => act("applied")}>
        <Send className="h-4 w-4" />
      </Button>
      <Button asChild variant="outline" size="sm" className="gap-1 bg-transparent">
        <a href={job.url} target="_blank" rel="noreferrer">
          Open <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Button>
      <JobDetailSheet open={open} onOpenChange={setOpen} job={job} />
    </div>
  )
}
