import { z } from 'zod';

/**
 * Shared by the registration form (React Hook Form) and the API pipe, so a rule
 * cannot drift between the two (docs/rules.md #20).
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(254)
  .email('Adresse e-mail invalide');

export const passwordSchema = z
  .string()
  .min(12, 'Au moins 12 caractères')
  .max(200)
  .refine((v) => /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v), {
    message: 'Doit contenir une minuscule, une majuscule et un chiffre',
  });

export const GOALS = [
  'BETTER_DEVELOPER',
  'PREPARE_INTERVIEW',
  'CHANGE_STACK',
  'BECOME_SENIOR',
  'LEARN_NEW_STACK',
  'BUILD_PROJECTS',
] as const;

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(1).max(80),
  goal: z.enum(GOALS),
  dailyMinutesTarget: z.union([z.literal(15), z.literal(30), z.literal(60), z.literal(120)]),
  timezone: z.string().min(1).max(64),
});

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1) });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
