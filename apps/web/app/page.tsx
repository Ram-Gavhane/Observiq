import { Footer } from "@/components/Footer";
import { HeroSection, LogosSection } from "@/components/ui/hero-1";
import { Header } from "@/components/ui/header-1";
import {
  LucideZap,
  LucideClock,
  LucideBarChart3,
  LucideMail,
  LucideFileJson,
  LucideCheck,
  LucideArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <LogosSection />

        {/* ═══════════════════════════════════════════════════════════════
            Features Section — same faded-border grid treatment as hero
        ═══════════════════════════════════════════════════════════════ */}
        <section id="features" className="relative mx-auto w-full max-w-5xl py-28 px-6">
          {/* Faded vertical guide lines */}
          <div aria-hidden="true" className="absolute inset-0 -z-1 size-full overflow-hidden">
            <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-transparent md:left-8" />
            <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-transparent md:right-8" />
          </div>

          {/* Subtle top separator line */}
          <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent md:inset-x-12" />

          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Production Ready
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything you need to stay online
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Tools designed to help you maintain zero downtime,&nbsp;so your team can focus on building.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {[
              {
                title: "Status Pages",
                desc: "Hosted incident communication pages that match your brand. Keep users informed automatically.",
                icon: <LucideBarChart3 className="h-5 w-5" />,
              },
              {
                title: "Incident Management",
                desc: "Collaborate effectively when every second counts. Automated escalation & post-mortems.",
                icon: <LucideZap className="h-5 w-5" />,
              },
              {
                title: "On-Call Scheduling",
                desc: "Flexible rotations and escalation policies for your team. Never miss a critical alert again.",
                icon: <LucideClock className="h-5 w-5" />,
              },
            ].map((service, i) => (
              <div
                key={i}
                className="group relative flex flex-col bg-background p-8 transition-colors hover:bg-accent/40"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground">
                  {service.icon}
                </div>
                <h3 className="text-base font-bold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-foreground/60 transition-colors group-hover:text-foreground">
                  Learn more <LucideArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            Coming Soon Section
        ═══════════════════════════════════════════════════════════════ */}
        <section id="resources" className="relative mx-auto w-full max-w-5xl py-28 px-6">
          {/* Faded vertical guide lines */}
          <div aria-hidden="true" className="absolute inset-0 -z-1 size-full overflow-hidden">
            <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-transparent md:left-8" />
            <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-transparent md:right-8" />
          </div>

          {/* Subtle top separator */}
          <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent md:inset-x-12" />

          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Roadmap
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Coming Soon
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              We're expanding our capabilities to give you full visibility.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Proactive Alerting",
                desc: "Multi-channel alerts via SMS, Voice, and Push notifications. Reach your team wherever they are.",
                icon: <LucideMail className="h-5 w-5" />,
                tag: "Q2 2026",
              },
              {
                title: "Log Management",
                desc: "Centralize and search through your application logs in real-time. Full-text search, filters & retention policies.",
                icon: <LucideFileJson className="h-5 w-5" />,
                tag: "Q3 2026",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group flex items-start gap-5 rounded-2xl border border-border bg-background p-6 transition-colors hover:bg-accent/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-foreground">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold">{item.title}</h3>
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            Pricing Section
        ═══════════════════════════════════════════════════════════════ */}
        <section id="pricing" className="relative mx-auto w-full max-w-5xl py-28 px-6">
          {/* Faded vertical guide lines */}
          <div aria-hidden="true" className="absolute inset-0 -z-1 size-full overflow-hidden">
            <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-transparent md:left-8" />
            <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-transparent md:right-8" />
            <div className="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-transparent md:left-12" />
            <div className="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-transparent md:right-12" />
          </div>

          {/* Subtle top separator */}
          <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent md:inset-x-12" />

          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Pricing
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {/* Hobby */}
            <div className="relative flex flex-col bg-background p-8">
              <h3 className="text-base font-bold">Hobby</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                For personal projects.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">$0</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm">
                {[
                  "5 monitors",
                  "5-minute check interval",
                  "1 status page",
                  "Email notifications",
                  "7-day log retention",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-muted-foreground">
                    <LucideCheck className="h-4 w-4 shrink-0 text-foreground" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/signup"
                  className="flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold transition-colors hover:bg-accent"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Pro — highlighted */}
            <div className="relative flex flex-col bg-background p-8 ring-1 ring-foreground/10">
              {/* Glow accent */}
              <div aria-hidden="true" className="absolute inset-x-0 -top-px h-px bg-foreground/20" />
              <div aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px bg-foreground/20" />

              <div className="mb-4 w-fit rounded-full border border-foreground/15 bg-foreground/5 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                Most Popular
              </div>
              <h3 className="text-base font-bold">Pro</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                For growing teams.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">$29</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm">
                {[
                  "50 monitors",
                  "1-minute check interval",
                  "Unlimited status pages",
                  "SMS & email notifications",
                  "30-day log retention",
                  "Custom domains",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-muted-foreground">
                    <LucideCheck className="h-4 w-4 shrink-0 text-foreground" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/signup"
                  className="flex h-10 w-full items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Enterprise */}
            <div className="relative flex flex-col bg-background p-8">
              <h3 className="text-base font-bold">Enterprise</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                For scale infrastructure.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">$99</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm">
                {[
                  "Unlimited monitors",
                  "30-second interval",
                  "Unlimited pages",
                  "Voice & push alerts",
                  "90-day retention",
                  "SSO & SAML",
                  "Priority support",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-muted-foreground">
                    <LucideCheck className="h-4 w-4 shrink-0 text-foreground" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/signup"
                  className="flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold transition-colors hover:bg-accent"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CTA Section
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative mx-auto w-full max-w-5xl px-6 pb-28">
          {/* Faded vertical guide lines */}
          <div aria-hidden="true" className="absolute inset-0 -z-1 size-full overflow-hidden">
            <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-transparent md:left-8" />
            <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-transparent md:right-8" />
          </div>

          {/* Subtle top separator */}
          <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent md:inset-x-12" />

          <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-background py-20 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to start monitoring?
            </h2>
            <p className="max-w-md text-base text-muted-foreground">
              Join thousands of engineering teams already using Observiq to keep their services running.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-8 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Get Started Free
                <LucideArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-8 text-sm font-semibold transition-colors hover:bg-accent"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
