"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent } from "@/components/ui/card"
import { SearchForm } from "@/components/search-form"
import { JobList } from "@/components/job-list"

type SearchResponse = {
  items: any[]
  total: number
  query: string
  experience: string
  location: string
}

export default function DashboardPage() {
  const [results, setResults] = useState<SearchResponse | null>(null)

  return (
    <main className="min-h-dvh animate-in fade-in duration-300">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12 grid gap-6">
        <SearchForm onResults={(r) => setResults(r)} />
        <Card className="animate-in fade-in slide-in-from-bottom-2">
          <CardContent className="pt-6">
            <JobList items={results?.items ?? []} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
