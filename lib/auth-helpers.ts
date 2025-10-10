import { headers } from "next/headers"
import { prisma } from "./prisma"
import { verifyJwt } from "./jwt"
import type { NextRequest } from "next/server"


export async function getAuthUser() {
  const hdrs = await headers()
  const auth = hdrs.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null

  const token = auth.slice("Bearer ".length).trim()
  const payload = verifyJwt(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  return user
}

export async function getUserFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!auth || !auth.startsWith("Bearer ")) return null
  const token = auth.slice("Bearer ".length).trim()
  const payload = verifyJwt(token)
  if (!payload) return null
  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  return user
}
