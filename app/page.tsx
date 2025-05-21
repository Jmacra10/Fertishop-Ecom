import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/product-card"
import { categories, getFeaturedProducts } from "@/lib/data"

export default function Home() {
  const featuredProducts = getFeaturedProducts(6)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-green-100">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-green-800">
                  Boost your Harvest. Shop Smart Fertilizers.
                </h1>
                <p className="max-w-[600px] text-green-700 md:text-xl">
                  Premium quality fertilizers for all your gardening needs. Enhance soil health, boost plant growth, and
                  increase your yield.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="transition-all duration-300 hover:scale-105 bg-green-600 hover:bg-green-700"
                  >
                    Start Shopping
                  </Button>
                </Link>
                <Link href="#categories">
                  <Button size="lg" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                    Explore Categories
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] relative">
              <Image
                src="/images/products/organic-category.jpg"
                alt="Healthy plants growing with FertiShop fertilizers"
                width={600}
                height={600}
                className="rounded-2xl object-cover w-full aspect-square"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-lg border hidden md:block">
                <p className="text-sm font-medium text-green-700">Trusted by</p>
                <p className="text-2xl font-bold text-green-800">10,000+ Farmers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-green-800">
                Shop by Category
              </h2>
              <p className="max-w-[700px] text-green-700 md:text-xl">
                Find the perfect fertilizer for your specific gardening needs.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-green-100">
                  <div className="aspect-square relative">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent flex items-end">
                      <h3 className="font-semibold text-white p-4 text-lg">{category.name}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="w-full py-12 md:py-24 bg-green-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2 bg-green-100 text-green-800 border-green-200">
                Best Sellers
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-green-800">
                Featured Products
              </h2>
              <p className="max-w-[700px] text-green-700 md:text-xl">
                Our most popular fertilizers trusted by farmers and gardeners.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="transition-all duration-300 hover:scale-105 border-green-600 text-green-700 hover:bg-green-50"
              >
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-green-700 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Boost Your Harvest?
              </h2>
              <p className="max-w-[700px] md:text-xl">
                Join thousands of satisfied customers and experience the FertiShop difference.
              </p>
            </div>
            <Link href="/products">
              <Button
                size="lg"
                variant="secondary"
                className="transition-all duration-300 hover:scale-105 bg-white text-green-700 hover:bg-green-50"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
