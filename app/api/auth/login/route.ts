import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/hash"
import { signJwt } from "@/lib/jwt"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body || {}
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email and password required" }), { status: 400 })
    }
    const userRec = await prisma.user.findUnique({ where: { email } })
    if (!userRec) return new Response(JSON.stringify({ error: "invalid credentials" }), { status: 401 })
    const ok = await verifyPassword(password, userRec.passwordHash)
    if (!ok) return new Response(JSON.stringify({ error: "invalid credentials" }), { status: 401 })
    const user = { id: userRec.id, name: userRec.name, email: userRec.email }
    const token = signJwt({ sub: user.id, email: user.email })
    return new Response(JSON.stringify({ token, user }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "server error" }), { status: 500 })
  }
}
