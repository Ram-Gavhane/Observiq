import Link from 'next/link';
import { 
  LucideShieldCheck, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Github
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A0B0E] text-zinc-400 py-16 px-6 border-t border-white/10 text-sm">
      <div className="mx-auto max-w-6xl">
        {/* Top Section - Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div>
            <h3 className="text-white font-semibold mb-6">Solutions</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-white transition-colors">AI SRE</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">OpenTelemetry tracing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Log management</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Infrastructure monitoring</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Error tracking</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Real user monitoring</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Incident management</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Uptime monitoring</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Status page</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Data warehouse</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-white transition-colors">Help & Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Enterprise</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Dashboards</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-white transition-colors">Work at Better Uptime</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Engineering</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-6">Community</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-white transition-colors">What Is Incident Management? Beginner's Guide</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Best Datadog Alternatives to Consider in 2026</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">8 Best Free & Open Source Status Page Tools in 2026</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">13 Best Sentry Alternatives in 2026</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">15 Best Grafana Alternatives in 2026</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">The 10 Best Incident.io Alternatives in 2026</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">5 Most Used Incident Management Tools</Link></li>
            </ul>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-10 mb-6 gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <LucideShieldCheck className="h-6 w-6" />
              <span>Observiq</span>
            </div>
            <p className="text-zinc-500">
              30x cheaper than Datadog. Predictable pricing.<br />
              Exceptional customer support.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 w-full md:w-auto">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-zinc-400">
              <span>+1 (628) 900-3830</span>
              <span>[EMAIL_ADDRESS]</span>
            </div>
            <div className="flex items-center gap-5 text-zinc-400">
              <Link href="https://www.instagram.com/_ram_gavhane_/" target="_blank" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://www.linkedin.com/in/ram-gavhane/" target="_blank" className="hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="https://x.com/ram_gavhane_" target="_blank" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://github.com/Ram-Gavhane/Better-Uptime" target="_blank" className="hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">GDPR</Link>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="hover:text-white transition-colors cursor-pointer">System status</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>© 2026 Observiq, Inc.</span>
            <LucideShieldCheck className="h-3 w-3" />
          </div>
        </div>
      </div>
    </footer>
  );
}
