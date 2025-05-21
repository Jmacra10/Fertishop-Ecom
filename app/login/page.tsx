"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && user) {
      // Check if there's a redirect URL
      const redirectPath = localStorage.getItem("fertishop-redirect")
      if (redirectPath) {
        localStorage.removeItem("fertishop-redirect")
        router.push(redirectPath)
      } else {
        router.push("/")
      }
    }
  }, [user, mounted, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validate form
    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Submitting login with:", email)
      
      // Attempt login
      const success = await login(email, password)
      
      if (!success) {
        throw new Error("Login failed. Please check your credentials.")
      }
      
      // Login successful - show toast
      toast({
        title: "Login successful",
        description: "Welcome back!",
        duration: 3000,
      })
      
      // Redirect to home or previous page
      const redirectPath = localStorage.getItem("fertishop-redirect")
      if (redirectPath) {
        localStorage.removeItem("fertishop-redirect")
        router.push(redirectPath)
      } else {
        router.push("/")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please try again.")
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || "Please check your credentials and try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render until client-side to prevent hydration issues
  if (!mounted) return null

  // If already logged in, show nothing during redirect
  if (user) return null

  return (
    <div className="container max-w-md py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-md">
              <p className="font-medium mb-1">Demo credentials:</p>
              <p>Email: demo@example.com</p>
              <p>Password: password</p>
              <button 
                type="button" 
                className="text-primary text-xs mt-1 hover:underline"
                onClick={() => {
                  setEmail("demo@example.com");
                  setPassword("password");
                }}
              >
                Fill demo credentials
              </button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
