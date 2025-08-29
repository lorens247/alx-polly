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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{poll.title}</CardTitle>
            <CardDescription>{poll.description}</CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>{poll.totalVotes} votes</div>
            <div>{poll.isActive ? "Active" : "Closed"}</div>
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
                    className="w-4 h-4"
                  />
                  <label 
                    htmlFor={option.id} 
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {option.text}
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {option.votes} votes ({percentage}%)
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Created {new Date(poll.createdAt).toLocaleDateString()}
          {poll.expiresAt && (
            <span> • Expires {new Date(poll.expiresAt).toLocaleDateString()}</span>
          )}
        </div>
        
        {canVote && !hasVoted && (
          <Button 
            onClick={handleVote}
            disabled={!selectedOption}
            size="sm"
          >
            Vote
          </Button>
        )}
        
        {hasVoted && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Voted
          </span>
        )}
      </CardFooter>
    </Card>
  )
}
