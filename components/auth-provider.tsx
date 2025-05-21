"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { authAPI, getToken } from "@/lib/api"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load user from token on mount
  useEffect(() => {
    // Skip if not mounted (prevents SSR token attempts)
    if (!mounted) {
      setIsLoading(false);
      return;
    }
    
    const fetchUser = async () => {
      try {
        // Check if there's a token
        const token = getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Validate token and get user info
        const data = await authAPI.getMe();
        setUser(data.user);
      } catch (error) {
        // Token is invalid, clear it
        authAPI.logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [mounted]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const data = await authAPI.login(email, password);
      
      if (!data || !data.user || !data.token) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid response from server"
        });
        return false;
      }
      
      setUser(data.user);
      
      toast({
        title: "Login successful",
        description: "Welcome back to FertiShop!",
      });
      
      // Check for redirect
      const redirect = localStorage.getItem("fertishop-redirect");
      if (redirect) {
        localStorage.removeItem("fertishop-redirect");
        window.location.href = redirect;
      }
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const data = await authAPI.signup(name, email, password);
      setUser(data.user);
      
      toast({
        title: "Account created!",
        description: "Welcome to FertiShop!",
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred during signup",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  // Always provide the context regardless of mounted state
  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
