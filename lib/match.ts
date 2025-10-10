export type ResumeProfile = {
  text?: string
  skills?: string[]
  rolePreference?: string
  experienceRange?: string
}

export type ScoredJob = {
  id: string
  title: string
  company: string
  location?: string
  url: string
  source: string
  postedAt?: string
  descriptionSnippet?: string
  salary?: string
  remote?: boolean
  score: number
  reason?: string
}

const stop = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "to",
  "in",
  "on",
  "of",
  "with",
  "by",
  "at",
  "from",
  "is",
  "are",
  "be",
  "as",
  "this",
  "that",
  "it",
  "you",
  "your",
])

function tokenize(s?: string): string[] {
  if (!s) return []
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+.# ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !stop.has(w))
}

export function buildCandidateKeywords(query: string, experienceRange?: string, profile?: ResumeProfile) {
  const qTokens = tokenize(query)
  const expTokens = tokenize(experienceRange)
  const roleTokens = tokenize(profile?.rolePreference)
  const skillTokens = (profile?.skills || []).map((s) => s.toLowerCase())
  const resumeTokens = tokenize(profile?.text)
  const keywords = new Set<string>([...qTokens, ...skillTokens, ...roleTokens, ...expTokens])
  for (const t of resumeTokens.slice(0, 80)) keywords.add(t)
  return Array.from(keywords)
}

export function scoreJob(
  job: { title: string; company?: string; descriptionSnippet?: string; location?: string },
  keywords: string[],
): { score: number; reason: string } {
  const hay = tokenize(`${job.title} ${job.company ?? ""} ${job.descriptionSnippet ?? ""} ${job.location ?? ""}`)
  if (hay.length === 0 || keywords.length === 0) return { score: 0, reason: "Insufficient content" }
  let hits = 0
  let titleHits = 0
  const titleTokens = tokenize(job.title)
  const haySet = new Set(hay)
  for (const k of keywords) {
    if (haySet.has(k)) {
      hits += 1
      if (titleTokens.includes(k)) titleHits += 1
    }
  }
  const base = hits / Math.max(8, keywords.length)
  const boost = Math.min(0.4, titleHits * 0.05)
  const score = Math.min(1, base + boost)
  const reason = `Matched ${hits} keywords (${titleHits} in title)`
  return { score, reason }
}

export function sortAndTrim(jobs: ScoredJob[], minScore = 0, maxItems = 200) {
  return jobs
    .filter((j) => j.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
}
