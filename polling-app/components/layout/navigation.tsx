"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"

// Mock user data - replace with actual auth state
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com"
}

export function Navigation() {
  const [isAuthenticated] = useState(true) // Replace with actual auth state

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logging out...")
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PollApp</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/polls" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse Polls
            </Link>
            <Link 
              href="/polls/create" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Create Poll
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserMenu user={mockUser} onLogout={handleLogout} />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
