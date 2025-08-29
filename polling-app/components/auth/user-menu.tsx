"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  id: string
  name: string
  email: string
}

interface UserMenuProps {
  user: User
  onLogout: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block">{user.name}</span>
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-64 z-50">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Profile Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                My Polls
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Voting History
              </Button>
            </div>
            
            <div className="pt-2 border-t">
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={onLogout}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
