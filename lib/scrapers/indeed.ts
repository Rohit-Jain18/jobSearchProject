import * as cheerio from "cheerio"
import type { RawJob, ScraperParams } from "./types"

function toUrl({ query, location }: { query: string; location?: string }) {
  const q = encodeURIComponent(query)
  const l = encodeURIComponent(location || "")
  return `https://www.indeed.com/jobs?q=${q}&l=${l}&sort=date&fromage=3`
}

export async function scrapeIndeed(params: ScraperParams): Promise<RawJob[]> {
  const url = toUrl({ query: params.query, location: params.location })
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; JobSearchBot/1.0)" } })
  const html = await res.text()
  const $ = cheerio.load(html)

  const items: RawJob[] = []
  $(".job_seen_beacon").each((_, el) => {
    const title = $(el).find("h2.jobTitle").text().trim()
    const company = $(el).find(".companyName").first().text().trim()
    const location = $(el).find(".companyLocation").first().text().trim()
    const snippet = $(el).find(".job-snippet").text().trim()
    const rel = $(el).find("a").attr("href") || ""
    const href = rel.startsWith("http") ? rel : `https://www.indeed.com${rel}`
    if (title && href) {
      items.push({
        id: href,
        title,
        company: company || "Unknown",
        location,
        url: href,
        source: "indeed",
        descriptionSnippet: snippet,
      })
    }
  })
  return params.limit ? items.slice(0, params.limit) : items
}
