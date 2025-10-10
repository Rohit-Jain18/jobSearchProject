"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Building2, MapPin, Calendar, Info } from "lucide-react"

export type JobItem = {
  id: string
  title: string
  company: string
  location?: string
  url: string
  source: string
  postedAt?: string
  descriptionSnippet?: string
  salary?: string
  remote?: boolean
  score: number
  reason?: string
}

export function JobCard({ job }: { job: JobItem }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-pretty">{job.title}</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-4" />
              {job.company}
            </span>
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" />
                {job.location}
              </span>
            )}
            {job.postedAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-4" />
                {job.postedAt}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{job.source}</Badge>
          <Badge className="bg-green-600 text-white">{Math.round(job.score * 100)}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-sm text-muted-foreground line-clamp-3 md:max-w-[70%]">
          {job.descriptionSnippet || "No description provided."}
        </p>
        <div className="flex items-center gap-2">
          {job.reason && (
            <Badge variant="outline" className="gap-1">
              <Info className="size-3" />
              {job.reason}
            </Badge>
          )}
          <Button asChild size="sm" variant="default" className="gap-1">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              Apply <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
