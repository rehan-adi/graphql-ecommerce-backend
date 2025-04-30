import z from "zod";

export const CreateProductValidation = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(40, "Product name must be less than or equal to 40 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be less than or equal to 300 characters"),
  price: z.number().positive("Price must be a positive number"),
  imageUrl: z.string().url("Image URL must be a valid URL"),
});
