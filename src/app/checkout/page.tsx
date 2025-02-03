"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../AuthContext"
import { database } from "../firebase"
import { ref, set, onValue, push } from "firebase/database"
import { useRouter } from "next/navigation"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export default function Checkout() {
  const { user, loading } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

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

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const placeOrder = async () => {
    if (user) {
      // Save the order to recent orders
      const ordersRef = ref(database, `orders/${user.uid}`)
      const newOrderRef = push(ordersRef)
      await set(newOrderRef, {
        items: cart,
        total: getTotalPrice(),
        date: new Date().toISOString(),
      })

      // Clear the cart
      await set(ref(database, `carts/${user.uid}`), null)

      // Send email notification
      await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: user.email,
          subject: "Order Confirmation",
          text: `Your order has been placed. Total: $${getTotalPrice().toFixed(2)}`,
        }),
      })

      setOrderPlaced(true)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      {orderPlaced ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Placed!</h2>
          <p>An email confirmation has been sent to your registered email address.</p>
          <button
            onClick={() => router.push("/menu")}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Back to Menu
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-2">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-4 font-bold">Total: ${getTotalPrice().toFixed(2)}</div>
          </div>
          <button onClick={placeOrder} className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
            Place Order
          </button>
        </>
      )}
    </div>
  )
}

