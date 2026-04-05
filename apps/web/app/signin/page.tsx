"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LucideArrowRight, LucideLoader2, LucideRadar, LucideCheckCircle2, LucideActivity, LucideShieldCheck } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function SigninPage() {
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;
  axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
    .then(() => router.replace("/dashboard"))
    .catch(() => {
      // token invalid; let them sign in
    });
}, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/signin"
        , {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in");
      }

      // Store JWT and current session id in local storage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.sessionId) {
        localStorage.setItem("sessionId", data.sessionId);
      }

      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* ─── LEFT: Form Panel ─── */}
      <div className="flex w-full flex-col justify-center px-6 md:px-12 lg:w-1/2 xl:px-24">
        
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="mb-12 flex items-center gap-2.5 text-xl font-bold tracking-tight w-fit">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <LucideRadar className="h-5 w-5" />
            </div>
            <span className="text-foreground">Observiq</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-2">Sign in to your account to continue monitoring your infrastructure.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/90" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground/90" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 mt-2 shadow-sm"
            >
              {loading ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
              {!loading && <LucideArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-foreground hover:underline underline-offset-4">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Informative Panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-l border-border bg-muted/40 p-12 text-foreground">
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center h-full">
          <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border shadow-sm">
             <LucideActivity className="h-6 w-6 text-foreground" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4 leading-tight text-foreground">
            Monitor infrastructure.<br/>
            Resolve incidents faster.
          </h2>
          <p className="text-lg mb-12 max-w-md leading-relaxed text-muted-foreground">
            Observiq provides you with a comprehensive toolkit to track uptime, alert your team, and communicate with customers seamlessly.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <LucideCheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Global Uptime Checks</h3>
                <p className="text-sm text-muted-foreground">Ping your endpoints from multiple regional locations to ensure worldwide availability.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <LucideShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">SSL & DNS Monitoring</h3>
                <p className="text-sm text-muted-foreground">Actively monitor certificate expirations and DNS resolution times.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto mx-auto w-full max-w-lg pt-12 border-t border-border">
          <span className="text-sm font-medium text-muted-foreground">© {new Date().getFullYear()} Observiq</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-foreground">All systems operational</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
