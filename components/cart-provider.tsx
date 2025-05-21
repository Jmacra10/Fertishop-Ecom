"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "./auth-provider"
import { cartAPI } from "@/lib/api"
import type { Product } from "@/lib/types"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  stock: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  subtotal: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false) 
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  // Set mounted state to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync cart with backend when user logs in or out
  useEffect(() => {
    // Skip if not mounted (prevents SSR fetch attempts)
    if (!mounted) return;
    
    const syncCart = async () => {
      if (authLoading) return;
      
      if (user) {
        // User logged in - merge local cart with server cart
        await fetchCartFromServer();
      } else if (!authLoading) {
        // User not logged in - load from localStorage
        loadCartFromLocalStorage();
      }
    };
    
    syncCart();
  }, [user, authLoading, mounted]);

  // Save cart to localStorage for guest users
  useEffect(() => {
    // Skip if not mounted (prevents SSR localStorage errors)
    if (!mounted) return;
    
    if (!user && !authLoading) {
      saveCartToLocalStorage();
    }
  }, [items, user, authLoading, mounted]);

  // Function to fetch cart from server
  const fetchCartFromServer = async () => {
    try {
      setIsLoading(true);
      const cartItems = await cartAPI.getItems();
      
      if (cartItems.length > 0) {
        // Server cart has items, use it
        setItems(cartItems);
      } else {
        // Server cart is empty, check if we have local items to sync
        const storedCart = localStorage.getItem("fertishop-cart");
        if (storedCart) {
          const localItems: CartItem[] = JSON.parse(storedCart);
          if (localItems.length > 0) {
            // Sync local items to server
            await syncLocalCartToServer(localItems);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching cart from server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sync local cart to server
  const syncLocalCartToServer = async (localItems: CartItem[]) => {
    if (!user) return;

    try {
      // Clear server cart first
      await cartAPI.clearCart();
      
      // Add each local item to server cart
      for (const item of localItems) {
        await cartAPI.addItem(item.id, item.quantity);
      }
      
      // Fetch updated cart from server
      const updatedCart = await cartAPI.getItems();
      setItems(updatedCart);
      
      // Clear local storage cart after sync
      localStorage.removeItem("fertishop-cart");
      
      toast({
        title: "Cart synced",
        description: "Your cart has been synced with your account",
      });
    } catch (error) {
      console.error("Error syncing local cart to server:", error);
    }
  };

  // Function to load cart from localStorage
  const loadCartFromLocalStorage = () => {
    try {
      const storedCart = localStorage.getItem("fertishop-cart");
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  };

  // Function to save cart to localStorage
  const saveCartToLocalStorage = () => {
    try {
      localStorage.setItem("fertishop-cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      setIsLoading(true);

      if (user) {
        // Add to cart using API
        console.log(`Adding product ${product.id} to cart for authenticated user`);
        
        try {
          // Ensure we're using a consistent product ID format
          // Convert any product ID to a numeric ID that the backend can handle
          let productId = product.id;
          
          // Check if ID is valid (must be 'prod-X' format for API to work)
          if (!productId.startsWith('prod-')) {
            console.error(`Invalid product ID format: ${productId}`);
            throw new Error(`Invalid product ID format: ${productId}`);
          }
          
          await cartAPI.addItem(productId, quantity);
          
          // Refresh cart
          const cartItems = await cartAPI.getItems();
          setItems(cartItems);
          
          // Show success toast
          toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart`,
          });
        } catch (error) {
          console.error("Error adding to cart:", error);
          
          // Show specific error message
          let errorMessage = "Could not add item to cart";
          
          if (error instanceof Error) {
            if (error.message.includes("Invalid product ID format")) {
              errorMessage = "Invalid product format. Please try again.";
            } else if (error.message.includes("Product not found")) {
              errorMessage = "This product could not be found in our database.";
            } else if (error.message.includes("Invalid or expired token")) {
              // Redirect to login for auth errors
              toast({
                variant: "destructive",
                title: "Authentication error",
                description: "Please log in again to continue shopping",
              });
              
              if (typeof window !== 'undefined') {
                localStorage.setItem("fertishop-redirect", window.location.pathname);
                window.location.href = "/login";
              }
              return;
            }
          }
          
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          });
          
          return; // Exit early
        }
      } else {
        // Guest user - add to local cart
        console.log(`Adding product ${product.id} to local cart for guest user`);
        setItems((prevItems) => {
          const existingItem = prevItems.find((item) => item.id === product.id);

          if (existingItem) {
            // Update quantity if item already exists
            return prevItems.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            );
          } else {
            // Add new item
            return [
              ...prevItems,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.image || "/placeholder.svg",
                stock: product.stock
              }
            ];
          }
        });
        
        // Show success toast for guest users
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        });
      }
    } catch (error) {
      console.error("Unexpected error adding to cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add item to cart. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setIsLoading(true);

      if (user) {
        // Remove from cart using API
        await cartAPI.removeItem(productId);
        
        // Refresh cart
        const cartItems = await cartAPI.getItems();
        setItems(cartItems);
      } else {
        // Guest user - remove from local cart
        setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not remove item from cart",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setIsLoading(true);

      if (quantity <= 0) {
        return removeFromCart(productId);
      }

      if (user) {
        // Update quantity using API
        await cartAPI.updateQuantity(productId, quantity);
        
        // Refresh cart
        const cartItems = await cartAPI.getItems();
        setItems(cartItems);
      } else {
        // Guest user - update local cart
        setItems((prevItems) => 
          prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
        );
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update cart",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);

      if (user) {
        // Clear cart using API
        await cartAPI.clearCart();
        setItems([]);
      } else {
        // Guest user - clear local cart
        setItems([]);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not clear cart",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  // Always provide the context regardless of mounted state
  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
