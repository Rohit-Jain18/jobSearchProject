import { Worker } from "bullmq"
import { prisma } from "../../lib/prisma"
import natural from "natural"

const connection = (() => {
  const url = process.env.REDIS_URL || "redis://localhost:6379"
  const u = new URL(url)
  return { host: u.hostname, port: Number(u.port || 6379), password: u.password || undefined }
})()

function preprocess(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ")
}

function jaccard(a: Set<string>, b: Set<string>) {
  const inter = [...a].filter((x) => b.has(x)).length
  const union = new Set([...a, ...b]).size || 1
  return inter / union
}

function topTerms(text: string, topN = 100) {
  const tfidf = new natural.TfIdf()
  tfidf.addDocument(text)
  return new Set(
    tfidf
      .listTerms(0)
      .slice(0, topN)
      .map((t) => t.term),
  )
}

// Define the expected type of profileJson
type ProfileJson = {
  text: string
  skills: string[]
}

new Worker(
  "match_compute", // fixed queue name
  async (job) => {
    const { userId } = job.data as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.resumeUrl || !user.profileJson) return

    // Cast profileJson to the expected type
    const profile = user.profileJson as ProfileJson
    const resumeText = profile.text || ""
    const R = preprocess(resumeText)
    const Rset = topTerms(R)

    const jobs = await prisma.job.findMany()
    for (const jb of jobs) {
      const J = preprocess(jb.description)
      const Jset = topTerms(J)

      const K = jaccard(Rset, Jset) // [0,1]
      const T = K
      const C = 0.6 * T + 0.4 * K
      let score = Math.round(C * 1000) / 10

      await prisma.jobMatch.upsert({
        where: { userId_jobId: { userId, jobId: jb.id } },
        create: {
          userId,
          jobId: jb.id,
          score,
          reason: Array.from(new Set([...Rset].filter((x) => Jset.has(x)))).slice(0, 10),
        },
        update: {
          score,
          reason: Array.from(new Set([...Rset].filter((x) => Jset.has(x)))).slice(0, 10),
        },
      })
    }
  },
  { connection },
)
