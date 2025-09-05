import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Poll } from '@/app/lib/types';

/**
 * Props interface for the PollCard component.
 * 
 * Defines the structure of poll data required to render a poll card.
 * The poll object contains all necessary information to display poll summary.
 */
interface PollCardProps {
  poll: {
    id: string;
    title: string;
    description?: string;
    options: any[];
    votes?: number;
    createdAt: string | Date;
  };
}

/**
 * PollCard component for displaying poll summaries in a card format.
 * 
 * This component renders a clickable card that displays poll information including
 * title, description, number of options, total votes, and creation date. The card
 * is wrapped in a Link component for navigation to the poll detail page.
 * 
 * Features:
 * - Hover effects for better UX
 * - Vote count calculation (from votes prop or calculated from options)
 * - Date formatting for creation date
 * - Responsive design with proper spacing
 * 
 * @param poll - Poll data object containing all necessary information
 * @returns JSX element representing a poll card
 * 
 * @example
 * ```tsx
 * <PollCard 
 *   poll={{
 *     id: 'poll-123',
 *     title: 'What is your favorite color?',
 *     description: 'A simple color preference poll',
 *     options: ['Red', 'Blue', 'Green'],
 *     votes: 42,
 *     createdAt: '2024-01-15T10:30:00Z'
 *   }} 
 * />
 * ```
 */
export function PollCard({ poll }: PollCardProps) {
  // Calculate total votes from either the votes prop or by summing option votes
  const totalVotes = poll.votes || poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
  
  // Format creation date for display (handles both string and Date types)
  const formattedDate = typeof poll.createdAt === 'string' 
    ? new Date(poll.createdAt).toLocaleDateString() 
    : poll.createdAt.toLocaleDateString();

  return (
    <Link href={`/polls/${poll.id}`} className="group block h-full">
      <Card className="h-full transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle className="group-hover:text-blue-600 transition-colors">{poll.title}</CardTitle>
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">
            <p>{poll.options.length} options</p>
            <p>{totalVotes} total votes</p>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-slate-400">
          Created on {formattedDate}
        </CardFooter>
      </Card>
    </Link>
  );
}