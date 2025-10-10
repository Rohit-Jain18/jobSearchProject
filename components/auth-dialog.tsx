"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Props = { trigger: React.ReactNode }

export function AuthDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onSuccess={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm onSuccess={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function LoginForm({ onSuccess }: { onSuccess(): void }) {
  const { toast } = useToast()

  async function onSubmit(formData: FormData) {
    const email = String(formData.get("email") || "")
    const password = String(formData.get("password") || "")
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: "Login failed", description: data?.error || "Invalid credentials" })
      return
    }
    localStorage.setItem("token", data.token)
    toast({ title: "Logged in", description: "Welcome back!" })
    onSuccess()
    window.location.href = "/dashboard"
  }

  return (
    <form action={onSubmit} className="grid gap-3">
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Password" required />
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  )
}

function RegisterForm({ onSuccess }: { onSuccess(): void }) {
  const { toast } = useToast()

  async function onSubmit(formData: FormData) {
    const name = String(formData.get("name") || "")
    const email = String(formData.get("email") || "")
    const password = String(formData.get("password") || "")
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: "Register failed", description: data?.error || "Please try again" })
      return
    }
    localStorage.setItem("token", data.token)
    toast({ title: "Account created", description: "You are now signed in." })
    onSuccess()
    window.location.href = "/dashboard"
  }

  return (
    <form action={onSubmit} className="grid gap-3">
      <Input name="name" placeholder="Name (optional)" />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Password" required />
      <Button type="submit" className="w-full">
        Create account
      </Button>
    </form>
  )
}
