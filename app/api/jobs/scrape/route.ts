import type { NextRequest } from "next/server"
import { queues } from "@/lib/queue"
import { getAuthUser } from "@/lib/auth-helpers"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return new Response("Unauthorized", { status: 401 })
  const { source = "generic", query = "" } = await req.json().catch(() => ({}))

  await queues.scrapeJobs.add("scrape", { source, query, userId: user.id })
  return new Response(JSON.stringify({ enqueued: true }), { status: 202 })
}
