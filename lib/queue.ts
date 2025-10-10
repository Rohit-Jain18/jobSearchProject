import { Queue } from "bullmq"

const connection = (() => {
  const url = process.env.REDIS_URL || "redis://localhost:6379"
  const u = new URL(url)
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    password: u.password || undefined,
  }
})()

export const queues = {
  scrapeJobs: new Queue("scrape-jobs", { connection }),
  resumeParse: new Queue("resume-parse", { connection }),
  matchCompute: new Queue("match-compute", { connection }),
  applyAuto: new Queue("apply-auto", { connection }),
}
