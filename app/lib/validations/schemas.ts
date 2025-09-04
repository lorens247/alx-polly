import { z } from 'zod';

// Poll validation schemas
export const createPollSchema = z.object({
  question: z.string()
    .min(1, 'Question is required')
    .max(500, 'Question must be less than 500 characters')
    .trim(),
  options: z.array(
    z.string()
      .min(1, 'Option cannot be empty')
      .max(200, 'Option must be less than 200 characters')
      .trim()
  )
    .min(2, 'At least 2 options are required')
    .max(10, 'Maximum 10 options allowed')
});

export const updatePollSchema = createPollSchema;

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password must be less than 100 characters')
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Vote validation schema
export const voteSchema = z.object({
  pollId: z.string().uuid('Invalid poll ID'),
  optionIndex: z.number()
    .int('Option index must be an integer')
    .min(0, 'Invalid option index')
    .max(9, 'Invalid option index')
});

// Utility function to sanitize HTML
export function sanitizeHtml(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Utility function to validate and sanitize poll data
export function validateAndSanitizePoll(data: any) {
  const validated = createPollSchema.parse(data);
  return {
    question: sanitizeHtml(validated.question),
    options: validated.options.map(option => sanitizeHtml(option))
  };
}
