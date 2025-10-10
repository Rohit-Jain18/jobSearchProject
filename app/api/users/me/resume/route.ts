import type { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { uploadBuffer } from "@/lib/s3"
import { queues } from "@/lib/queue"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const form = await req.formData()
  const file = form.get("resume") as unknown as File
  if (!file) return new Response(JSON.stringify({ error: "resume field required" }), { status: 400 })

  // Accept PDFs and common doc types; fallback content-type for some browsers
  const contentType = file.type || "application/pdf"
  const arrayBuffer = await file.arrayBuffer()
  const ext = file.name?.split(".").pop() || "pdf"
  const safeName = file.name?.replace(/[^\w.-]/g, "_") || `resume.${ext}`

  const key = `resumes/${user.id}/${Date.now()}-${safeName}`
  await uploadBuffer(key, Buffer.from(arrayBuffer), contentType)

  const resumeUrl = `s3://${process.env.S3_BUCKET || "dev-bucket"}/${key}`
  await prisma.user.update({ where: { id: user.id }, data: { resumeUrl } })

  const job = await queues.resumeParse.add("resume-parse", { userId: user.id, resumeUrl, contentType })

  return new Response(JSON.stringify({ resumeUrl, parseJobId: job.id }), { status: 200 })
}
