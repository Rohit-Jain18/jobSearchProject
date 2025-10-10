"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UploadCloud } from "lucide-react"

export function ResumeUploader() {
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append("resume", file)
      const res = await fetch("/api/users/me/resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Upload failed")
      toast({ title: "Resume uploaded", description: "Parsing started in background." })
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.message || "Try again. Please ensure the file is a PDF, DOC, or DOCX.",
      })
    } finally {
      setBusy(false)
      e.target.value = ""
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input id="resume" type="file" className="hidden" accept=".pdf,.doc,.docx,application/pdf" onChange={onChange} />
      <Button
        disabled={busy}
        variant="outline"
        className="gap-2 bg-transparent"
        onClick={() => document.getElementById("resume")?.click()}
      >
        <UploadCloud className="h-4 w-4" />
        {busy ? "Uploading…" : "Upload resume"}
      </Button>
    </div>
  )
}
