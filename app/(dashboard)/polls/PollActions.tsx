"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";

/**
 * Poll interface defining the structure of poll data for actions.
 * 
 * Contains the essential poll information needed for rendering poll actions
 * and determining ownership-based permissions.
 */
interface Poll {
  id: string;
  question: string;
  options: Array<{ text: string; votes?: number; [key: string]: unknown }>;
  user_id: string;
}

/**
 * Props interface for the PollActions component.
 * 
 * Defines the poll data required to render poll actions and determine
 * which actions are available based on user ownership.
 */
interface PollActionsProps {
  poll: Poll;
}

/**
 * PollActions component for displaying poll management actions.
 * 
 * This component renders a poll card with management actions (edit/delete) that are
 * only available to the poll owner. It provides a clean interface for poll management
 * with proper authorization checks and user feedback.
 * 
 * Features:
 * - Ownership-based action visibility (only poll owner sees edit/delete buttons)
 * - Confirmation dialog for destructive actions (delete)
 * - Navigation to poll detail and edit pages
 * - Responsive design with hover effects
 * - Automatic page refresh after deletion
 * 
 * @param poll - Poll data object containing poll information and ownership details
 * @returns JSX element representing poll actions card
 * 
 * @example
 * ```tsx
 * <PollActions 
 *   poll={{
 *     id: 'poll-123',
 *     question: 'What is your favorite color?',
 *     options: ['Red', 'Blue', 'Green'],
 *     user_id: 'user-456'
 *   }} 
 * />
 * ```
 */
export default function PollActions({ poll }: PollActionsProps) {
  const { user } = useAuth();
  
  /**
   * Handles poll deletion with user confirmation.
   * 
   * Shows a confirmation dialog before proceeding with deletion to prevent
   * accidental data loss. After successful deletion, refreshes the page
   * to update the UI and remove the deleted poll from the list.
   */
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this poll?")) {
      await deletePoll(poll.id);
      window.location.reload();
    }
  };

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white">
      {/* Poll summary section - clickable to view poll details */}
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.question}
              </h2>
              <p className="text-slate-500">{poll.options.length} options</p>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Action buttons - only visible to poll owner */}
      {user && user.id === poll.user_id && (
        <div className="flex gap-2 p-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
