import { AuthForm } from "@/components/auth/auth-form"

export default function RegisterPage() {
  const handleRegister = async (data: { email: string; password: string; name?: string }) => {
    // TODO: Implement registration logic
    console.log("Registration attempt:", data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join us and start creating polls
          </p>
        </div>
        
        <AuthForm 
          mode="register" 
          onSubmit={handleRegister}
        />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/auth/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
