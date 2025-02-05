"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../AuthContext"
import { database } from "../firebase"
import { ref, get, set } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type React from "react" // Added import for React

export default function Profile() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [gradeLevel, setGradeLevel] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      const userRef = ref(database, `users/${user.uid}`)
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val()
            setFirstName(userData.firstName || "")
            setLastName(userData.lastName || "")
            setGradeLevel(userData.gradeLevel || "")
          }
        })
        .catch(() => {
          toast.error("Failed to load profile data. Please try again.")
        })
    }
  }, [user, loading, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        firstName,
        lastName,
        gradeLevel,
      })
      toast.success("Profile updated successfully")
    } catch {
      toast.error("Failed to update profile. Please try again.")
    }
  }

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">9th Grade</SelectItem>
                  <SelectItem value="10">10th Grade</SelectItem>
                  <SelectItem value="11">11th Grade</SelectItem>
                  <SelectItem value="12">12th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

