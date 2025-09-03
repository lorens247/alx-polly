// AFTER: Refactored handleVote function from app/polls/page.tsx
// This version is optimized for performance and clarity

const handleVote = async (pollId: string, optionId: string) => {
  console.log(`Voting for option ${optionId} in poll ${pollId}`)
  
  // Optimized vote update with better performance and readability
  setPolls(prevPolls => {
    // Early validation - return unchanged if poll/option not found
    const pollIndex = prevPolls.findIndex(poll => poll.id === pollId)
    if (pollIndex === -1) return prevPolls
    
    const poll = prevPolls[pollIndex]
    const optionIndex = poll.options.findIndex(option => option.id === optionId)
    if (optionIndex === -1) return prevPolls
    
    // Create immutable update with minimal object creation
    const newPolls = [...prevPolls]
    const newOptions = [...poll.options]
    
    // Update only the specific option that was voted for
    newOptions[optionIndex] = { 
      ...newOptions[optionIndex], 
      votes: newOptions[optionIndex].votes + 1 
    }
    
    // Update only the specific poll that was voted on
    newPolls[pollIndex] = {
      ...poll,
      options: newOptions,
      totalVotes: poll.totalVotes + 1
    }
    
    return newPolls
  })
}

// Improvements in this version:
// 1. Performance: Early validation prevents unnecessary processing
// 2. Clarity: Clear separation of concerns with descriptive comments
// 3. Efficiency: Minimal object creation and targeted updates
// 4. Maintainability: Easier to read, test, and debug
// 5. Immutability: Proper immutable state updates for React
