"use client"

import { Badge } from "@/components/ui/badge"

export function ApplicationStatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase()
  let variant: "default" | "secondary" | "outline" | "destructive" = "outline"
  if (s === "applied") variant = "default"
  else if (s === "saved") variant = "secondary"
  else if (s === "interviewing") variant = "default"
  else if (s === "offered") variant = "default"
  else if (s === "rejected") variant = "destructive"

  const label = s.charAt(0).toUpperCase() + s.slice(1) || "Saved"
  return <Badge variant={variant}>{label}</Badge>
}
