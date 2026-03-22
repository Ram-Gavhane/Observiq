"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LucideArrowRight, LucideLoader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/signup", { email, password });

      if (!response) {
        throw new Error("Failed to sign up");
      }

      router.push("/signin");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold tracking-tight">
        <img src="/icon.svg" alt="Observiq" className="h-6 w-6" />
        <span>Observiq</span>
      </Link>

      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start monitoring your infrastructure today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
            {!loading && <LucideArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
