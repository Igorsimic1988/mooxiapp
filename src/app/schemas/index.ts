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

export const LeadFormSchema = z.object({
  companyName: z.string().min(1, "Company is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhoneNumber: z
    .string()
    .min(10, "Phone number is required")
    .refine((val) => /^\d{10}$/.test(val.replace(/\D/g, '')), {
      message: "Phone number must be 10 digits",
    }),
  customerEmail: z.string().email("Invalid email"),
  source: z.string().min(1, "Source is required"),
  brandId: z.string(),
  serviceType: z.string().min(1, "Service type is required"),
  fromZip: z.string().optional(),
  toZip: z.string().optional(),
  moveDate: z.string().optional(),
  estimator: z.string().optional(),
  surveyDate: z.string().optional(),
  surveyTime: z.string().optional(),
  assignSalesRep: z.boolean(),
});