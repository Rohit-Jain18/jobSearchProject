import { Worker } from "bullmq"
import { chromium } from "playwright"
import { prisma } from "../../lib/prisma"

const connection = (() => {
  const url = process.env.REDIS_URL || "redis://localhost:6379"
  const u = new URL(url)
  return { host: u.hostname, port: Number(u.port || 6379), password: u.password || undefined }
})()

new Worker(
  "apply_auto",
  async (job) => {
    const { userId, jobId } = job.data as { userId: string; jobId: string }
    const [user, j] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.job.findUnique({ where: { id: jobId } }),
    ])
    if (!user || !j) return

    const app = await prisma.application.create({
      data: { userId, jobId, status: "queued" },
    })

    const browser = await chromium.launch({ headless: process.env.PLAYWRIGHT_HEADLESS !== "false" })
    const page = await browser.newPage()
    await page.goto(j.url, { waitUntil: "domcontentloaded" })

    // Basic detection to avoid complex flows in V0 skeleton
    const html = await page.content()
    if (html.includes("captcha") || html.includes("recaptcha")) {
      await prisma.application.update({
        where: { id: app.id },
        data: {
          status: "needs_manual",
          applyResult: { status: "needs_manual", message: "Captcha or complex flow detected" },
        },
      })
      await browser.close()
      return
    }

    // TODO: fill known fields and upload resume if mapping available
    await prisma.application.update({
      where: { id: app.id },
      data: {
        status: "applied",
        applyResult: { status: "applied", message: "V0 skeleton - simulated submit" },
      },
    })
    await browser.close()
  },
  { connection },
)
