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
    })
    });