"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/data"
import AuthRequired from "@/components/auth-required"
import Image from "next/image"
import { CreditCard, Truck, ShieldCheck, Clock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { ordersAPI } from "@/lib/api"

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    paymentMethod: "cod",
    notes: "",
  })

  // Pre-fill form with user data when available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.zip
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      setIsSubmitting(false)
      return
    }

    // Make sure cart is not empty
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Your cart is empty. Please add items to your cart before checkout.",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Ensure cart is synced with backend for authenticated users
      const { cartAPI } = await import("@/lib/api");
      
      if (user) {
        // Clear existing cart first to avoid duplicates
        await cartAPI.clearCart();
        
        // Add each item to the backend cart
        for (const item of items) {
          try {
            await cartAPI.addItem(item.id, item.quantity);
          } catch (error) {
            console.error(`Failed to sync item ${item.id} to backend cart:`, error);
          }
        }
      }
      
      // Create order using API
      const orderData = {
        address: {
          fullName: formData.fullName,
          street: formData.address,
          city: formData.city,
          zip: formData.zip,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod as 'gcash' | 'cod',
      }
      
      const order = await ordersAPI.create(orderData);
      
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. Your order is being processed.",
      });
      
      // Clear cart and redirect to orders page
      clearCart();
      router.push("/orders");
    } catch (error) {
      console.error('Error creating order:', error);
      
      // More specific error handling
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("Cart is empty")) {
          errorMessage = "Your shopping cart appears to be empty on our server. Please try adding items again.";
        } else if (error.message.includes("Invalid or expired token")) {
          errorMessage = "Your session has expired. Please log in again.";
          // Redirect to login
          setTimeout(() => {
            router.push("/login?redirect=/checkout");
          }, 2000);
        }
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthRequired>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <div className="container px-4 py-8 md:py-12">
          <h1 className="text-3xl font-bold mb-8 text-green-800">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit}>
                <Card className="border-green-100 bg-white shadow-sm">
                  <CardHeader className="bg-green-50 border-b border-green-100">
                    <CardTitle className="text-green-800">Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-green-800">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="border-green-200 focus-visible:ring-green-500 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-green-800">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="border-green-200 focus-visible:ring-green-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-green-800">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="border-green-200 focus-visible:ring-green-500 bg-white"
                        placeholder="e.g., 09123456789"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-green-800">
                        Address *
                      </Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="border-green-200 focus-visible:ring-green-500 bg-white"
                        placeholder="House/Unit Number, Building, Street"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-green-800">
                          City/Municipality *
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="border-green-200 focus-visible:ring-green-500 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip" className="text-green-800">
                          ZIP Code *
                        </Label>
                        <Input
                          id="zip"
                          name="zip"
                          value={formData.zip}
                          onChange={handleChange}
                          required
                          className="border-green-200 focus-visible:ring-green-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-green-800">
                        Order Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Special instructions for delivery"
                        value={formData.notes}
                        onChange={handleChange}
                        className="border-green-200 focus-visible:ring-green-500 bg-white"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6 border-green-100 bg-white shadow-sm">
                  <CardHeader className="bg-green-50 border-b border-green-100">
                    <CardTitle className="text-green-800">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 bg-white">
                    <RadioGroup value={formData.paymentMethod} onValueChange={handleRadioChange} className="space-y-4">
                      <div className="flex items-center space-x-2 border rounded-lg p-4 border-green-200 hover:bg-green-50 transition-colors bg-white">
                        <RadioGroupItem value="gcash" id="gcash" className="border-green-400 text-green-600" />
                        <Label htmlFor="gcash" className="flex-1 cursor-pointer">
                          <div className="font-medium text-green-800">GCash</div>
                          <div className="text-sm text-green-600">
                            Pay using your GCash account - Fast and secure mobile payment
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            • Instant payment confirmation
                            <br />• No additional fees
                            <br />• Earn GCash points with your purchase
                          </div>
                        </Label>
                        <div className="flex items-center">
                          <Image
                            src="https://images.pexels.com/photos/5980800/pexels-photo-5980800.jpeg?auto=compress&cs=tinysrgb&w=100"
                            alt="GCash"
                            width={60}
                            height={30}
                            className="rounded-md"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 border rounded-lg p-4 border-green-200 hover:bg-green-50 transition-colors bg-white">
                        <RadioGroupItem value="cod" id="cod" className="border-green-400 text-green-600" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="font-medium text-green-800">Cash on Delivery</div>
                          <div className="text-sm text-green-600">
                            Pay when you receive your order - Available nationwide
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            • Pay in cash upon delivery
                            <br />• Verify your items before payment
                            <br />• ₱50 COD fee applies for orders below ₱1,000
                          </div>
                        </Label>
                        <div className="text-green-600 font-semibold flex items-center">
                          <Truck className="h-6 w-6 mr-1" />
                          <span>COD</span>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                  <CardFooter className="pt-4 bg-white">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : "Place Order"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>

            <div>
              <Card className="border-green-100 bg-white shadow-sm">
                <CardHeader className="bg-green-50 border-b border-green-100">
                  <CardTitle className="text-green-800">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6 bg-white">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium text-green-800">{item.name}</p>
                        <p className="text-sm text-green-600">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-green-800">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}

                  <Separator className="bg-green-100" />

                  <div className="flex justify-between text-green-700">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Shipping</span>
                    <span>{subtotal >= 1000 ? "Free" : formatPrice(100)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>COD Fee</span>
                    <span>{formData.paymentMethod === "cod" && subtotal < 1000 ? formatPrice(50) : "Free"}</span>
                  </div>
                  <Separator className="bg-green-100" />
                  <div className="flex justify-between font-semibold text-lg text-green-800">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        subtotal >= 1000 ? subtotal : subtotal + 100 + (formData.paymentMethod === "cod" ? 50 : 0),
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on orders over ₱1,000</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Clock className="h-4 w-4" />
                  <span>Delivery within 3-5 business days</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Multiple payment options</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}
