import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-helpers"

export const runtime = "nodejs"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return new Response("Unauthorized", { status: 401 })
  const id = params.id

  const body = await req.json().catch(() => ({}) as any)
  const { status } = body || {}
  if (!status) return new Response("Missing status", { status: 400 })

  // Ensure ownership
  const owned = await prisma.application.findFirst({ where: { id, userId: user.id } })
  if (!owned) return new Response("Not found", { status: 404 })

  const updated = await prisma.application.update({ where: { id }, data: { status } })
  return new Response(JSON.stringify(updated), { status: 200 })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return new Response("Unauthorized", { status: 401 })
  const id = params.id

  const owned = await prisma.application.findFirst({ where: { id, userId: user.id } })
  if (!owned) return new Response("Not found", { status: 404 })

  await prisma.application.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
