"use client"

import React, { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { CartProvider } from "@/components/cart-provider"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

// This is a wrapper component that ensures all client-side functionality
// is properly initialized before rendering the full UI
export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Critical: Always render all providers to avoid React context errors,
  // but show a loading state until client-side hydration is complete
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <CartProvider>
            {mounted ? (
              <>{children}</>
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

// Remove the default export to prevent issues with dynamic imports
// export default { ClientProviders } 