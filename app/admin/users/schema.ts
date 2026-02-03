import { z } from "zod";

export const adminCreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(2, "Role is required"),
});

export type AdminCreateUserData = z.infer<typeof adminCreateUserSchema>;
