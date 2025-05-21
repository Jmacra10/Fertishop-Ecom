"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { formatPrice } from "@/lib/data"
import { ImageWithFallback } from "@/components/image-with-fallback"
import { Skeleton } from "@/components/ui/skeleton"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart, isLoading } = useCart()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration issues by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoize calculated values
  const shipping = useMemo(() => (subtotal >= 1000 ? 0 : 100), [subtotal])
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping])
  
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)
  }

  const handleCheckout = () => {
    if (!user) {
      // Store the current path to redirect back after login
      if (typeof window !== 'undefined') {
        localStorage.setItem("fertishop-redirect", "/checkout");
      }
      window.location.href = "/login";
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      window.location.href = "/checkout";
    }, 1000);
  }

  if (!mounted) {
    return <CartSkeleton />
  }

  if (isLoading) {
    return <CartSkeleton />
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <div className="container px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="container px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {!user && (
              <Card className="mb-6 border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4 flex-col sm:flex-row">
                    <div className="flex-1">
                      <h3 className="font-semibold">You must log in before checking out</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please log in or create an account to complete your purchase.
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Link href="/login">
                        <Button size="sm" variant="outline">
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button size="sm">Sign Up</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-32 h-32 relative">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        fallbackSrc="/placeholder.svg"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div>
                          <Link href={`/products/${item.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors">{item.name}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease quantity</span>
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase quantity</span>
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between mt-6 flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => clearCart()}>
                Clear Cart
              </Button>
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleCheckout} disabled={isProcessing || isLoading}>
                  {isProcessing ? "Processing..." : "Proceed to Checkout"}
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                  <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                  <line x1="8" x2="16" y1="12" y2="12" />
                </svg>
                <span>Free shipping on orders over ₱1,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="container px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-[150px] w-full rounded-lg" />
            <Skeleton className="h-[150px] w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
