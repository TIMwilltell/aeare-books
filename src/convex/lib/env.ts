import { z } from "zod";

const ConvexEnvSchema = z
  .object({
    AEARE_AUTH_EMAIL_MODE: z.enum(["local", "resend"]).default("resend"),
    AUTH_EMAIL_FROM: z
      .string()
      .trim()
      .min(1)
      .default("AeAre Books <aeare.signin@mueeldaess.resend.app>"),
    AUTH_RESEND_KEY: z.string().trim().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    if (
      env.AEARE_AUTH_EMAIL_MODE === "resend" &&
      !env.AUTH_RESEND_KEY
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "AUTH_RESEND_KEY is required when AEARE_AUTH_EMAIL_MODE is 'resend'",
        path: ["AUTH_RESEND_KEY"],
      });
    }
  });

export const convexEnv = ConvexEnvSchema.parse(process.env);
