"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function AuthRequired({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      // Store the current path to redirect back after login
      localStorage.setItem("fertishop-redirect", pathname)
      router.push("/login")
    }
  }, [user, isLoading, router, pathname])

  // Show nothing while checking authentication
  if (isLoading || !user) {
    return null
  }

  return <>{children}</>
}
