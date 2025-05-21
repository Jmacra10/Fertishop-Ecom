import type { Product, Category, UseCase, Order } from "@/lib/types"

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Organic Fertilizers",
    slug: "organic",
    image: "/images/products/organic-category.jpg",
  },
  {
    id: "cat-2",
    name: "Soil Enhancers",
    slug: "soil-enhancer",
    image: "/images/products/soil-enhancer-category.png",
  },
  {
    id: "cat-3",
    name: "Plant Nutrients",
    slug: "plant-nutrients",
    image: "/images/products/plant-nutrients-category.jpg",
  },
  {
    id: "cat-4",
    name: "Growth Boosters",
    slug: "growth-booster",
    image: "/images/products/growth-booster-category.jpg",
  },
]

export const useCases: UseCase[] = [
  { id: "use-1", name: "For Yellow Leaves", slug: "yellow-leaves" },
  { id: "use-2", name: "Root Growth", slug: "root-growth" },
  { id: "use-3", name: "Boost Production", slug: "boost-production" },
  { id: "use-4", name: "Soil Health", slug: "soil-health" },
  { id: "use-5", name: "Pest Control", slug: "pest-control" },
  { id: "use-6", name: "Disease Control", slug: "disease-control" },
  { id: "use-7", name: "Nutrient Deficiency", slug: "nutrient-deficiency" },
  { id: "use-8", name: "Drought Resistance", slug: "drought-resistance" },
]

export const products: Product[] = [
  // ORGANIC FERTILIZERS - 3 products
  {
    id: "prod-1",
    name: "EcoRich Organic Compost",
    description:
      "Premium organic compost made from plant materials. Improves soil structure and provides essential nutrients for healthy plant growth. TREATS: Poor soil structure, nutrient deficiency, and low microbial activity.",
    price: 349,
    category: "organic",
    useCase: ["soil-health", "root-growth", "nutrient-deficiency"],
    image: "/images/products/product-organic-compost.jpg",
    soldCount: 1423,
    stock: 50,
    treatmentFor: "Poor soil structure and nutrient deficiency",
  },
  {
    id: "prod-2",
    name: "BioGrow Worm Castings",
    description:
      "100% pure worm castings that improve soil aeration and drainage. TREATS: Compacted soil, poor water retention, and lack of beneficial microorganisms.",
    price: 499,
    category: "organic",
    useCase: ["soil-health", "root-growth"],
    image: "/images/products/product-worm-castings.jpeg",
    soldCount: 982,
    stock: 35,
    treatmentFor: "Compacted soil and poor water retention",
  },
  {
    id: "prod-3",
    name: "NatureFeed Bone Meal",
    description:
      "Phosphorus-rich organic fertilizer made from ground animal bones. TREATS: Phosphorus deficiency, poor flowering, and weak root development.",
    price: 299,
    category: "organic",
    useCase: ["root-growth", "boost-production", "nutrient-deficiency"],
    image: "/images/products/product-bone-meal-new.jpg",
    soldCount: 756,
    stock: 42,
    treatmentFor: "Phosphorus deficiency and poor flowering",
  },

  // SOIL ENHANCERS - 3 products
  {
    id: "prod-7",
    name: "SoilRevive pH Balancer",
    description:
      "Balances soil pH levels for optimal nutrient availability. TREATS: Acidic or alkaline soil conditions that prevent nutrient uptake.",
    price: 499,
    category: "soil-enhancer",
    useCase: ["soil-health", "nutrient-deficiency"],
    image: "/images/products/product-ph-balancer.jpg",
    soldCount: 832,
    stock: 38,
    treatmentFor: "Acidic or alkaline soil conditions",
  },
  {
    id: "prod-8",
    name: "RootMaster Pro",
    description:
      "Specialized formula designed to enhance root development. TREATS: Poor root establishment, transplant shock, and stunted growth.",
    price: 599,
    category: "soil-enhancer",
    useCase: ["root-growth"],
    image: "/images/products/product-rootmaster.jpg",
    soldCount: 756,
    stock: 42,
    treatmentFor: "Poor root establishment and transplant shock",
  },
  {
    id: "prod-9",
    name: "MoistureMax Water Retention Granules",
    description:
      "Polymer crystals that absorb and slowly release water in soil. TREATS: Drought stress, inconsistent watering, and excessive water runoff.",
    price: 649,
    category: "soil-enhancer",
    useCase: ["drought-resistance", "soil-health"],
    image: "/images/products/product-moisture-retention-new.jpg",
    soldCount: 543,
    stock: 30,
    treatmentFor: "Drought stress and inconsistent watering",
  },

  // PLANT NUTRIENTS - 3 products
  {
    id: "prod-6",
    name: "LeafShine Foliar Spray",
    description:
      "Nutrient-rich foliar spray absorbed directly through leaves. TREATS: Yellowing leaves, nutrient deficiencies, and slow growth.",
    price: 450,
    category: "plant-nutrients",
    useCase: ["yellow-leaves", "nutrient-deficiency"],
    image: "/images/products/plant-nutrients/LeafShine Foliar Spray.webp",
    soldCount: 1205,
    stock: 28,
    treatmentFor: "Yellowing leaves and nutrient deficiencies",
  },
  {
    id: "prod-12",
    name: "IronBoost Chelated Iron",
    description:
      "Highly available form of iron for plants. TREATS: Chlorosis (yellowing between leaf veins), iron deficiency, and poor chlorophyll production.",
    price: 399,
    category: "plant-nutrients",
    useCase: ["yellow-leaves", "nutrient-deficiency"],
    image: "/images/products/plant-nutrients/IronBoost Chelated Iron.jpg",
    soldCount: 876,
    stock: 40,
    treatmentFor: "Chlorosis and iron deficiency",
  },
  {
    id: "prod-13",
    name: "MicroNutrient Complete Mix",
    description:
      "Balanced blend of essential micronutrients. TREATS: Multiple micronutrient deficiencies, stunted growth, and poor plant development.",
    price: 549,
    category: "plant-nutrients",
    useCase: ["nutrient-deficiency", "yellow-leaves"],
    image: "/images/products/plant-nutrients/MicroNutrient Complete Mix.jpg",
    soldCount: 654,
    stock: 35,
    treatmentFor: "Multiple micronutrient deficiencies and stunted growth",
  },

  // GROWTH BOOSTERS - 3 products
  {
    id: "prod-14",
    name: "HarvestMax Yield Booster",
    description:
      "Specialized formula to increase flower and fruit production. TREATS: Low yield, poor fruit set, and inadequate flowering.",
    price: 699,
    category: "growth-booster",
    useCase: ["boost-production", "yellow-leaves", "nutrient-deficiency"],
    image: "/images/products/growth-boosters/HarvestMax Yield Booster.webp",
    soldCount: 982,
    stock: 35,
    treatmentFor: "Low yield and poor fruit set",
  },
  {
    id: "prod-10",
    name: "BloomBoost Flowering Stimulant",
    description:
      "Encourages abundant flowering and fruit setting. TREATS: Lack of flowers, bud drop, and poor fruit development.",
    price: 599,
    category: "growth-booster",
    useCase: ["boost-production"],
    image: "/images/products/growth-boosters/BloomBoost Flowering Stimulant.jpg",
    soldCount: 543,
    stock: 25,
    treatmentFor: "Lack of flowers and bud drop",
  },
  {
    id: "prod-11",
    name: "FruitBoost Fruiting Formula",
    description:
      "Targeted nutrition for fruit trees and fruiting plants. TREATS: Poor fruit size, low sugar content, and premature fruit drop.",
    price: 649,
    category: "growth-booster",
    useCase: ["boost-production"],
    image: "/images/products/growth-boosters/FruitBoost Fruiting Formula.jpg",
    soldCount: 876,
    stock: 15,
    treatmentFor: "Poor fruit size and premature fruit drop",
  },
]

