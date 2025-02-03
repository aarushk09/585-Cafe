"use client"

import Link from "next/link"
import { useAuth } from "../AuthContext"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import { useRouter } from "next/navigation"
import { LogOut, Coffee } from "lucide-react"

export default function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="bg-indigo-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <Coffee className="mr-2" />
          585 Cafe
        </Link>
        <div className="space-x-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/menu" className="hover:text-indigo-200 transition-colors">
                    Menu
                  </Link>
                  <Link href="/recent-orders" className="hover:text-indigo-200 transition-colors">
                    Recent Orders
                  </Link>
                  <button onClick={handleSignOut} className="hover:text-indigo-200 transition-colors">
                    <LogOut className="inline-block" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-indigo-200 transition-colors">
                    Log In
                  </Link>
                  <Link href="/signup" className="hover:text-indigo-200 transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

