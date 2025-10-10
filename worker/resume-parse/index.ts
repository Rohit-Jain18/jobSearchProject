import { Worker } from "bullmq"
import { prisma } from "../../lib/prisma"

const connection = (() => {
  const url = process.env.REDIS_URL || "redis://localhost:6379"
  const u = new URL(url)
  return { host: u.hostname, port: Number(u.port || 6379), password: u.password || undefined }
})()

const KNOWN_SKILLS = [
  "java",
  "spring",
  "spring boot",
  "rest",
  "postgresql",
  "hibernate",
  "maven",
  "git",
  "linux",
  "sql",
  "docker",
]

// Change queue names to remove colons
new Worker(
  "resume_parse",
  async (job) => {
    const { userId, resumeUrl } = job.data as { userId: string; resumeUrl: string }
    const placeholderText = "sample resume text with java spring boot rest postgresql"
    const text = placeholderText.toLowerCase()
    const skills = KNOWN_SKILLS.filter((s) => text.includes(s))

    await prisma.user.update({
      where: { id: userId },
      data: { profileJson: { text, skills } },
    })

    // Enqueue match_compute
    const { Queue } = await import("bullmq")
    const matchQueue = new Queue("match_compute", { connection })
    await matchQueue.add("match", { userId })
  },
  { connection },
)
