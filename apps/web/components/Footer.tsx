import Link from 'next/link';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Github,
  LucideRadar
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A0B0E] text-zinc-400 py-16 px-6 border-t border-white/10 text-sm">
      <div className="mx-auto max-w-6xl">
        {/* Top Section - Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div>
            <h3 className="text-white font-semibold mb-6">Product</h3>
            <ul className="space-y-4">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Uptime Monitoring</Link></li>
              <li><Link href="/incidents" className="hover:text-white transition-colors">Incident Management</Link></li>
              <li><Link href="/statuspages" className="hover:text-white transition-colors">Status Pages</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Heartbeat Monitoring</Link></li>
              <li><Link href="/settings/notifications" className="hover:text-white transition-colors">Alerting & Routing</Link></li>
              <li><Link href="/settings/teams" className="hover:text-white transition-colors">Team Collaboration</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Integration Guides</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Community Forum</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-white transition-colors">About Observiq</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security & Compliance</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-6">Compare</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-white transition-colors">Observiq vs BetterStack</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Observiq vs Datadog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Observiq vs PagerDuty</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Observiq vs Statuspage</Link></li>
            </ul>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-10 mb-6 gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                <LucideRadar className="h-4 w-4 text-black" />
              </div>
              <span>Observiq</span>
            </div>
            <p className="text-zinc-500">
              Reliable monitoring, incident management, and status pages.<br />
              Built for high-performance engineering teams.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 w-full md:w-auto">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-zinc-400">
              <a href="mailto:support@observiq.com" className="hover:text-white transition-colors">support@observiq.com</a>
            </div>
            <div className="flex items-center gap-5 text-zinc-400">
               <Link href="https://github.com/Ram-Gavhane/Better-Uptime" target="_blank" className="hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://x.com/ram_gavhane_" target="_blank" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://www.linkedin.com/in/ram-gavhane/" target="_blank" className="hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Security Overview</Link>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hover:text-white transition-colors cursor-pointer">All Systems Operational</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Observiq. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
