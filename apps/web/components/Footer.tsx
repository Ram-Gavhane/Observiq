import Link from 'next/link';
import { 
  Linkedin, 
  Twitter, 
  Github,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mx-auto w-full max-w-5xl px-6 pb-12 pt-20 text-sm">
      {/* Faded vertical guide lines — continuous from sections above */}
      <div aria-hidden="true" className="absolute inset-0 -z-1 size-full overflow-hidden">
        <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-border via-border to-transparent md:left-8" />
        <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-border via-border to-transparent md:right-8" />
      </div>

      {/* Top separator */}
      <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent md:inset-x-12" />

      {/* Grid */}
      <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground">Product</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li><Link href="/dashboard" className="transition-colors hover:text-foreground">Uptime Monitoring</Link></li>
            <li><Link href="/incidents" className="transition-colors hover:text-foreground">Incident Management</Link></li>
            <li><Link href="/statuspages" className="transition-colors hover:text-foreground">Status Pages</Link></li>
            <li><Link href="/dashboard" className="transition-colors hover:text-foreground">Heartbeat Monitoring</Link></li>
            <li><Link href="/settings/notifications" className="transition-colors hover:text-foreground">Alerting &amp; Routing</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground">Resources</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li><Link href="#" className="transition-colors hover:text-foreground">Documentation</Link></li>
            <li><Link href="#" className="transition-colors hover:text-foreground">API Reference</Link></li>
            <li><Link href="#" className="transition-colors hover:text-foreground">Help Center</Link></li>
            <li><Link href="#" className="transition-colors hover:text-foreground">Integration Guides</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground">Company</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li><Link href="#" className="transition-colors hover:text-foreground">About Observiq</Link></li>
            <li><Link href="#" className="transition-colors hover:text-foreground">Careers</Link></li>
            <li><Link href="#" className="transition-colors hover:text-foreground">Blog</Link></li>
            <li><Link href="#" className="transition-colors hover:text-foreground">Security &amp; Compliance</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground">Compare</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li><Link href="#" className="transition-colors hover:text-foreground">vs BetterStack</Link></li>
            <li><Link href="#" className="transition-colors hover:text-foreground">vs Datadog</Link></li>
            <li><Link href="#" className="transition-colors hover:text-foreground">vs PagerDuty</Link></li>
            <li><Link href="#" className="transition-colors hover:text-foreground">vs Statuspage</Link></li>
          </ul>
        </div>
      </div>

      {/* Separator */}
      <div className="my-10 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      {/* Bottom bar */}
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="Observiq" className="h-5 w-5" />
          <span className="text-sm font-bold text-foreground">Observiq</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link href="#" className="transition-colors hover:text-foreground">Terms</Link>
          <Link href="#" className="transition-colors hover:text-foreground">Privacy</Link>
          <Link href="#" className="transition-colors hover:text-foreground">Security</Link>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>All Systems Operational</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <Link href="https://github.com/Ram-Gavhane/Better-Uptime" target="_blank" className="transition-colors hover:text-foreground">
            <Github className="h-4 w-4" />
          </Link>
          <Link href="https://x.com/ram_gavhane_" target="_blank" className="transition-colors hover:text-foreground">
            <Twitter className="h-4 w-4" />
          </Link>
          <Link href="https://www.linkedin.com/in/ram-gavhane/" target="_blank" className="transition-colors hover:text-foreground">
            <Linkedin className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Observiq. All rights reserved.
      </p>
    </footer>
  );
}
