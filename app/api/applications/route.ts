import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-helpers"

export const runtime = "nodejs"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    include: {
      job: {
        select: { id: true, title: true, company: true, location: true, url: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
  return new Response(JSON.stringify({ applications: apps }), { status: 200 })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const body = await req.json().catch(() => ({}) as any)
  const { jobId, status = "saved" } = body || {}
  if (!jobId) return new Response("Missing jobId", { status: 400 })

  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } })
  if (!job) return new Response("Job not found", { status: 404 })

  // Upsert without a composite unique by querying first
  const existing = await prisma.application.findFirst({ where: { userId: user.id, jobId } })
  const app = existing
    ? await prisma.application.update({ where: { id: existing.id }, data: { status } })
    : await prisma.application.create({ data: { userId: user.id, jobId, status } })

  return new Response(JSON.stringify(app), { status: 200 })
}
