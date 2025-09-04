"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PollCard } from "@/components/polls/poll-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

// Types for our poll data
interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  title: string
  description: string
  options: PollOption[]
  totalVotes: number
  createdAt: string
  expiresAt?: string
  isActive: boolean
  createdBy: string
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, active, closed
  const { user } = useAuth()

  // Fetch polls from Supabase
  const fetchPolls = async () => {
    try {
      setIsLoading(true)
      
      // Fetch polls with their options and vote counts
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select(`
          id,
          title,
          description,
          status,
          expires_at,
          created_at,
          created_by,
          poll_options (
            id,
            text,
            order_index
          )
        `)
        .order('created_at', { ascending: false })

      if (pollsError) {
        console.error('Error fetching polls:', pollsError)
        return
      }

      // Fetch vote counts for each poll
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('poll_id, option_id')

      if (votesError) {
        console.error('Error fetching votes:', votesError)
        return
      }

      // Process the data to match our Poll interface
      const processedPolls: Poll[] = pollsData?.map(poll => {
        const pollVotes = votesData?.filter(vote => vote.poll_id === poll.id) || []
        const optionVoteCounts = pollVotes.reduce((acc, vote) => {
          acc[vote.option_id] = (acc[vote.option_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const options: PollOption[] = poll.poll_options
          ?.sort((a, b) => a.order_index - b.order_index)
          .map(option => ({
            id: option.id,
            text: option.text,
            votes: optionVoteCounts[option.id] || 0
          })) || []

        const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)
        const isActive = poll.status === 'active' && 
          (!poll.expires_at || new Date(poll.expires_at) > new Date())

        return {
          id: poll.id,
          title: poll.title,
          description: poll.description || '',
          options,
          totalVotes,
          createdAt: poll.created_at,
          expiresAt: poll.expires_at || undefined,
          isActive,
          createdBy: poll.created_by
        }
      }) || []

      setPolls(processedPolls)
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) {
      alert('Please log in to vote')
      return
    }

    try {
      // Check if user has already voted on this poll
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single()

      if (existingVote) {
        alert('You have already voted on this poll')
        return
      }

      // Insert the vote
      const { error } = await supabase
        .from('votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: user.id
        })

      if (error) {
        console.error('Error voting:', error)
        alert('Failed to vote. Please try again.')
        return
      }

      // Refresh polls to show updated vote counts
      await fetchPolls()
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    }
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
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-600">Loading polls...</span>
          </div>
        ) : filteredPolls.length === 0 ? (
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
