export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  useCase: string[]
  image: string
  soldCount: number
  stock: number
  treatmentFor: string
}

export type Category = {
  id: string
  name: string
  slug: string
  image: string
}

export type UseCase = {
  id: string
  name: string
  slug: string
}

export type Order = {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: "to-pay" | "to-ship" | "to-receive" | "completed"
  createdAt: string
  address: {
    fullName: string
    street: string
    city: string
    zip: string
    phone: string
  }
  paymentMethod: "gcash" | "cod"
}

export type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export type CartItem = {
  id: string
  productId: string
  quantity: number
  product: Product
}
