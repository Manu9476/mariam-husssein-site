import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(3, "Please add a short subject."),
  message: z.string().min(20, "Please share a little more detail."),
});

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export const reviewSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  rating: z.coerce.number().min(1).max(5),
  message: z.string().min(20, "Please tell us a bit more."),
  website: z.string().optional().default(""),
  startedAt: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
