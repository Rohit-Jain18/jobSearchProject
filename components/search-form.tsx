"use client"

import { useState } from "react"
import useSWRMutation from "swr/mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, MapPin, Rocket } from "lucide-react"

type SearchResponse = {
  items: any[]
  total: number
  query: string
  experience: string
  location: string
}

type SearchArgs = {
  query: string
  experience: string
  location: string
  minScore: number
}

// Mutation function
async function postJson(url: string, { arg }: { arg: SearchArgs }): Promise<SearchResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : ""
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function SearchForm({ onResults }: { onResults: (r: SearchResponse) => void }) {
  const [query, setQuery] = useState("java developer")
  const [experience, setExperience] = useState("0-2")
  const [location, setLocation] = useState("India")
  const [minScore, setMinScore] = useState<number[]>([0])

  const { trigger, isMutating } = useSWRMutation<SearchResponse, any, string, SearchArgs>(
    "/api/search",
    postJson,
    {
      onSuccess: (data) => {
        if (data) onResults(data) // safe check
      },
    }
  )

  const handleSearch = () => {
    trigger({
      query,
      experience,
      location,
      minScore: (minScore[0] ?? 0) / 100,
    }).catch((err) => {
      console.error("Search failed:", err)
    })
  }

  return (
    <Card className="border bg-card/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
      <CardHeader>
        <CardTitle className="text-pretty">Find matching jobs</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-5">
        {/* Query input */}
        <div className="md:col-span-2 flex items-center gap-2">
          <Search className="size-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Java Developer, React, Data Analyst"
          />
        </div>

        {/* Experience select */}
        <div className="md:col-span-1">
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger>
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fresher">Fresher</SelectItem>
              <SelectItem value="0-2">0-2 years</SelectItem>
              <SelectItem value="2-4">2-4 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5-8">5-8 years</SelectItem>
              <SelectItem value="8+">8+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location input */}
        <div className="md:col-span-1 flex items-center gap-2">
          <MapPin className="size-5 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
          />
        </div>

        {/* Search button */}
        <div className="md:col-span-1 flex items-center justify-end">
          <Button onClick={handleSearch} disabled={isMutating} className="gap-2">
            {isMutating ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
            Search
          </Button>
        </div>

        {/* Min score slider */}
        <div className="md:col-span-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Min score</span>
            <span className="text-sm font-medium">{minScore[0] ?? 0}%</span>
          </div>
          <Slider value={minScore} onValueChange={setMinScore} min={0} max={100} step={5} />
        </div>
      </CardContent>
    </Card>
  )
}
