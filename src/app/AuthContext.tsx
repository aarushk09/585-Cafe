"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { auth, database } from "./firebase"
import { ref, get } from "firebase/database"
import { isAdmin as checkIsAdmin } from "./utils/adminUtils"

type AuthContextType = {
  user: User | null
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false })

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        console.log("User authenticated:", user.email)
        const userRef = ref(database, `users/${user.uid}`)
        try {
          const snapshot = await get(userRef)
          if (snapshot.exists()) {
            const userData = snapshot.val()
            console.log("User data from database:", userData)
            setIsAdmin(userData.isAdmin === true || (user.email !== null && checkIsAdmin(user.email)))
          } else {
            console.log("User data does not exist in database")
            setIsAdmin(user.email ? checkIsAdmin(user.email) : false)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setIsAdmin(user.email ? checkIsAdmin(user.email) : false)
        }
      } else {
        console.log("No user authenticated")
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading, isAdmin }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

