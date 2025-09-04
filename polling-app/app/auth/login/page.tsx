"use client"

import { AuthForm } from "@/components/auth/auth-form"

export default function LoginPage() {
  const handleLogin = async (data: { email: string; password: string; name?: string }) => {
    // TODO: Implement login logic
    console.log("Login attempt:", data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        
        <AuthForm 
          mode="login" 
          onSubmit={handleLogin}
        />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/auth/register" className="font-medium text-primary hover:text-primary/80">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