export const mockOrders: Order[] = [
  {
    id: "order-1",
    userId: "user-1",
    items: [
      {
        productId: "prod-1",
        name: "EcoRich Organic Compost",
        price: 349,
        quantity: 2,
        image: "/images/products/product-organic-compost.jpg"
      },
      {
        productId: "prod-6",
        name: "LeafShine Foliar Spray",
        price: 450,
        quantity: 1,
        image: "/images/products/plant-nutrients/LeafShine Foliar Spray.webp"
      },
    ],
    total: 1148,
    status: "to-ship",
    createdAt: "2023-11-15T08:30:00Z",
    address: {
      fullName: "Demo User",
      street: "123 Sample St.",
      city: "Manila",
      zip: "1000",
      phone: "09123456789",
    },
    paymentMethod: "gcash",
  },
  {
    id: "order-2",
    userId: "user-1",
    items: [
      {
        productId: "prod-5",
        name: "RootMaster Pro",
        price: 399,
        quantity: 1,
        image: "/images/products/product-rootmaster.jpg"
      },
    ],
    total: 399,
    status: "completed",
    createdAt: "2023-10-20T14:45:00Z",
    address: {
      fullName: "Demo User",
      street: "123 Sample St.",
      city: "Manila",
      zip: "1000",
      phone: "09123456789",
    },
    paymentMethod: "cod",
  },
]

// Helper function to format price in Philippine Peso
export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return '₱0.00';
  }
  
  return `₱${numericPrice.toLocaleString("en-PH")}`
}

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

// Helper function to get related products
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.useCase.some((uc) => product.useCase.includes(uc))),
    )
    .slice(0, limit)
}

// Helper function to get featured products
export function getFeaturedProducts(limit = 6): Product[] {
  return [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, limit)
}

// Helper function to filter products by category and use case
export function filterProducts(categorySlug?: string, useCaseSlug?: string): Product[] {
  return products.filter((product) => {
    const matchesCategory = !categorySlug || product.category === categorySlug
    const matchesUseCase = !useCaseSlug || product.useCase.includes(useCaseSlug)
    return matchesCategory && matchesUseCase
  })
}

// Helper function to get products by category
export function getProductsByCategory(categorySlug: string, limit = 6): Product[] {
  return products
    .filter((product) => product.category === categorySlug)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit)
}
