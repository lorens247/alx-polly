"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

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
}

interface PollCardProps {
  poll: Poll
  onVote: (pollId: string, optionId: string) => void
  canVote?: boolean
}

export function PollCard({ poll, onVote, canVote = true }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = () => {
    if (selectedOption && canVote && !hasVoted) {
      onVote(poll.id, selectedOption)
      setHasVoted(true)
    }
  }

  const getVotePercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0
    return Math.round((votes / poll.totalVotes) * 100)
  }

  const getStatusColor = () => {
    if (!poll.isActive) return "bg-red-100 text-red-800 border-red-200"
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
    return "bg-green-100 text-green-800 border-green-200"
  }

  const getStatusText = () => {
    if (!poll.isActive) return "Closed"
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return "Expired"
    }
    return "Active"
  }

  return (
    <Card className="card-hover card-gradient h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <CardTitle className="text-xl text-gray-900 mb-2 line-clamp-2">
              {poll.title}
            </CardTitle>
            <CardDescription className="text-gray-600 line-clamp-2">
              {poll.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{poll.totalVotes}</div>
              <div className="text-sm text-gray-500">votes</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {poll.options.map((option) => {
            const percentage = getVotePercentage(option.votes)
            const isSelected = selectedOption === option.id
            
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={option.id}
                    name={`poll-${poll.id}`}
                    value={option.id}
                    checked={isSelected}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    disabled={!canVote || hasVoted}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label 
                    htmlFor={option.id} 
                    className={`flex-1 text-sm font-medium cursor-pointer transition-colors ${
                      isSelected ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {option.text}
                  </label>
                  <span className="text-sm font-semibold text-gray-600 min-w-[80px] text-right">
                    {option.votes} ({percentage}%)
                  </span>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${
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
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 pt-4">
        <div className="text-sm text-gray-500 space-y-1">
          <div>Created {new Date(poll.createdAt).toLocaleDateString()}</div>
          {poll.expiresAt && (
            <div className="text-orange-600">
              Expires {new Date(poll.expiresAt).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {canVote && !hasVoted && (
            <Button 
              onClick={handleVote}
              disabled={!selectedOption}
              className={`${
                selectedOption 
                  ? 'btn-success' 
                  : 'btn-secondary opacity-50 cursor-not-allowed'
              }`}
              size="sm"
            >
              {selectedOption ? '🗳️ Vote Now' : 'Select Option'}
            </Button>
          )}
          
          {hasVoted && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <span className="text-lg">✓</span>
              <span className="text-sm font-medium">Voted</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            className="btn-outline"
            asChild
          >
            <a href={`/polls/${poll.id}`}>View Details</a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
