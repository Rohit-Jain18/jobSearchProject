import type { RawJob, ScraperParams } from "./types"
import { scrapeIndeed } from "./indeed"
import { scrapeGlassdoor } from "./glassdoor"

export async function scrapeJobs(params: ScraperParams): Promise<RawJob[]> {
  const { query, experience, location, limit = 40 } = params
  const expKey = experience ? `${query} ${experience}` : query

  const runs = await Promise.allSettled([
    scrapeIndeed({ query: expKey, location, limit }),
    scrapeGlassdoor({ query: expKey, location, limit }),
    // Future: add LinkedIn + Naukri via Playwright workers
  ])

  const results: RawJob[] = []
  for (const r of runs) {
    if (r.status === "fulfilled") results.push(...r.value)
  }
  const seen = new Set<string>()
  const uniq: RawJob[] = []
  for (const j of results) {
    if (!seen.has(j.url)) {
      seen.add(j.url)
      uniq.push(j)
    }
  }
  return uniq
}

export type { RawJob, ScraperParams } from "./types"
