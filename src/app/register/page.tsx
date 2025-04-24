'use client';

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "src/app/services/registerService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RegisterSchema } from "../schemas";


type RegisterFormInputs = z.infer<typeof RegisterSchema>; 


export default function RegisterPage() {
    const router = useRouter();

    const { reset, register, handleSubmit, formState: { errors }, } = useForm<RegisterFormInputs>({
      resolver: zodResolver(RegisterSchema),
    });

    const mutation = useMutation<{ message: string }, Error, RegisterFormInputs>({
        mutationFn: registerUser,
          onSuccess: () => {    
            reset();
            router.push("/login");
          },
          onError: (error: Error) => {
            console.log(error)
          },
        }
      );

    const onSubmit = (data: RegisterFormInputs) => {
        mutation.mutate(data); 
    };

    return (
        <div>
        <h1>Register</h1>
        {mutation.isError && <p style={{ color: "red" }}>{mutation.error?.message}</p>}
        <form onSubmit={handleSubmit(onSubmit)}>
            <input type="text" placeholder="Name" {...register("name")} />
            {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
            <input type="email" placeholder="Email" {...register("email")} />
            {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
            <input type="password" placeholder="Password" {...register("password")} />
            {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
            <button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Registering..." : "Register"}
            </button>
        </form>
        <p>Already have an account? <a href="/login">Login</a></p>
    </div>
    );
}
