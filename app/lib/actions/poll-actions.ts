"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { validateAndSanitizePoll, voteSchema } from "@/app/lib/validations/schemas";
import { requireCSRFToken } from "@/app/lib/utils/csrf";

// CREATE POLL
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  // Validate CSRF token
  const isValidCSRF = await requireCSRFToken(formData);
  if (!isValidCSRF) {
    return { error: "Invalid request. Please try again." };
  }

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  let validatedData;
  try {
    // Validate and sanitize input
    validatedData = validateAndSanitizePoll({ question, options });
    
    if (!validatedData.question || validatedData.options.length < 2) {
      return { error: "Please provide a question and at least two options." };
    }
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid input data" };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question: validatedData.question,
      options: validatedData.options,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

// GET USER POLLS
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

// GET POLL BY ID
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

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  
  try {
    // Validate input
    voteSchema.parse({ pollId, optionIndex });
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid vote data" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user already voted on this poll
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

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

// DELETE POLL
export async function deletePoll(id: string) {
  const supabase = await createClient();
  
  // Get user from session
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

  // Only allow deleting polls owned by the user
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
    
  if (error) return { error: error.message };
  revalidatePath("/polls");
  return { error: null };
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  // Validate CSRF token
  const isValidCSRF = await requireCSRFToken(formData);
  if (!isValidCSRF) {
    return { error: "Invalid request. Please try again." };
  }

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  let validatedData;
  try {
    // Validate and sanitize input
    validatedData = validateAndSanitizePoll({ question, options });
    
    if (!validatedData.question || validatedData.options.length < 2) {
      return { error: "Please provide a question and at least two options." };
    }
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid input data" };
  }

  // Get user from session
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

  // Only allow updating polls owned by the user
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
