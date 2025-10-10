"use client"

import { type JobItem, JobCard } from "./job-card"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

export function JobList({ items }: { items: JobItem[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="animate-in fade-in">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No jobs yet</EmptyTitle>
            <EmptyDescription>
              Try a broader query or reduce the minimum score.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="grid gap-4 animate-in fade-in">
      {items.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </div>
  )
}
