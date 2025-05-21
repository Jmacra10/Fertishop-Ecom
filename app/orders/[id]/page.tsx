"use client"

import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/data"
import AuthRequired from "@/components/auth-required"
import { ordersAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import type { Order } from "@/lib/types"

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = typeof params?.id === 'string' ? params.id : '';
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order ID")
      setIsLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)
        const orderData = await ordersAPI.getById(orderId)
        setOrder(orderData)
      } catch (error) {
        console.error("Error fetching order details:", error)
        setError("Failed to load order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  if (isLoading) {
    return (
      <AuthRequired>
        <div className="container px-4 py-8 md:py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthRequired>
    )
  }

  if (error || !order) {
    return (
      <AuthRequired>
        <div className="container px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The order you're looking for does not exist."}
            </p>
            <Link href="/orders">
              <Button>Go Back to Orders</Button>
            </Link>
          </div>
        </div>
      </AuthRequired>
    )
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "to-pay":
        return "To Pay"
      case "to-ship":
        return "To Ship"
      case "to-receive":
        return "To Receive"
      case "completed":
        return "Completed"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "to-pay":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "to-ship":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "to-receive":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "to-pay":
        return <Clock className="h-5 w-5" />
      case "to-ship":
        return <Package className="h-5 w-5" />
      case "to-receive":
        return <Truck className="h-5 w-5" />
      case "completed":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  return (
    <AuthRequired>
      <div className="container px-4 py-8 md:py-12">
        <Link href="/orders" className="inline-flex items-center text-sm mb-6 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 px-3 py-1 text-sm`}>
            {getStatusIcon(order.status)}
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Order Number</p>
                      <p className="text-muted-foreground">#{order.id.substring(order.id.length - 6)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Order Date</p>
                      <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Payment Method</p>
                      <p className="text-muted-foreground">
                        {order.paymentMethod === "gcash" ? "GCash" : "Cash on Delivery"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Total Amount</p>
                      <p className="text-muted-foreground">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-4">Items</h3>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex justify-between py-2 border-b">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} x {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Recipient</p>
                    <p className="text-muted-foreground">{order.address.fullName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Contact Number</p>
                    <p className="text-muted-foreground">{order.address.phone}</p>
                  </div>
                  <div>
                    <p className="font-medium">Shipping Address</p>
                    <p className="text-muted-foreground">
                      {order.address.street}, {order.address.city}, {order.address.zip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative border-l-2 pl-6 pb-6 border-primary">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                    <p className="font-semibold">Order Placed</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div
                    className={`relative border-l-2 pl-6 pb-6 ${order.status === "to-pay" ? "border-muted" : "border-primary"}`}
                  >
                    <div
                      className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full ${order.status === "to-pay" ? "bg-muted" : "bg-primary"}`}
                    ></div>
                    <p className={`font-semibold ${order.status === "to-pay" ? "text-muted-foreground" : ""}`}>
                      Payment Confirmed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.status !== "to-pay" ? "Payment received" : "Awaiting payment"}
                    </p>
                  </div>

                  <div
                    className={`relative border-l-2 pl-6 pb-6 ${order.status === "to-pay" || order.status === "to-ship" ? "border-muted" : "border-primary"}`}
                  >
                    <div
                      className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full ${order.status === "to-pay" || order.status === "to-ship" ? "bg-muted" : "bg-primary"}`}
                    ></div>
                    <p
                      className={`font-semibold ${order.status === "to-pay" || order.status === "to-ship" ? "text-muted-foreground" : ""}`}
                    >
                      Order Shipped
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.status === "to-receive" || order.status === "completed"
                        ? "Your order is on the way"
                        : "Processing"}
                    </p>
                  </div>

                  <div className={`relative pl-6 ${order.status === "completed" ? "" : "border-l-2 border-muted"}`}>
                    <div
                      className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full ${order.status === "completed" ? "bg-primary" : "bg-muted"}`}
                    ></div>
                    <p className={`font-semibold ${order.status === "completed" ? "" : "text-muted-foreground"}`}>
                      Order Delivered
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.status === "completed" ? "Your order has been delivered" : "Pending delivery"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If you have any questions or concerns about your order, please contact our customer support.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}
