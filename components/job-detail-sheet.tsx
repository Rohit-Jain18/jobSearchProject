"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export function JobDetailSheet({
  open,
  onOpenChange,
  job,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  job: any
}) {
  if (!job) return null
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-pretty">{job.title}</SheetTitle>
          <SheetDescription className="text-pretty">
            {job.company}
            {job.location ? " · " + job.location : ""}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <Tabs defaultValue="desc">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="desc">Description</TabsTrigger>
              <TabsTrigger value="why">Match reason</TabsTrigger>
            </TabsList>
            <TabsContent value="desc" className="mt-3">
              <ScrollArea className="h-[60dvh] pr-4">
                <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap leading-6">
                  {job.description || "No description"}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="why" className="mt-3">
              <ScrollArea className="h-[60dvh] pr-4">
                <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(job.reason ?? {}, null, 2)}</pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
