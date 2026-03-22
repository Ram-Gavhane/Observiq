import Link from "next/link";
import { LucideShieldCheck, LucideZap, LucideClock, LucideMail, LucideBarChart3, LucideFileJson, LucideCheck } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <LucideShieldCheck className="h-6 w-6 text-primary" />
            <span>Observiq</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#services" className="text-sm font-medium opacity-60 transition-opacity hover:opacity-100">Services</Link>
            <Link href="#pricing" className="text-sm font-medium opacity-60 transition-opacity hover:opacity-100">Pricing</Link>
            <Link href="#upcoming" className="text-sm font-medium opacity-60 transition-opacity hover:opacity-100">Upcoming</Link>
             <div className="flex gap-3 items-center"><Link href="/signin" className="text-sm font-medium opacity-60 transition-opacity hover:opacity-100">
                Sign In
              </Link>
              <Link href="/signup" className="rounded-full bg-primary px-4 py-2 ml-2 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 active:scale-95">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center py-24 px-6 text-center md:py-32">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Introducing Status Pages 2.0
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
              Uptime monitoring <br /> <span className="text-indigo-600 dark:text-indigo-400">for modern teams.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              The most reliable way to monitor your infrastructure. Beautiful status pages, lightning fast incident management, and automated on-call rotations.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup" className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-8 text-base font-bold text-primary-foreground transition-all hover:bg-slate-800 dark:hover:bg-slate-200 sm:w-auto">
                Start Free Trial
              </Link>
              <button className="h-12 w-full rounded-2xl border border-border bg-background px-8 text-base font-bold transition-all hover:bg-accent sm:w-auto">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="border-t border-border bg-zinc-50/50 py-24 px-6 dark:bg-zinc-900/10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Production Ready</h2>
              <p className="mt-4 text-lg text-muted-foreground font-medium">Tools designed to help you maintain zero downtime.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { 
                  title: "Status Pages", 
                  desc: "Hosted incident communication pages that match your brand.", 
                  icon: <LucideBarChart3 className="h-6 w-6" />,
                  color: "bg-blue-500"
                },
                { 
                  title: "Incident Management", 
                  desc: "Collaborate effectively when every second counts.", 
                  icon: <LucideZap className="h-6 w-6" />,
                  color: "bg-indigo-500"
                },
                { 
                  title: "On-Call Scheduling", 
                  desc: "Flexible rotations and escalation policies for your team.", 
                  icon: <LucideClock className="h-6 w-6" />,
                  color: "bg-emerald-500"
                }
              ].map((service, i) => (
                <div key={i} className="group relative rounded-3xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
                  <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${service.color} text-white`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold">{service.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Section */}
        <section id="upcoming" className="py-24 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 flex flex-col items-center text-center">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Coming Soon</h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">We're expanding our capabilities to give you full visibility.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "Proactive Alerting",
                  desc: "Multi-channel alerts via SMS, Voice, and Push notifications.",
                  icon: <LucideMail className="h-5 w-5" />,
                  tag: "Q2 2026"
                },
                {
                  title: "Log Management",
                  desc: "Centralize and search through your application logs in real-time.",
                  icon: <LucideFileJson className="h-5 w-5" />,
                  tag: "Q3 2026"
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-6 rounded-3xl border border-border bg-card p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider dark:bg-zinc-800">
                        {item.tag}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="border-t border-border bg-zinc-50/50 py-24 px-6 dark:bg-zinc-900/10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 flex flex-col items-center text-center">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Start free and scale as you grow. No hidden fees, no surprises.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {/* Hobby */}
              <div className="relative flex flex-col rounded-3xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
                <h3 className="text-lg font-bold">Hobby</h3>
                <p className="mt-1 text-sm text-muted-foreground">For personal projects and side hustles.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 flex flex-col gap-3 text-sm">
                  {["5 monitors", "5-minute check interval", "1 status page", "Email notifications", "7-day log retention"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <LucideCheck className="h-4 w-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link href="/signup" className="flex h-11 w-full items-center justify-center rounded-2xl border border-border bg-background text-sm font-bold transition-all hover:bg-accent">
                    Get Started Free
                  </Link>
                </div>
              </div>

              {/* Pro */}
              <div className="relative flex flex-col rounded-3xl border-2 border-indigo-500 bg-card p-8 shadow-xl shadow-indigo-500/10 transition-all hover:-translate-y-1">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  Most Popular
                </div>
                <h3 className="text-lg font-bold">Pro</h3>
                <p className="mt-1 text-sm text-muted-foreground">For growing teams and businesses.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 flex flex-col gap-3 text-sm">
                  {["50 monitors", "1-minute check interval", "Unlimited status pages", "SMS & email notifications", "30-day log retention", "Custom domains", "Team collaboration"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <LucideCheck className="h-4 w-4 text-indigo-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link href="/signup" className="flex h-11 w-full items-center justify-center rounded-2xl bg-indigo-500 text-sm font-bold text-white transition-all hover:bg-indigo-600">
                    Start Free Trial
                  </Link>
                </div>
              </div>

              {/* Enterprise */}
              <div className="relative flex flex-col rounded-3xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
                <h3 className="text-lg font-bold">Enterprise</h3>
                <p className="mt-1 text-sm text-muted-foreground">For large-scale infrastructure.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 flex flex-col gap-3 text-sm">
                  {["Unlimited monitors", "30-second check interval", "Unlimited status pages", "SMS, voice & push alerts", "90-day log retention", "SSO & SAML", "Priority support", "Custom SLAs"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <LucideCheck className="h-4 w-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link href="/signup" className="flex h-11 w-full items-center justify-center rounded-2xl border border-border bg-background text-sm font-bold transition-all hover:bg-accent">
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
