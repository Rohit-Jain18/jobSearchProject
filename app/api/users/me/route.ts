import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-helpers"

export const runtime = "nodejs"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return new Response("Unauthorized", { status: 401 })
  return new Response(
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      profileJson: user.profileJson || {},
      resumeUrl: user.resumeUrl || null,
    }),
    { status: 200 },
  )
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return new Response("Unauthorized", { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { profileJson } = body || {}
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { profileJson: profileJson ?? user.profileJson },
    select: { id: true, name: true, email: true, profileJson: true, resumeUrl: true },
  })
  return new Response(JSON.stringify(updated), { status: 200 })
}
