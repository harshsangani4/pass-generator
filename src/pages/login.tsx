import React from "react";
import { useRouter } from "next/router";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(email: string, password: string) {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || "Login failed");
    sessionStorage.setItem("pbkdf2Salt", data.pbkdf2Salt);
    sessionStorage.setItem("userId", data.userId);
    sessionStorage.setItem("password", password);
    router.push("/");
  }

  return (
    <AuthForm
      title="Login"
      actionLabel="Login"
      onSubmit={handleLogin}
      footer={<a href="/signup">Create an account</a>}
    />
  );
}


