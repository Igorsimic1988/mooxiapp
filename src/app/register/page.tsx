'use client';

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "src/app/services/registerService";

export default function RegisterPage() {
    const router = useRouter();

    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const mutation = useMutation<{ message: string }, Error, { email: string; name: string; password: string }>({
        mutationFn: registerUser,
          onSuccess: () => {    
            if (nameRef.current) nameRef.current.value = "";
            if (emailRef.current) emailRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
    
            router.push("/login");
          },
          onError: (error: Error) => {
            console.log(error)
          },
        }
      );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const name = nameRef.current?.value.trim();
        const email = emailRef.current?.value.trim();
        const password = passwordRef.current?.value.trim();

        if (!email || !name || !password) {
            alert("All fields are required!");
            return;
        }

        mutation.mutate({ email, name, password }); 
    };

    return (
        <div>
        <h1>Register</h1>
        {mutation.isError && <p style={{ color: "red" }}>{mutation.error?.message}</p>}
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" ref={nameRef} required />
            <input type="email" placeholder="Email" ref={emailRef} required />
            <input type="password" placeholder="Password" ref={passwordRef} required />
            <button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Registering..." : "Register"}
            </button>
        </form>
        <p>Already have an account? <a href="/login">Login</a></p>
    </div>
    );
}
