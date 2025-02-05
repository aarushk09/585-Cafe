"use client"

import { useState, useEffect } from "react"
import { database } from "@/app/firebase"
import { ref, get, update } from "firebase/database"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Check, Clock } from "lucide-react"
import { useAuth } from "@/app/AuthContext"


type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type Order = {
  id: string
  userId: string
  userEmail: string
  items: OrderItem[]
  total: number
  date: string
  isCompleted: boolean
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAdmin } = useAuth()

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders()
    }
  }, [user, isAdmin])

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    const ordersRef = ref(database, "orders")
    try {
      const snapshot = await get(ordersRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        const orderList = Object.entries(data).flatMap(([userId, userOrders]) =>
          Object.entries(userOrders as { [key: string]: Order }).map(([orderId, order]) => ({
            ...order,
            id: orderId,
            userId,
          })),
        )
        const incompleteOrders = orderList.filter((order) => !order.isCompleted)
        setOrders(incompleteOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please check your permissions and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteOrder = async (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  const confirmCompleteOrder = async () => {
    if (!selectedOrder) return

    try {
      await update(ref(database, `orders/${selectedOrder.userId}/${selectedOrder.id}`), {
        isCompleted: true,
      })
      await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedOrder.userEmail,
          subject: "Your order is ready for pickup!",
          text: `Your order is ready for pickup! Thank you for using our service.`,
        }),
      })
      toast.success("Order completed and email sent")
      setOrders(orders.filter((order) => order.id !== selectedOrder.id))
    } catch (error) {
      console.error("Error completing order:", error)
      toast.error("Failed to complete order")
    }

    setIsDialogOpen(false)
    setSelectedOrder(null)
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading orders...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  if (orders.length === 0) {
    return <div className="text-center py-10">No pending orders at the moment.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {orders.map((order) => (
        <Card key={order.id} className="w-full max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-xl font-bold mb-2">Order #{order.id.slice(0, 8)}</h3>
              <p className="text-sm text-gray-600 mb-1">Email: {order.userEmail}</p>
              <p className="text-sm text-gray-600 mb-1">Date: {new Date(order.date).toLocaleString()}</p>
              <div className="flex items-center text-sm text-yellow-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>Pending</span>
              </div>
            </div>
            <ul className="mb-4">
              {order.items.map((item, index) => (
                <li key={index} className="flex justify-between text-sm mb-2">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-4">
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleCompleteOrder(order)}
            >
              <Check className="mr-2 h-4 w-4" /> Complete Order
            </Button>
          </CardFooter>
        </Card>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete this order? An email will be sent to the customer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCompleteOrder}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

