"use client"

import { useEffect } from "react"
import { useAuth } from "../AuthContext"
import { useRouter } from "next/navigation"
import OrderList from "../components/OrderList"

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>You do not have permission to access this page.</p>
        {user && (
          <p className="mt-2">
            Logged in as: {user.email} (Admin: {isAdmin ? "Yes" : "No"})
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <OrderList />
    </div>
  )
}

