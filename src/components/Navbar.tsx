"use client"

import Link from "next/link"
import { useAuth } from "../AuthContext"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import { useRouter } from "next/navigation"
import { User, LogOut, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800 flex items-center">
          <Coffee className="mr-2 text-blue-600" />
           585 Cafe
        </Link>
        <div className="space-x-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/menu">Menu</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/recent-orders">Recent Orders</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button variant="default" asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

