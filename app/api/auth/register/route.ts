import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/hash"
import { signJwt } from "@/lib/jwt"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    console.log("Received request")
    const body = await req.json()
    console.log("Body:", body)
    const { name, email, password } = body || {}

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email and password required" }), { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return new Response(JSON.stringify({ error: "email already registered" }), { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name: name || null, email, passwordHash },
      select: { id: true, name: true, email: true },
    })
    const token = signJwt({ sub: user.id, email: user.email })
    console.log("User created:", user)
    return new Response(JSON.stringify({ token, user }), { status: 201 })
  } catch (e: any) {
    console.error("Error in register API:", e)
    return new Response(JSON.stringify({ error: e?.message || "server error" }), { status: 500 })
  }
}
