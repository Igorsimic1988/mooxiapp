'use client';

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "src/app/services/loginService";
import { LoginSchema } from "../schemas";
import { z } from "zod";

type LoginFormInputs = z.infer<typeof LoginSchema>; 


export default function LoginPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, reset, } = useForm<LoginFormInputs>({
        resolver:zodResolver(LoginSchema),
    });

    const mutation = useMutation<{ token: string }, Error, LoginFormInputs>({
        mutationFn:loginUser,
        onSuccess: (data) => {
            localStorage.setItem("access-token", data.token); 
            reset();
            router.push("/leads");
        },
        onError: (error: Error) => {
            console.log(error)
        }
    });

    const onSubmit = async (data: LoginFormInputs) => {
        mutation.mutate(data); 
    };

    return (
        <div>
            <h1>Login</h1>
            {mutation.isError && <p style={{ color: "red" }}>{mutation.error?.message}</p>}
            <form onSubmit={handleSubmit(onSubmit)}>
                <input type="email" placeholder="Email" {...register("email")} />
                {errors.email && (
                    <p style={{ color: "red" }}>{errors.email.message}</p>
                )}
                <input type="password" placeholder="Password" {...register("password")} />
                {errors.password && (
                    <p style={{ color: "red" }}>{errors.password.message}</p>
                )}
                <button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Login..." : "Login"}
            </button>
            </form>
            <p> t have an account? <a href="/register">Register</a></p>
        </div>
    );
}

