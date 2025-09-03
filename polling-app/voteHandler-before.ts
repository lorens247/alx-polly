// BEFORE: Original handleVote function from app/polls/[id]/page.tsx
// This version has performance and clarity issues

const handleVote = async (optionId: string) => {
  if (!user) {
    setError("You must be logged in to vote")
    return
  }

  try {
    setVoting(true)
    setError("")

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from('votes')
        .update({ option_id: optionId })
        .eq('id', existingVote.id)

      if (updateError) throw updateError
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: user.id
        })

      if (insertError) throw insertError
    }

    setUserVote(optionId)
    setHasVoted(true)
    setShowResults(true)

    // Refresh vote results
    await calculateVoteResults(poll!)
  } catch (err: any) {
    setError(err.message || "Failed to submit vote")
  } finally {
    setVoting(false)
  }
}

// Issues with this version:
// 1. Performance: 2-3 sequential database calls
// 2. Clarity: Complex nested logic with repetitive error handling
// 3. Efficiency: Unnecessary database round-trips
// 4. Maintainability: Hard to read and test due to mixed concerns
