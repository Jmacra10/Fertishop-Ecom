"use client"

import { useState } from "react"
import { useParams, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingCart, Truck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductCard from "@/components/product-card"
import { getProductById, getRelatedProducts, formatPrice } from "@/lib/data"
import { useCart } from "@/components/cart-provider"
import { categories } from "@/lib/data"
import { ImageWithFallback } from "@/components/image-with-fallback"

export default function ProductPage() {
  const params = useParams()
  
  if (!params || !params.id) {
    notFound()
  }
  
  const productId = params.id as string
  const product = getProductById(productId)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product)

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const handleBuyNow = async () => {
    try {
      await addToCart(product, quantity)
      window.location.href = "/checkout"
    } catch (error) {
      console.error("Error during Buy Now:", error)
    }
  }

  const getUseCaseLabel = (slug: string) => {
    switch (slug) {
      case "yellow-leaves":
        return "Cures Yellow Leaves"
      case "root-growth":
        return "Boosts Root Growth"
      case "boost-production":
        return "Increases Yield"
      case "soil-health":
        return "Improves Soil"
      case "pest-control":
        return "Controls Pests"
      case "disease-control":
        return "Treats Diseases"
      case "nutrient-deficiency":
        return "Fixes Deficiencies"
      case "drought-resistance":
        return "Drought Protection"
      default:
        return slug
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="container px-4 py-8 md:py-12">
        <Link href="/products" className="inline-flex items-center text-sm mb-6 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                className="w-full object-cover aspect-square"
                fallbackSrc="/placeholder.svg"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-green-800">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {categories.find((c) => c.slug === product.category)?.name}
                </Badge>
                <p className="text-sm text-green-600">Sold: {product.soldCount.toLocaleString()}+</p>
              </div>
              <p className="text-3xl font-bold mt-4 text-green-600">{formatPrice(product.price)}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-green-800">Treats:</h3>
              <p className="text-green-700">{product.treatmentFor}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-green-800">Use Cases:</h3>
              <div className="flex flex-wrap gap-2">
                {product.useCase.map((uc) => (
                  <Badge key={uc} className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200">
                    {getUseCaseLabel(uc)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-green-800">Description:</h3>
              <p className="text-green-700">{product.description}</p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border rounded-md border-green-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-none text-green-700"
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-12 text-center text-green-800">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10 rounded-none text-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
              <p className="text-sm text-green-600">{product.stock} available</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="flex-1 transition-all duration-300 hover:scale-105 bg-green-600 hover:bg-green-700"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 transition-all duration-300 hover:scale-105 bg-green-100 text-green-800 hover:bg-green-200"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-4 text-sm text-green-600">
              <Truck className="h-4 w-4" />
              <p>Free shipping on orders over ₱1,000</p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger
                value="details"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 text-green-700"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="application"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 text-green-700"
              >
                How to Apply
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 text-green-700"
              >
                Shipping & Returns
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-800">Product Details</h3>
                <p className="text-green-700">{product.description}</p>
                <ul className="list-disc pl-5 space-y-2 text-green-700">
                  <li>Category: {categories.find((c) => c.slug === product.category)?.name}</li>
                  <li>Stock: {product.stock} units available</li>
                  <li>Sold: {product.soldCount.toLocaleString()}+ units</li>
                  <li>Treats: {product.treatmentFor}</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="application" className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-800">How to Apply</h3>
                <p className="text-green-700">For best results, follow these application instructions:</p>
                <ul className="list-disc pl-5 space-y-2 text-green-700">
                  <li>Mix thoroughly with soil before planting for best results</li>
                  <li>Apply once every 2-4 weeks depending on plant needs</li>
                  <li>Water thoroughly after application</li>
                  <li>Store in a cool, dry place away from direct sunlight</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-800">Shipping Information</h3>
                <p className="text-green-700">We offer the following shipping options:</p>
                <ul className="list-disc pl-5 space-y-2 text-green-700">
                  <li>Standard Shipping: 3-5 business days</li>
                  <li>Express Shipping: 1-2 business days (additional fee)</li>
                  <li>Free shipping on orders over ₱1,000</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 text-green-800">Return Policy</h3>
                <p className="text-green-700">
                  If you're not satisfied with your purchase, you can return it within 7 days of delivery. Please note
                  that the product must be unopened and in its original packaging.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-green-800">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
