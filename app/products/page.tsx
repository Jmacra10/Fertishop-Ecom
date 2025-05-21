"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductCard from "@/components/product-card"
import { categories, useCases, products } from "@/lib/data"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams?.get("category") || ""
  const initialUseCase = searchParams?.get("useCase") || ""
  const searchQuery = searchParams?.get("search") || ""

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>(initialUseCase ? [initialUseCase] : [])
  const [sortOption, setSortOption] = useState<string>("featured")
  const [filteredProducts, setFilteredProducts] = useState(products)

  // Calculate product counts for each use case
  const useCaseCounts = useMemo(() => {
    return useCases.reduce((counts: Record<string, number>, useCase) => {
      const count = products.filter(product => product.useCase.includes(useCase.slug)).length;
      return { ...counts, [useCase.slug]: count };
    }, {});
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = products

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.useCase.some((uc) =>
            useCases
              .find((u) => u.slug === uc)
              ?.name.toLowerCase()
              .includes(query),
          ),
      )
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((product) => product.category === selectedCategory)
    }

    // Filter by use cases
    if (selectedUseCases.length > 0) {
      result = result.filter((product) => product.useCase.some((uc) => selectedUseCases.includes(uc)))
    }

    // Apply sorting
    switch (sortOption) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case "newest":
        result = [...result].sort((a, b) => b.soldCount - a.soldCount)
        break
      case "featured":
      default:
        // Featured products are sorted by sold count
        result = [...result].sort((a, b) => b.soldCount - a.soldCount)
        break
    }

    setFilteredProducts(result)
  }, [selectedCategory, selectedUseCases, sortOption, searchQuery])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  const handleUseCaseChange = (value: string) => {
    setSelectedUseCases((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setSelectedUseCases([])
    setSortOption("featured")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="container px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden md:block w-64 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-green-800">Filters</h2>
              <div className="flex items-center justify-between mb-4">
                {(selectedCategory || selectedUseCases.length > 0) && (
                  <div className="text-sm text-green-700">
                    <span className="font-medium">Active:</span> {[selectedCategory ? 1 : 0, selectedUseCases.length].reduce((a, b) => a + b, 0)}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-green-600 text-green-700 hover:bg-green-50"
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-green-800">Categories</h3>
              <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                {categories.map((category) => (
                  <div key={category.id} className={`flex items-center space-x-2 p-1.5 rounded-md ${selectedCategory === category.slug ? 'bg-green-100' : ''}`}>
                    <Checkbox
                      id={`category-${category.slug}`}
                      checked={selectedCategory === category.slug}
                      onCheckedChange={() =>
                        handleCategoryChange(selectedCategory === category.slug ? "" : category.slug)
                      }
                      className="border-green-400 text-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                    />
                    <Label
                      htmlFor={`category-${category.slug}`}
                      className="text-sm font-normal cursor-pointer text-green-700 w-full"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-green-800">Use Cases</h3>
              <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                {useCases.map((useCase) => (
                  <div 
                    key={useCase.id} 
                    className={`flex items-center justify-between p-1.5 rounded-md ${selectedUseCases.includes(useCase.slug) ? 'bg-green-100' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-5 h-5 rounded-full border ${
                          selectedUseCases.includes(useCase.slug) 
                            ? 'border-green-600 bg-green-600' 
                            : 'border-green-400 bg-white'
                        } flex items-center justify-center cursor-pointer`}
                        onClick={() => handleUseCaseChange(useCase.slug)}
                      >
                        {selectedUseCases.includes(useCase.slug) && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <Label
                        htmlFor={`usecase-${useCase.slug}`}
                        className="text-sm font-medium cursor-pointer text-green-700 select-none"
                        onClick={() => handleUseCaseChange(useCase.slug)}
                      >
                        {useCase.name}
                      </Label>
                    </div>
                    <span className="text-xs rounded-full bg-green-200 text-green-800 px-2 py-1">
                      {useCaseCounts[useCase.slug]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden mb-4 border-green-600 text-green-700 hover:bg-green-50">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="text-green-800">Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  {(selectedCategory || selectedUseCases.length > 0) && (
                    <div className="text-sm text-green-700">
                      <span className="font-medium">Active:</span> {[selectedCategory ? 1 : 0, selectedUseCases.length].reduce((a, b) => a + b, 0)}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-green-600 text-green-700 hover:bg-green-50"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-green-800">Categories</h3>
                  <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                    {categories.map((category) => (
                      <div key={category.id} className={`flex items-center space-x-2 p-1.5 rounded-md ${selectedCategory === category.slug ? 'bg-green-100' : ''}`}>
                        <Checkbox
                          id={`mobile-category-${category.slug}`}
                          checked={selectedCategory === category.slug}
                          onCheckedChange={() =>
                            handleCategoryChange(selectedCategory === category.slug ? "" : category.slug)
                          }
                          className="border-green-400 text-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                        />
                        <Label
                          htmlFor={`mobile-category-${category.slug}`}
                          className="text-sm font-normal cursor-pointer text-green-700 w-full"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-green-800">Use Cases</h3>
                  <div className="space-y-2 bg-green-50 p-4 rounded-lg">
                    {useCases.map((useCase) => (
                      <div 
                        key={useCase.id} 
                        className={`flex items-center justify-between p-1.5 rounded-md ${selectedUseCases.includes(useCase.slug) ? 'bg-green-100' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className={`w-5 h-5 rounded-full border ${
                              selectedUseCases.includes(useCase.slug) 
                                ? 'border-green-600 bg-green-600' 
                                : 'border-green-400 bg-white'
                            } flex items-center justify-center cursor-pointer`}
                            onClick={() => handleUseCaseChange(useCase.slug)}
                          >
                            {selectedUseCases.includes(useCase.slug) && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <Label
                            htmlFor={`mobile-usecase-${useCase.slug}`}
                            className="text-sm font-medium cursor-pointer text-green-700 select-none"
                            onClick={() => handleUseCaseChange(useCase.slug)}
                          >
                            {useCase.name}
                          </Label>
                        </div>
                        <span className="text-xs rounded-full bg-green-200 text-green-800 px-2 py-1">
                          {useCaseCounts[useCase.slug]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-green-800">
                {selectedCategory
                  ? `${categories.find((c) => c.slug === selectedCategory)?.name || "Products"}`
                  : "All Fertilizers"}
              </h1>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-green-700" />
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="h-9 w-[140px] bg-white border-green-200 text-green-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Best Selling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-green-100 p-4 mb-4">
                  <Filter className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-green-800">No products found</h2>
                <p className="text-green-600 mb-6 max-w-md">
                  Try adjusting your filters or search term to find what you're looking for.
                </p>
                <Button variant="outline" onClick={clearFilters} className="border-green-600 text-green-700 hover:bg-green-50">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
