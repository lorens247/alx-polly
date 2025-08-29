"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PollCard } from "@/components/polls/poll-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for demonstration
const mockPolls = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Vote for the programming language you enjoy working with the most",
    options: [
      { id: "1-1", text: "JavaScript/TypeScript", votes: 45 },
      { id: "1-2", text: "Python", votes: 38 },
      { id: "1-3", text: "Java", votes: 22 },
      { id: "1-4", text: "C++", votes: 15 }
    ],
    totalVotes: 120,
    createdAt: "2024-01-15T10:00:00Z",
    expiresAt: "2024-02-15T10:00:00Z",
    isActive: true
  },
  {
    id: "2",
    title: "Which framework should we use for the next project?",
    description: "Help us decide on the best framework for our upcoming web application",
    options: [
      { id: "2-1", text: "Next.js", votes: 28 },
      { id: "2-2", text: "React", votes: 25 },
      { id: "2-3", text: "Vue.js", votes: 18 },
      { id: "2-4", text: "Angular", votes: 12 }
    ],
    totalVotes: 83,
    createdAt: "2024-01-14T14:30:00Z",
    isActive: true
  }
]

export default function PollsPage() {
  const [polls, setPolls] = useState(mockPolls)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (pollId: string, optionId: string) => {
    // TODO: Implement voting logic
    console.log(`Voting for option ${optionId} in poll ${pollId}`)
    
    // Mock vote update
    setPolls(prevPolls => 
      prevPolls.map(poll => {
        if (poll.id === pollId) {
          return {
            ...poll,
            options: poll.options.map(option => 
              option.id === optionId 
                ? { ...option, votes: option.votes + 1 }
                : option
            ),
            totalVotes: poll.totalVotes + 1
          }
        }
        return poll
      })
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Polls</h1>
            <p className="text-gray-600 mt-2">
              Vote on current polls and see what others think
            </p>
          </div>
          <Button asChild>
            <a href="/polls/create">Create New Poll</a>
          </Button>
        </div>
      </div>

      {polls.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CardDescription className="text-lg">
              No polls available at the moment.
            </CardDescription>
            <Button asChild className="mt-4">
              <a href="/polls/create">Create the first poll</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={handleVote}
              canVote={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
