"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../AuthContext"
import { database } from "../firebase"
import { ref, set, onValue, push } from "firebase/database"
import { toast } from "react-hot-toast"
import { ShoppingCart, Plus, Minus, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

type MenuItem = {
  id: string
  name: string
  price: number
  description: string
  image: string
}

type CartItem = MenuItem & { quantity: number }

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    price: 12,
    description: "Classic pizza with tomato sauce, mozzarella, and basil",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    name: "Cheeseburger",
    price: 10,
    description: "Juicy beef patty with cheese, lettuce, and tomato",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "3",
    name: "Caesar Salad",
    price: 8,
    description: "Fresh romaine lettuce with Caesar dressing and croutons",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "4",
    name: "French Fries",
    price: 4,
    description: "Crispy golden fries seasoned with salt",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "5",
    name: "Iced Tea",
    price: 3,
    description: "Refreshing iced tea with a slice of lemon",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function Menu() {
  const { user, loading } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    if (user) {
      const cartRef = ref(database, `carts/${user.uid}`)
      onValue(cartRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          setCart(Object.values(data))
        } else {
          setCart([])
        }
      })
    }
  }, [user])

  const addToCart = async (item: MenuItem) => {
    if (!user) {
      toast.error("Please log in to add items to your cart")
      return
    }

    try {
      const existingItem = cart.find((cartItem) => cartItem.id === item.id)
      let updatedCart: CartItem[]
      if (existingItem) {
        updatedCart = cart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        updatedCart = [...cart, { ...item, quantity: 1 }]
      }
      await updateFirebaseCart(updatedCart)
      setCart(updatedCart)
      toast.success(`Added ${item.name} to cart`)
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add item to cart. Please try again.")
    }
  }

  const removeFromCart = async (itemId: string) => {
    if (!user) {
      toast.error("Please log in to remove items from your cart")
      return
    }

    try {
      const updatedCart = cart
        .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)

      await updateFirebaseCart(updatedCart)
      setCart(updatedCart)
      toast.success("Item removed from cart")
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast.error("Failed to remove item from cart. Please try again.")
    }
  }

  const updateFirebaseCart = async (updatedCart: CartItem[]) => {
    if (user) {
      await set(ref(database, `carts/${user.uid}`), updatedCart)
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please log in to checkout")
      return
    }

    setIsCheckingOut(true)

    try {
      // Save the order to recent orders
      const ordersRef = ref(database, `orders/${user.uid}`)
      const newOrderRef = push(ordersRef)
      const orderData = {
        items: cart,
        total: getTotalPrice(),
        date: new Date().toISOString(),
        userEmail: user.email,
        isCompleted: false, // Add this line
      }
      await set(newOrderRef, orderData)

      // Clear the cart
      await set(ref(database, `carts/${user.uid}`), null)
      setCart([])

      // Send email confirmation
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: user.email,
          subject: "Order Confirmation - Gourmet Express",
          text: `Thank you for your order!

Order Details:
${orderData.items.map((item) => `${item.name} x ${item.quantity}: $${(item.price * item.quantity).toFixed(2)}`).join("\n")}

Total: $${orderData.total.toFixed(2)}

Thank you for choosing Gourmet Express!`,
        }),
      })

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json()
        console.error("Failed to send email confirmation:", errorData)
        throw new Error("Failed to send email confirmation")
      }

      setOrderPlaced(true)
      toast.success("Order placed successfully! Check your email for confirmation.")

      // Reset the checkout state after a delay
      setTimeout(() => {
        setIsCheckingOut(false)
        setOrderPlaced(false)
      }, 3000)
    } catch (error) {
      console.error("Error during checkout:", error)
      toast.error("Failed to place order. Please try again.")
      setIsCheckingOut(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Our Menu</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative w-full h-48">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} layout="fill" objectFit="cover" />
            </div>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
              <span className="text-lg font-semibold">${item.price.toFixed(2)}</span>
              <Button onClick={() => addToCart(item)} variant="default">
                <Plus size={16} className="mr-1" /> Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Button variant="outline" size="sm" onClick={() => removeFromCart(item.id)}>
                      <Minus size={16} />
                    </Button>
                    <span className="mx-2">{item.quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => addToCart(item)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator className="my-4" />
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-bold">Total: ${getTotalPrice().toFixed(2)}</span>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || orderPlaced}
                  className={`${(isCheckingOut || orderPlaced) && "opacity-50 cursor-not-allowed"}`}
                >
                  {orderPlaced ? (
                    <>
                      <Check size={16} className="mr-2" /> Order Placed
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} className="mr-2" /> {isCheckingOut ? "Processing..." : "Checkout"}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

