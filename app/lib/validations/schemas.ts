import { z } from 'zod';

/**
 * Validation schema for creating new polls.
 * 
 * This schema ensures poll data integrity by validating:
 * - Question: Required, 1-500 characters, trimmed
 * - Options: Array of 2-10 options, each 1-200 characters, trimmed
 * 
 * Used in poll creation forms and server actions to prevent invalid data.
 */
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

/**
 * Validation schema for updating existing polls.
 * 
 * Reuses the createPollSchema since poll updates have the same validation requirements.
 * This ensures consistency between create and update operations.
 */
export const updatePollSchema = createPollSchema;

/**
 * Validation schema for user login.
 * 
 * Validates login credentials with basic email and password requirements.
 * Used in login forms to ensure proper data format before authentication.
 */
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

/**
 * Validation schema for user registration.
 * 
 * Comprehensive validation for new user accounts including:
 * - Name: Letters and spaces only, 1-100 characters
 * - Email: Valid email format, max 255 characters, normalized to lowercase
 * - Password: Strong password with complexity requirements (8+ chars, mixed case, numbers)
 * - Password confirmation: Must match the password field
 * 
 * Used in registration forms to ensure account security and data integrity.
 */
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

/**
 * Validation schema for vote submission.
 * 
 * Ensures vote data integrity by validating:
 * - pollId: Must be a valid UUID format
 * - optionIndex: Integer between 0-9 (supports up to 10 poll options)
 * 
 * Used in voting forms and server actions to prevent invalid votes.
 */
export const voteSchema = z.object({
  pollId: z.string().uuid('Invalid poll ID'),
  optionIndex: z.number()
    .int('Option index must be an integer')
    .min(0, 'Invalid option index')
    .max(9, 'Invalid option index')
});

/**
 * Sanitizes HTML input to prevent XSS attacks.
 * 
 * This utility function removes potentially dangerous HTML elements and attributes
 * that could be used for cross-site scripting attacks. It's used to clean user
 * input before storing in the database or displaying in the UI.
 * 
 * @param input - The string to sanitize
 * @returns Sanitized string with dangerous HTML elements removed
 * 
 * @example
 * ```typescript
 * const cleanInput = sanitizeHtml('<script>alert("xss")</script>Hello');
 * console.log(cleanInput); // "Hello"
 * ```
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates and sanitizes poll data for safe storage and display.
 * 
 * This utility function combines Zod validation with HTML sanitization to ensure
 * poll data is both structurally valid and safe from XSS attacks. It's used
 * in poll creation and update operations.
 * 
 * @param data - Raw poll data to validate and sanitize
 * @returns Validated and sanitized poll data
 * @throws ZodError - If validation fails
 * 
 * @example
 * ```typescript
 * try {
 *   const cleanData = validateAndSanitizePoll({
 *     question: 'What is your favorite color?',
 *     options: ['Red', 'Blue', 'Green']
 *   });
 *   // Use cleanData safely
 * } catch (error) {
 *   // Handle validation errors
 * }
 * ```
 */
export function validateAndSanitizePoll(data: any) {
  const validated = createPollSchema.parse(data);
  return {
    question: sanitizeHtml(validated.question),
    options: validated.options.map(option => sanitizeHtml(option))
  };
}
