'use client';

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "src/app/services/loginService";

export default function LoginPage() {
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const mutation = useMutation<{ message: string }, Error, { email: string; password: string }>({
        mutationFn:loginUser,
        onSuccess: () => {
            if (emailRef.current) emailRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
    
            router.push("/");
        },
        onError: (error: Error) => {
            console.log(error)
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const email = emailRef.current?.value.trim();
        const password = passwordRef.current?.value.trim();

        if (!email  || !password) {
            alert("All fields are required!");
            return;
        }

        mutation.mutate({ email, password }); 

    };

    return (
        <div>
            <h1>Login</h1>
            {mutation.isError && <p style={{ color: "red" }}>{mutation.error?.message}</p>}
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" ref = {emailRef} required />
                <input type="password" placeholder="Password" ref = {passwordRef} required />
                <button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Login..." : "Login"}
            </button>
            </form>
            <p> t have an account? <a href="/register">Register</a></p>
        </div>
    );
}
