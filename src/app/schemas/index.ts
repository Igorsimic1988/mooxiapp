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
  name: z.string().min(3).optional(),
  imageName: z.string().optional(),
  rooms: z.array(z.number()).optional(), 
  letters: z.array(z.string()).optional(), 
  cuft: z.number().positive().optional(),
  lbs: z.number().positive().optional(),
  search: z.enum(["Y", "N"]).optional(),
  tags: z.array(z.string()).refine((tags) => tags.every(tag => allowedTags.includes(tag)), {
    message: "Invalid tag detected",
  }).optional(),
  notes: z.string().optional(), 
  packingType: z.string().optional(),
  packingQuantity: z.number().optional(),
  link: z.string().optional(),
  uploadedImages: z.array(z.string()).optional().default([]),
  cameraImages:  z.array(z.string()).optional().default([]),
  groupingKey:  z.array(z.string()).optional().default([]),
  autoAdded: z.boolean().optional(),
  brandId: z.string().min(1), 
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
  salesName: z.string().optional(),
  // Add the new place-related fields
  typeOfPlace: z.string().optional(),
  moveSize: z.string().optional(),
  howManyStories: z.string().optional(),
  features: z.array(z.string()).optional(),
});
