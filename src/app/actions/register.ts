// import { z } from "zod";
// import { RegisterSchema } from "../schemas";
// import bcrypt from "bcryptjs";
// import { getUserByEmail } from "../utils/user";
// import { generateVerificationToken } from "../lib/token";
// import { sendVerificationEmail } from "../lib/resend";
// import { PrismaClient } from '@prisma/client'


// const prisma = new PrismaClient();

// export const register = async (values: z.infer<typeof RegisterSchema>) => {
//     const isValid = RegisterSchema.safeParse(values);

//     if (!isValid.success){
//         return {error:"Email is not valid"};
//     }

//     const {email, password, name} = isValid.data;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const existingUser = await getUserByEmail(email);

//     if (existingUser){
//         return {error:"User already exists"};
//     }

//     await prisma.user.create({
//         data:{
//             email,
//             password: hashedPassword,
//             name,
//         },
//     });

//     const verificationToken = await generateVerificationToken(email);
//     await sendVerificationEmail(email, verificationToken.token)
//     return {success: "Confirmation email sent"};
// }

