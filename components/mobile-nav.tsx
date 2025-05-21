"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingCart, Package, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-white md:hidden">
      <div className="grid h-full grid-cols-4">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center ${
            pathname === "/" ? "text-green-600" : "text-green-700"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center ${
            pathname === "/products" ? "text-green-600" : "text-green-700"
          }`}
        >
          <Package className="h-5 w-5" />
          <span className="text-xs mt-1">Products</span>
        </Link>
        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center ${
            pathname === "/cart" ? "text-green-600" : "text-green-700"
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-xs mt-1">Cart</span>
        </Link>
        <Link
          href={user ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center ${
            pathname === "/profile" || pathname === "/login" ? "text-green-600" : "text-green-700"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">{user ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </div>
  )
}
