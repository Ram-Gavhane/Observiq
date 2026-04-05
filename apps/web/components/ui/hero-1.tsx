import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ActivityIcon, ArrowRightIcon, ShieldCheckIcon } from "lucide-react";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import Link from "next/link";

export function HeroSection() {
	return (
		<section className="mx-auto w-full max-w-6xl px-6">
			{/* Top Shades */}
			<div
				aria-hidden="true"
				className="absolute inset-0 isolate hidden overflow-hidden contain-strict lg:block"
			>
				<div className="absolute inset-0 -top-14 isolate -z-10 bg-[radial-gradient(35%_80%_at_49%_0%,--theme(--color-foreground/.08),transparent)] contain-strict" />
			</div>

			{/* X Bold Faded Borders */}
			<div
				aria-hidden="true"
				className="absolute inset-0 mx-auto hidden min-h-screen w-full max-w-6xl lg:block"
			>
				<div className="mask-y-from-80% mask-y-to-100% absolute inset-y-0 left-0 z-10 h-full w-px bg-foreground/15" />
				<div className="mask-y-from-80% mask-y-to-100% absolute inset-y-0 right-0 z-10 h-full w-px bg-foreground/15" />
			</div>

			{/* main content */}

			<div className="relative flex flex-col items-center justify-center gap-6 pt-32 pb-30 text-center">
				{/* X Content Faded Borders */}
				<div
					aria-hidden="true"
					className="absolute inset-0 -z-1 size-full overflow-hidden"
				>
					<div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-8" />
					<div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-8" />
					<div className="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-12" />
					<div className="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-12" />
				</div>

				<div
					className={cn(
						"group mx-auto flex w-fit items-center gap-3 rounded-full border bg-card px-4 py-1.5 shadow",
						"fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out"
					)}
				>
					<ShieldCheckIcon className="size-4 text-emerald-500" />
					<span className="text-sm font-medium">Introducing Status Pages 2.0</span>
				</div>

				<h1
					className={cn(
						"fade-in slide-in-from-bottom-10 animate-in text-balance fill-mode-backwards text-center text-5xl font-extrabold tracking-tight delay-100 duration-500 ease-out md:text-6xl lg:text-7xl",
						"text-shadow-[0_0px_50px_theme(--color-foreground/.2)]"
					)}
				>
					Uptime monitoring <br /> for <span className="text-indigo-600 dark:text-indigo-400">modern teams</span>
				</h1>

				<p className="fade-in slide-in-from-bottom-10 mx-auto max-w-2xl animate-in fill-mode-backwards text-center text-lg text-foreground/80 delay-200 duration-500 ease-out sm:text-xl md:text-xl">
					The most reliable way to monitor your infrastructure. Beautiful status pages, lightning fast incident management, and automated on-call rotations.
				</p>

				<div className="fade-in slide-in-from-bottom-10 flex animate-in flex-row flex-wrap items-center justify-center gap-4 fill-mode-backwards pt-4 delay-300 duration-500 ease-out">
					<Link href="/signup">
						<Button className="rounded-full h-12 px-8 text-base font-bold shadow-lg" size="lg">
							Start Free Trial
							<ArrowRightIcon className="size-4 ms-2" />
						</Button>
					</Link>
					<Button className="rounded-full h-12 px-8 text-base font-bold" size="lg" variant="outline">
						<ActivityIcon className="size-4 mr-2" />
						Watch Demo
					</Button>
				</div>
			</div>
		</section>
	);
}

export function LogosSection() {
	return (
		<section className="relative space-y-6 pt-10 pb-20">
			<h2 className="text-center font-medium text-lg text-muted-foreground tracking-tight md:text-xl uppercase">
				Trusted by innovative engineering teams
			</h2>
			<div className="relative z-10 mx-auto max-w-5xl">
				<LogoCloud logos={logos} />
			</div>
		</section>
	);
}

const logos = [
	{
		src: "https://storage.efferd.com/logo/nvidia-wordmark.svg",
		alt: "Nvidia Logo",
	},
	{
		src: "https://storage.efferd.com/logo/supabase-wordmark.svg",
		alt: "Supabase Logo",
	},
	{
		src: "https://storage.efferd.com/logo/openai-wordmark.svg",
		alt: "OpenAI Logo",
	},
	{
		src: "https://storage.efferd.com/logo/turso-wordmark.svg",
		alt: "Turso Logo",
	},
	{
		src: "https://storage.efferd.com/logo/vercel-wordmark.svg",
		alt: "Vercel Logo",
	},
	{
		src: "https://storage.efferd.com/logo/github-wordmark.svg",
		alt: "GitHub Logo",
	},
	{
		src: "https://storage.efferd.com/logo/claude-wordmark.svg",
		alt: "Claude AI Logo",
	},
	{
		src: "https://storage.efferd.com/logo/clerk-wordmark.svg",
		alt: "Clerk Logo",
	},
];
