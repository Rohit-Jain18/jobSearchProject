import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { scrapeJobs } from "@/lib/scrapers"
import { buildCandidateKeywords, scoreJob, sortAndTrim, type ScoredJob, type ResumeProfile } from "@/lib/match"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const query = `${body.query || ""}`.trim()
    const experience = `${body.experience || ""}`.trim()
    const location = `${body.location || ""}`.trim()
    const minScore = typeof body.minScore === "number" ? body.minScore : 0

    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 })

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profileJson: true },
    })
    const profile = (dbUser?.profileJson as ResumeProfile | null) || undefined

    const raw = await scrapeJobs({ query, experience, location, limit: 40 })
    const keywords = buildCandidateKeywords(query, experience, profile)
    const scored: ScoredJob[] = raw.map((j) => {
      const { score, reason } = scoreJob(j, keywords)
      return { ...j, score, reason }
    })
    const sorted = sortAndTrim(scored, minScore, 200)

    return NextResponse.json({ items: sorted, total: raw.length, query, experience, location })
  } catch (err: any) {
    console.error("[api/search] error:", err?.message)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
