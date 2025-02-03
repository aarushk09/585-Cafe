"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../AuthContext"
import { database } from "../firebase"
import { ref, onValue, set } from "firebase/database"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { RefreshCw } from "lucide-react"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type Order = {
  id: string
  items: CartItem[]
  total: number
  date: string
}

export default function RecentOrders() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const ordersRef = ref(database, `orders/${user.uid}`)
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const ordersArray = Object.entries(data).map(([id, order]) => ({
            id,
            ...(order as Order),
          }))
          setOrders(ordersArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        } else {
          setOrders([])
        }
      })
    }
  }, [user])

  const reorder = async (order: Order) => {
    if (user) {
      try {
        // Add items to the cart
        await set(ref(database, `carts/${user.uid}`), order.items)
        toast.success("Items added to cart")
        router.push("/menu")
      } catch (error) {
        console.error("Error reordering:", error)
        toast.error("Failed to reorder. Please try again.")
      }
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-700">Recent Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No recent orders</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">Order Date: {new Date(order.date).toLocaleString()}</span>
                <span className="font-bold text-lg text-indigo-700">Total: ${order.total.toFixed(2)}</span>
              </div>
              <ul className="mb-4 space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => reorder(order)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center w-full"
              >
                <RefreshCw size={16} className="mr-2" /> Reorder
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

