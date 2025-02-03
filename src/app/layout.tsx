import { AuthProvider } from "./AuthContext"
import Navbar from "./components/Navbar"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "585 Cafe",
  description: "Order your favorite meals with ease",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`} suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  )
}

