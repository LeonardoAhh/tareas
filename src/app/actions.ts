'use server';

import { LoginSchema } from '@/lib/schemas';
import { z } from 'zod';

export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock authentication logic
  if (
    validatedFields.data.email === 'test@example.com' &&
    validatedFields.data.password === 'password123'
  ) {
    return { success: 'Login successful! Redirecting...' };
  }

  return { error: 'Invalid email or password.' };
}
