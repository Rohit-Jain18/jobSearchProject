import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type { Readable } from "stream"

const endpoint = process.env.S3_ENDPOINT
const region = process.env.AWS_REGION || "us-east-1"
const accessKeyId = process.env.S3_ACCESS_KEY
const secretAccessKey = process.env.S3_SECRET_KEY
export const S3_BUCKET = process.env.S3_BUCKET || "dev-bucket"

export const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
})

export async function uploadBuffer(key: string, buffer: Buffer, contentType = "application/octet-stream") {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "private",
    }),
  )
  return `s3://${S3_BUCKET}/${key}`
}

export async function getSignedGetUrl(key: string, expiresIn = 300) {
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key })
  return getSignedUrl(s3, cmd, { expiresIn })
}

export function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks)))
  })
}
