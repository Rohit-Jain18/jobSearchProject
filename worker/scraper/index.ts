import { Worker } from "bullmq"
import { chromium } from "playwright"
import { prisma } from "../../lib/prisma"

const connection = (() => {
  const url = process.env.REDIS_URL || "redis://localhost:6379"
  const u = new URL(url)
  return { host: u.hostname, port: Number(u.port || 6379), password: u.password || undefined }
})()

new Worker(
  "scrape_jobs",
  async (job) => {
    const { source = "dev-seed", listUrl } = job.data as { source?: string; listUrl?: string }
    // V0 dev: seed a few jobs without real scrape to validate pipeline
    if (!listUrl) {
      await prisma.job.createMany({
        data: [
          {
            source: "dev-seed",
            title: "Java Developer (Fresher)",
            company: "ABC Tech",
            location: "Noida",
            description:
              "Looking for a Fresher Java developer with knowledge of Java 8, Spring Boot, REST APIs and PostgreSQL.",
            url: "https://example-company-careers.com/jobs/1234",
          },
          {
            source: "dev-seed",
            title: "Junior Backend Engineer",
            company: "XYZ Labs",
            location: "Remote",
            description: "Backend role with Java/Spring, REST, SQL basics.",
            url: "https://example.com/jobs/789",
          },
        ],
        skipDuplicates: true,
      })
      return
    }

    // Example Playwright flow for real scraping (disabled by default)
    const browser = await chromium.launch({ headless: process.env.PLAYWRIGHT_HEADLESS !== "false" })
    const page = await browser.newPage()
    await page.goto(listUrl, { waitUntil: "domcontentloaded" })
    // TODO: evaluate selectors and extract jobs
    await browser.close()
  },
  { connection },
)
