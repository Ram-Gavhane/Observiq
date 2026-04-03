"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LucideArrowRight, LucideLoader2, LucideRadar, LucideActivity, LucideCheckCircle2, LucideShieldCheck } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/signup", {
        email,
        password,
        firstName,
        lastName,
      });

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
    <div className="flex min-h-screen bg-background text-foreground">
      
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h1>
            <p className="text-sm text-muted-foreground mt-2">Start monitoring your infrastructure in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/90" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Jane"
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/30"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/90" htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/30"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/90" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/90" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 mt-2 shadow-sm"
            >
              {loading ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
              {!loading && <LucideArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-foreground hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Informative Panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-l border-border bg-muted/40 p-12 text-foreground">
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center h-full">
          <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border shadow-sm">
             <LucideRadar className="h-6 w-6 text-foreground" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4 leading-tight text-foreground">
            Stop waiting for users <br/>to report downtime.
          </h2>
          <p className="text-lg mb-12 max-w-md leading-relaxed text-muted-foreground">
            Join thousands of engineering teams using Observiq to detect and resolve issues before they escalate.
          </p>

           <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <LucideCheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Instant Incident Routing</h3>
                <p className="text-sm text-muted-foreground">Route alerts to Slack, SMS, and Email automatically based on severity.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <LucideShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Beautiful Status Pages</h3>
                <p className="text-sm text-muted-foreground">Keep your customers updated with transparent, custom-branded status reports.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto mx-auto w-full max-w-lg pt-12 border-t border-border">
          <span className="text-sm font-medium text-muted-foreground">© {new Date().getFullYear()} Observiq</span>
          <div className="flex items-center gap-2 space-x-1 shrink-0">
             <div className="flex -space-x-2">
                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-card" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="User avatar" />
                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-card" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver`} alt="User avatar" />
                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-card" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Emma`} alt="User avatar" />
             </div>
             <span className="text-sm text-muted-foreground font-medium ml-2">Trusted by experts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
