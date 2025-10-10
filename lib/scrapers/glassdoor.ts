import * as cheerio from "cheerio"
import type { RawJob, ScraperParams } from "./types"

function toUrl({ query, location }: { query: string; location?: string }) {
  const q = encodeURIComponent(query)
  const l = encodeURIComponent(location || "")
  return `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}&locT=C&locId=&locKeyword=${l}`
}

export async function scrapeGlassdoor(params: ScraperParams): Promise<RawJob[]> {
  const res = await fetch(toUrl({ query: params.query, location: params.location }), {
    headers: { "user-agent": "Mozilla/5.0 (compatible; JobSearchBot/1.0)" },
  })
  const html = await res.text()
  const $ = cheerio.load(html)

  const items: RawJob[] = []
  $("[data-test='jobListing']").each((_, el) => {
    const title = $(el).find("[data-test='job-title']").text().trim()
    const company = $(el).find("[data-test='employer-name']").text().trim()
    const location = $(el).find("[data-test='location']").text().trim()
    const rel = $(el).find("a").attr("href") || ""
    const href = rel.startsWith("http") ? rel : `https://www.glassdoor.com${rel}`
    const snippet = $(el).find("[data-test='job-description']").text().trim()
    if (title && href) {
      items.push({
        id: href,
        title,
        company: company || "Unknown",
        location,
        url: href,
        source: "glassdoor",
        descriptionSnippet: snippet,
      })
    }
  })
  return params.limit ? items.slice(0, params.limit) : items
}
