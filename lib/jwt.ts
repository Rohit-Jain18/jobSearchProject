import jwt, { SignOptions } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "change-me"

export interface JwtPayload {
  sub: string
  email: string
}

export function signJwt(payload: JwtPayload, expiresIn: string | number = "1h"): string {
  const options: SignOptions = { expiresIn: expiresIn as any } // <-- cast to any
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}
