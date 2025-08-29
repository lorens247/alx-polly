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
  },
  {
    id: "3",
    title: "What's your preferred database for web apps?",
    description: "Choose the database technology you're most comfortable with",
    options: [
      { id: "3-1", text: "PostgreSQL", votes: 35 },
      { id: "3-2", text: "MongoDB", votes: 28 },
      { id: "3-3", text: "MySQL", votes: 20 },
      { id: "3-4", text: "SQLite", votes: 12 }
    ],
    totalVotes: 95,
    createdAt: "2024-01-13T09:15:00Z",
    isActive: true
  },
  {
    id: "4",
    title: "Which cloud platform do you prefer?",
    description: "Select your favorite cloud hosting platform",
    options: [
      { id: "4-1", text: "AWS", votes: 42 },
      { id: "4-2", text: "Google Cloud", votes: 25 },
      { id: "4-3", text: "Azure", votes: 20 },
      { id: "4-4", text: "Vercel", votes: 18 }
    ],
    totalVotes: 105,
    createdAt: "2024-01-12T16:45:00Z",
    isActive: true
  }
]

export default function PollsPage() {
  const [polls, setPolls] = useState(mockPolls)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState("all") // all, active, closed

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

  const filteredPolls = polls.filter(poll => {
    if (filter === "active") return poll.isActive
    if (filter === "closed") return !poll.isActive
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Active Polls
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Vote on current polls and see what others think. Make your voice heard!
          </p>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === "all" 
                  ? "btn-primary" 
                  : "btn-ghost"
              }`}
            >
              All Polls ({polls.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === "active" 
                  ? "btn-success" 
                  : "btn-ghost"
              }`}
            >
              Active ({polls.filter(p => p.isActive).length})
            </button>
            <button
              onClick={() => setFilter("closed")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                filter === "closed" 
                  ? "btn-warning" 
                  : "btn-ghost"
              }`}
            >
              Closed ({polls.filter(p => !p.isActive).length})
            </button>
          </div>
          
          {/* Create Poll Button */}
          <div className="mb-8">
            <Button 
              asChild 
              className="btn-primary text-lg px-8 py-4"
            >
              <a href="/polls/create">
                ✨ Create New Poll
              </a>
            </Button>
          </div>
        </div>

        {/* Polls Grid */}
        {filteredPolls.length === 0 ? (
          <Card className="card-gradient max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">📊</div>
              <CardDescription className="text-xl mb-6">
                {filter === "all" 
                  ? "No polls available at the moment."
                  : filter === "active" 
                    ? "No active polls right now."
                    : "No closed polls to display."
                }
              </CardDescription>
              <Button asChild className="btn-primary">
                <a href="/polls/create">Create the first poll</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {filteredPolls.map((poll, index) => (
              <div 
                key={poll.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PollCard
                  poll={poll}
                  onVote={handleVote}
                  canVote={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {polls.length}
              </div>
              <div className="text-gray-600">Total Polls</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {polls.filter(p => p.isActive).length}
              </div>
              <div className="text-gray-600">Active Polls</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {polls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
              </div>
              <div className="text-gray-600">Total Votes</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {polls.reduce((sum, poll) => sum + poll.options.length, 0)}
              </div>
              <div className="text-gray-600">Total Options</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
