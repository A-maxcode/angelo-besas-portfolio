import { z } from "zod";

export const CONTACT_LIMITS = {
  name: 100,
  email: 255,
  subject: 150,
  messageMin: 10,
  message: 2000,
} as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Please enter your name." })
    .max(CONTACT_LIMITS.name, { message: `Name must be ${CONTACT_LIMITS.name} characters or fewer.` }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email." })
    .email({ message: "Please enter a valid email address." })
    .max(CONTACT_LIMITS.email, { message: "Email is too long." }),
  subject: z
    .string()
    .trim()
    .min(1, { message: "Please add a subject." })
    .max(CONTACT_LIMITS.subject, {
      message: `Subject must be ${CONTACT_LIMITS.subject} characters or fewer.`,
    }),
  message: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.messageMin, {
      message: `Message must be at least ${CONTACT_LIMITS.messageMin} characters.`,
    })
    .max(CONTACT_LIMITS.message, {
      message: `Message must be ${CONTACT_LIMITS.message} characters or fewer.`,
    }),
});

export type ContactValues = z.infer<typeof contactSchema>;
