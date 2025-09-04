'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getPollById, submitVote } from '@/app/lib/actions/poll-actions';
import { useAuth } from '@/app/lib/context/auth-context';

interface Poll {
  id: string;
  question: string;
  options: string[];
  user_id: string;
  created_at: string;
}

export default function PollDetailPage({ params }: { params: { id: string } }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchPoll();
  }, [params.id]);

  const fetchPoll = async () => {
    try {
      const { poll: pollData, error: pollError } = await getPollById(params.id);
      if (pollError || !pollData) {
        setError('Poll not found');
        setLoading(false);
        return;
      }
      setPoll(pollData);
    } catch (err) {
      setError('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };
  const handleVote = async () => {
    if (selectedOption === null || !poll) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await submitVote(poll.id, selectedOption);
      if (result.error) {
        setError(result.error);
      } else {
        setHasVoted(true);
        // Refresh poll data to show updated results
        await fetchPoll();
      }
    } catch (err) {
      setError('Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6">Loading poll...</div>;
  }

  if (error || !poll) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Poll not found'}</p>
          <Button onClick={() => router.push('/polls')}>
            Return to Polls
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/polls" className="text-blue-600 hover:underline">
          &larr; Back to Polls
        </Link>
        {user && user.id === poll.user_id && (
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/polls/${params.id}/edit`}>Edit Poll</Link>
            </Button>
            <Button variant="outline" className="text-red-500 hover:text-red-700">
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasVoted ? (
            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedOption === index ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
                  onClick={() => setSelectedOption(index)}
                >
                  {option}
                </div>
              ))}
              <Button 
                onClick={handleVote} 
                disabled={selectedOption === null || isSubmitting} 
                className="mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Thank you for voting!</h3>
              <p className="text-gray-600">Your vote has been recorded.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>Created on {new Date(poll.created_at).toLocaleDateString()}</span>
        </CardFooter>
      </Card>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Share this poll</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1">
            Share on Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}