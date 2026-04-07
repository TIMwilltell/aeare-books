import { z } from 'zod';

const ConvexEnvSchema = z.object({
	AEARE_AUTH_EMAIL_MODE: z.enum(['local', 'resend']).default('resend'),
	AUTH_EMAIL_FROM: z.string().trim().min(1).default('AeAre Books <auth@aeare.local>'),
	AUTH_RESEND_KEY: z.string().trim().min(1).optional(),
});

export const convexEnv = ConvexEnvSchema.parse(process.env);
