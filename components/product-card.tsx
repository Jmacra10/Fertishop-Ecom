"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/data"
import { type Product } from "@/lib/types"
import { useCart } from "@/components/cart-provider"
import { useState } from "react"
import { ImageWithFallback } from "@/components/image-with-fallback"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    await addToCart(product)
    setIsAdding(false)
  }

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-green-100 flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="relative block overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="object-cover w-full aspect-square transition-transform duration-300 group-hover:scale-105"
          fallbackSrc="/placeholder.svg"
        />
        <span className="absolute top-3 right-3 bg-green-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
          {formatPrice(product.price)}
        </span>
      </Link>
      <CardContent className="p-5 flex-grow">
        <div className="space-y-3">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-green-600 transition-colors">{product.name}</h3>
          </Link>
          <div className="flex flex-wrap gap-1.5">
            {product.useCase.slice(0, 2).map((useCase: string) => (
              <Badge key={useCase} variant="outline" className="text-sm px-2.5 py-1 bg-green-50 text-green-700 border-green-200">
                {useCase === "yellow-leaves" && "Cures Yellow Leaves"}
                {useCase === "root-growth" && "Boosts Root Growth"}
                {useCase === "boost-production" && "Increases Yield"}
                {useCase === "soil-health" && "Improves Soil"}
                {useCase === "pest-control" && "Controls Pests"}
                {useCase === "disease-control" && "Treats Diseases"}
                {useCase === "nutrient-deficiency" && "Fixes Deficiencies"}
                {useCase === "drought-resistance" && "Drought Protection"}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-green-600 mt-1">
            <span className="font-semibold">Treats:</span> {product.treatmentFor}
          </p>
          <p className="text-sm text-green-600">Sold: {product.soldCount.toLocaleString()}+</p>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex gap-3 mt-auto">
        <Button
          size="default" 
          className="w-full transition-all duration-300 bg-green-600 hover:bg-green-700 text-white font-medium h-10"
          onClick={handleAddToCart}
          disabled={isAdding || isLoading}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
        <Button size="icon" variant="outline" asChild className="border-green-600 text-green-700 hover:bg-green-50 h-10 w-10 flex-shrink-0">
          <Link href={`/products/${product.id}`}>
            <ExternalLink className="h-5 w-5" />
            <span className="sr-only">View Details</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
