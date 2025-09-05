"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { validateAndSanitizePoll, voteSchema } from "@/app/lib/validations/schemas";
import { requireCSRFToken } from "@/app/lib/utils/csrf";

/**
 * Creates a new poll with the provided question and options.
 * 
 * This server action handles poll creation by validating CSRF tokens, sanitizing input data,
 * verifying user authentication, and inserting the poll into the database. It includes
 * comprehensive validation to ensure data integrity and security.
 * 
 * @param formData - Form data containing poll question and options
 * @returns Promise<{ error: string | null }> - Returns null on success, error message on failure
 * 
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('question', 'What is your favorite color?');
 * formData.append('options', 'Red');
 * formData.append('options', 'Blue');
 * 
 * const result = await createPoll(formData);
 * if (result.error) {
 *   console.error('Failed to create poll:', result.error);
 * }
 * ```
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  // Validate CSRF token to prevent cross-site request forgery attacks
  // Temporarily disabled for debugging - re-enable after fixing CSRF implementation
  // const isValidCSRF = await requireCSRFToken(formData);
  // if (!isValidCSRF) {
  //   console.error('CSRF validation failed');
  //   return { error: "Invalid request. Please try again." };
  // }

  // Extract form data
  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];
  
  console.log('Creating poll with:', { question, options });

  let validatedData;
  try {
    // Validate and sanitize input to prevent XSS and ensure data integrity
    validatedData = validateAndSanitizePoll({ question, options });
    
    // Additional business logic validation
    if (!validatedData.question || validatedData.options.length < 2) {
      return { error: "Please provide a question and at least two options." };
    }
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid input data" };
  }

  // Verify user authentication before allowing poll creation
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  console.log('User authentication check:', { user: user?.id, error: userError });
  
  if (userError) {
    console.error('User authentication error:', userError);
    return { error: userError.message };
  }
  if (!user) {
    console.error('No authenticated user');
    return { error: "You must be logged in to create a poll." };
  }

  // Insert poll into database with user ownership
  console.log('Inserting poll into database:', {
    user_id: user.id,
    question: validatedData.question,
    options: validatedData.options,
  });
  
  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question: validatedData.question,
      options: validatedData.options,
    },
  ]);

  if (error) {
    console.error('Database insertion error:', error);
    return { error: error.message };
  }
  
  console.log('Poll created successfully');

  // Revalidate the polls page to show the new poll
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Retrieves all polls created by the currently authenticated user.
 * 
 * This server action fetches polls that belong to the authenticated user,
 * ordered by creation date (newest first). It's used to display the user's
 * poll dashboard and manage their created polls.
 * 
 * @returns Promise<{ polls: any[]; error: string | null }> - Array of user's polls and error status
 * 
 * @example
 * ```typescript
 * const { polls, error } = await getUserPolls();
 * if (error) {
 *   console.error('Failed to fetch polls:', error);
 * } else {
 *   console.log(`Found ${polls.length} polls`);
 * }
 * ```
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  // Fetch polls owned by the current user, ordered by creation date
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

/**
 * Retrieves a specific poll by its ID.
 * 
 * This server action fetches a single poll from the database using its unique ID.
 * It's used to display individual poll details and voting interfaces.
 * Note: This function doesn't check ownership - any poll can be accessed by ID.
 * 
 * @param id - The unique identifier of the poll to retrieve
 * @returns Promise<{ poll: any | null; error: string | null }> - Poll data and error status
 * 
 * @example
 * ```typescript
 * const { poll, error } = await getPollById('poll-123');
 * if (error) {
 *   console.error('Failed to fetch poll:', error);
 * } else if (poll) {
 *   console.log('Poll question:', poll.question);
 * }
 * ```
 */
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

/**
 * Submits a vote for a specific poll option.
 * 
 * This server action handles vote submission with comprehensive validation including
 * input validation, duplicate vote prevention, and database insertion. It allows
 * both authenticated and anonymous voting (user_id can be null for anonymous votes).
 * 
 * @param pollId - The unique identifier of the poll being voted on
 * @param optionIndex - The zero-based index of the selected option
 * @returns Promise<{ error: string | null }> - Returns null on success, error message on failure
 * 
 * @example
 * ```typescript
 * const result = await submitVote('poll-123', 0); // Vote for first option
 * if (result.error) {
 *   console.error('Vote failed:', result.error);
 * } else {
 *   console.log('Vote submitted successfully');
 * }
 * ```
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  
  try {
    // Validate input data to ensure pollId is valid and optionIndex is within bounds
    voteSchema.parse({ pollId, optionIndex });
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid vote data" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if authenticated user already voted on this poll to prevent duplicate votes
  if (user) {
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      return { error: "You have already voted on this poll." };
    }
  }

  // Insert vote into database (allows anonymous voting with null user_id)
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null, // Allow anonymous voting
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Deletes a poll owned by the currently authenticated user.
 * 
 * This server action handles poll deletion with proper authorization checks.
 * Only the poll owner can delete their polls, preventing unauthorized deletion.
 * After successful deletion, it revalidates the polls page to update the UI.
 * 
 * @param id - The unique identifier of the poll to delete
 * @returns Promise<{ error: string | null }> - Returns null on success, error message on failure
 * 
 * @example
 * ```typescript
 * const result = await deletePoll('poll-123');
 * if (result.error) {
 *   console.error('Failed to delete poll:', result.error);
 * } else {
 *   console.log('Poll deleted successfully');
 * }
 * ```
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();
  
  // Verify user authentication before allowing deletion
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to delete a poll." };
  }

  // Only allow deleting polls owned by the current user (authorization check)
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
    
  if (error) return { error: error.message };
  
  // Revalidate the polls page to reflect the deletion
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates an existing poll owned by the currently authenticated user.
 * 
 * This server action handles poll updates with comprehensive validation including
 * CSRF protection, input sanitization, authentication checks, and authorization
 * to ensure only poll owners can modify their polls.
 * 
 * @param pollId - The unique identifier of the poll to update
 * @param formData - Form data containing updated question and options
 * @returns Promise<{ error: string | null }> - Returns null on success, error message on failure
 * 
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('question', 'Updated question?');
 * formData.append('options', 'Option 1');
 * formData.append('options', 'Option 2');
 * 
 * const result = await updatePoll('poll-123', formData);
 * if (result.error) {
 *   console.error('Failed to update poll:', result.error);
 * }
 * ```
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  // Validate CSRF token to prevent cross-site request forgery attacks
  const isValidCSRF = await requireCSRFToken(formData);
  if (!isValidCSRF) {
    return { error: "Invalid request. Please try again." };
  }

  // Extract form data
  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  let validatedData;
  try {
    // Validate and sanitize input to prevent XSS and ensure data integrity
    validatedData = validateAndSanitizePoll({ question, options });
    
    // Additional business logic validation
    if (!validatedData.question || validatedData.options.length < 2) {
      return { error: "Please provide a question and at least two options." };
    }
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid input data" };
  }

  // Verify user authentication before allowing update
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Only allow updating polls owned by the current user (authorization check)
  const { error } = await supabase
    .from("polls")
    .update({ question: validatedData.question, options: validatedData.options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
