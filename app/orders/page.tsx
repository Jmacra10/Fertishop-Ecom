"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/data"
import AuthRequired from "@/components/auth-required"
import { ordersAPI } from "@/lib/api"
import type { Order } from "@/lib/types"

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const fetchedOrders = await ordersAPI.getAll()
        setOrders(fetchedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = activeTab === "all" ? orders : orders.filter((order) => order.status === activeTab)

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

  return (
    <AuthRequired>
      <div className="container px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="to-pay">To Pay</TabsTrigger>
            <TabsTrigger value="to-ship">To Ship</TabsTrigger>
            <TabsTrigger value="to-receive">To Receive</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No orders found</h2>
                <p className="text-muted-foreground mb-6">
                  You don't have any {activeTab !== "all" ? getStatusLabel(activeTab).toLowerCase() : ""} orders yet.
                </p>
                <Link href="/products">
                  <Button>Shop Now</Button>
                </Link>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Order #{order.id.substring(order.id.length - 6)}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <span>Order Date: </span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="space-y-2">
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

                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <div>
                          <p className="text-sm font-medium">Shipping Address:</p>
                          <p className="text-sm text-muted-foreground">
                            {order.address.fullName}, {order.address.street}, {order.address.city}, {order.address.zip}
                          </p>
                        </div>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthRequired>
  )
}
