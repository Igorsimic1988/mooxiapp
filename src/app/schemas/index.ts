import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address',
    }),
    password: z.string().min(6, {
         message: "Password must be at least 6 characters" 
    }),
});

export const RegisterSchema = z.object({
    email: z.string().email({
      message: 'Email is required'
    }),
    password: z.string().min(6, {
      message: 'Minimum 6 characters required' //ovo pitati
    }),
    name: z.string().min(1, {
      message: 'Name is required'
    }),
    });

const allowedTags = ["bulky", "blanket_wrapped", "cp_packed_by_movers", "disassembly", "assembly"];

// Schema validacije
export const FurnitureSchema = z.object({
  name: z.string().min(3),
  imageName: z.string(),
  rooms: z.array(z.number()), 
  letters: z.array(z.string()), 
  cuft: z.number().positive(),
  lbs: z.number().positive(),
  search: z.enum(["Y", "N"]),
  tags: z.array(z.string()).refine((tags) => tags.every(tag => allowedTags.includes(tag)), {
    message: "Invalid tag detected",
  }),
  packingType: z.string(),
  packingQuantity: z.number(),
});