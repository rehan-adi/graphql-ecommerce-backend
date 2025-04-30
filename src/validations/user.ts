import z from "zod";

export const userValidation = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(15, "Username must be at most 15 characters"),
});
