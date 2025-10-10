import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-helpers"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const url = new URL(req.url)
  const minScore = Number(url.searchParams.get("minScore") || 0)
  const page = Math.max(1, Number(url.searchParams.get("page") || 1))
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 25)))
  const skip = (page - 1) * limit

  const [rows, total] = await Promise.all([
    prisma.job.findMany({
      skip,
      take: limit,
      orderBy: { scrapedAt: "desc" },
      include: {
        JobMatches: {
          where: { userId: user.id },
          take: 1,
        },
      },
    }),
    prisma.job.count(),
  ])

  const jobs = rows
    .map((j) => {
      const match = j.JobMatches[0]
      return {
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        url: j.url,
        score: match?.score ?? 0,
        reason: match?.reason ?? [],
      }
    })
    .filter((j) => (j.score ?? 0) >= minScore)

  return new Response(JSON.stringify({ jobs, total }), { status: 200 })
}
