"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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

export default function PollDetailsPage() {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const pollId = params.id as string

  // Fetch single poll from Supabase
  const fetchPoll = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch poll with its options
      const { data: pollData, error: pollError } = await supabase
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
        .eq('id', pollId)
        .single()

      if (pollError) {
        console.error('Error fetching poll:', pollError)
        setError('Poll not found')
        return
      }

      // Fetch vote counts for this poll
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('poll_id, option_id')

      if (votesError) {
        console.error('Error fetching votes:', votesError)
        setError('Failed to load poll data')
        return
      }

      // Check if current user has voted
      if (user) {
        const { data: userVote } = await supabase
          .from('votes')
          .select('option_id')
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
          .single()
        
        if (userVote) {
          setHasVoted(true)
          setSelectedOption(userVote.option_id)
        }
      }

      // Process the data to match our Poll interface
      const pollVotes = votesData?.filter(vote => vote.poll_id === pollId) || []
      const optionVoteCounts = pollVotes.reduce((acc, vote) => {
        acc[vote.option_id] = (acc[vote.option_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const options: PollOption[] = pollData.poll_options
        ?.sort((a, b) => a.order_index - b.order_index)
        .map(option => ({
          id: option.id,
          text: option.text,
          votes: optionVoteCounts[option.id] || 0
        })) || []

      const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)
      const isActive = pollData.status === 'active' && 
        (!pollData.expires_at || new Date(pollData.expires_at) > new Date())

      const processedPoll: Poll = {
        id: pollData.id,
        title: pollData.title,
        description: pollData.description || '',
        options,
        totalVotes,
        createdAt: pollData.created_at,
        expiresAt: pollData.expires_at || undefined,
        isActive,
        createdBy: pollData.created_by
      }

      setPoll(processedPoll)
    } catch (error) {
      console.error('Error fetching poll:', error)
      setError('Failed to load poll')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (pollId) {
      fetchPoll()
    }
  }, [pollId, user])

  const handleVote = async () => {
    if (!user) {
      alert('Please log in to vote')
      return
    }

    if (!selectedOption) {
      alert('Please select an option')
      return
    }

    try {
      // Insert the vote
      const { error } = await supabase
        .from('votes')
        .insert({
          poll_id: pollId,
          option_id: selectedOption,
          user_id: user.id
        })

      if (error) {
        console.error('Error voting:', error)
        alert('Failed to vote. Please try again.')
        return
      }

      setHasVoted(true)
      // Refresh poll to show updated vote counts
      await fetchPoll()
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    }
  }

  const getVotePercentage = (votes: number) => {
    if (!poll || poll.totalVotes === 0) return 0
    return Math.round((votes / poll.totalVotes) * 100)
  }

  const getStatusColor = () => {
    if (!poll) return "bg-gray-100 text-gray-800 border-gray-200"
    if (!poll.isActive) return "bg-red-100 text-red-800 border-red-200"
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
    return "bg-green-100 text-green-800 border-green-200"
  }

  const getStatusText = () => {
    if (!poll) return "Loading..."
    if (!poll.isActive) return "Closed"
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return "Expired"
    }
    return "Active"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading poll details...</p>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-16 text-center">
            <div className="text-6xl mb-4">❌</div>
            <CardTitle className="text-xl mb-4">Poll Not Found</CardTitle>
            <CardDescription className="mb-6">
              {error || "The poll you're looking for doesn't exist or has been removed."}
            </CardDescription>
            <div className="space-y-3">
              <Button onClick={() => router.back()} className="btn-outline w-full">
                ← Go Back
              </Button>
              <Button asChild className="btn-primary w-full">
                <a href="/polls">Browse All Polls</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="btn-outline"
          >
            ← Back to Polls
          </Button>
        </div>

        {/* Poll Details */}
        <div className="max-w-4xl mx-auto">
          <Card className="card-gradient">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-6">
                  <CardTitle className="text-3xl text-gray-900 mb-3">
                    {poll.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 mb-4">
                    {poll.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-3">
                  <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor()}`}>
                    {getStatusText()}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{poll.totalVotes}</div>
                    <div className="text-sm text-gray-500">total votes</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Poll Options */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Poll Options</h3>
                {poll.options.map((option) => {
                  const percentage = getVotePercentage(option.votes)
                  const isSelected = selectedOption === option.id
                  
                  return (
                    <div key={option.id} className="space-y-3">
                      <div className="flex items-center space-x-4">
                        {poll.isActive && !hasVoted && user ? (
                          <input
                            type="radio"
                            id={option.id}
                            name={`poll-${poll.id}`}
                            value={option.id}
                            checked={isSelected}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="w-5 h-5 flex items-center justify-center">
                            {isSelected && hasVoted && (
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        )}
                        <label 
                          htmlFor={option.id} 
                          className={`flex-1 text-lg font-medium cursor-pointer transition-colors ${
                            isSelected && hasVoted ? 'text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {option.text}
                        </label>
                        <div className="text-right min-w-[120px]">
                          <div className="text-xl font-bold text-gray-900">{option.votes}</div>
                          <div className="text-sm text-gray-500">votes ({percentage}%)</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-4 rounded-full transition-all duration-500 ease-out ${
                            percentage > 50 ? 'bg-green-500' : 
                            percentage > 25 ? 'bg-blue-500' : 
                            percentage > 10 ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Voting Section */}
              {poll.isActive && user && !hasVoted && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Cast Your Vote</h4>
                      <p className="text-gray-600">Select an option above and click vote</p>
                    </div>
                    <Button 
                      onClick={handleVote}
                      disabled={!selectedOption}
                      className={`${
                        selectedOption 
                          ? 'btn-success' 
                          : 'btn-secondary opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {selectedOption ? '🗳️ Vote Now' : 'Select Option'}
                    </Button>
                  </div>
                </div>
              )}

              {hasVoted && (
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-3 px-6 py-4 bg-green-100 text-green-800 rounded-lg">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h4 className="font-semibold">Vote Cast Successfully!</h4>
                      <p className="text-sm">Thank you for participating in this poll.</p>
                    </div>
                  </div>
                </div>
              )}

              {!user && poll.isActive && (
                <div className="border-t pt-6">
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">You need to be logged in to vote on this poll.</p>
                    <div className="space-x-4">
                      <Button asChild className="btn-primary">
                        <a href="/auth/login">Log In</a>
                      </Button>
                      <Button asChild variant="outline" className="btn-outline">
                        <a href="/auth/register">Sign Up</a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Poll Metadata */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Poll Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(poll.createdAt).toLocaleDateString()}</span>
                </div>
                {poll.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">{new Date(poll.expiresAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${poll.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {poll.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Options:</span>
                  <span className="font-medium">{poll.options.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vote Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Votes:</span>
                  <span className="font-medium">{poll.totalVotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Most Popular:</span>
                  <span className="font-medium">
                    {poll.options.length > 0 
                      ? poll.options.reduce((prev, current) => 
                          prev.votes > current.votes ? prev : current
                        ).text
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participation:</span>
                  <span className="font-medium">
                    {poll.totalVotes > 0 ? 'Active' : 'No votes yet'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

