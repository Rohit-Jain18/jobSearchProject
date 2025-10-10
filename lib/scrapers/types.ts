export type RawJob = {
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
}

export type ScraperParams = {
  query: string
  experience?: string
  location?: string
  limit?: number
}
