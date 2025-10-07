import React from "react";
import { useRouter } from "next/router";
import AuthForm from "../components/AuthForm";

export default function SignupPage() {
  const router = useRouter();

  async function handleSignup(email: string, password: string) {
    const r = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || "Signup failed");
    sessionStorage.setItem("pbkdf2Salt", data.pbkdf2Salt);
    sessionStorage.setItem("userId", data.userId);
    sessionStorage.setItem("password", password);
    router.push("/login");
  }

  return (
    <AuthForm
      title="Create account"
      actionLabel="Create account"
      onSubmit={handleSignup}
      footer={<a href="/login">Already have an account? Login</a>}
    />
  );
}


