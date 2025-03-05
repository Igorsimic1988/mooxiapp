// import { LoginSchema } from "../schemas";
// import { z } from "zod";
// import { signIn } from "../api/auth/[...nextauth]/auth-options";


// export const login = async(values: z.infer<typeof LoginSchema>) => {
//     //const confirmationLink = "http://localhost:3000/confirm-email";;

//     const isValid = LoginSchema.safeParse(values);

//     if (!isValid.success) {
//         throw new Error("Eamil is not valid");
//     }

//     const {email} = isValid.data;

//     signIn("email", {email, redirectTo: "/leads"});  //proveriti
//     return { success: `Email sent to ${email}` };
// }