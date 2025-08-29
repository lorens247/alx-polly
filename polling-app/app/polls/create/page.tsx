"use client"

import { CreatePollForm } from "@/components/polls/create-poll-form"

export default function CreatePollPage() {
  const handleCreatePoll = async (data: {
    title: string
    description: string
    options: string[]
    expiresAt?: string
  }) => {
    // TODO: Implement poll creation logic
    console.log("Creating poll:", data)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create New Poll</h1>
          <p className="text-gray-600 mt-2">
            Design a poll that others can vote on
          </p>
        </div>
        
        <CreatePollForm onSubmit={handleCreatePoll} />
        
        <div className="mt-8 text-center">
          <a 
            href="/polls" 
            className="text-primary hover:text-primary/80 font-medium"
          >
            ← Back to Polls
          </a>
        </div>
      </div>
    </div>
  )
}
