import Link from 'next/link';
import { Laptop, BookOpen } from 'lucide-react';

const userLinks = [
  { label: 'Add monitors', href: '/docs/user/monitoring' },
  { label: 'Incidents & alerts', href: '/docs/user/operations' },
  { label: 'API basics', href: '/docs/developer/api' },
];

const devLinks = [
  { label: 'Local setup', href: '/docs/developer/getting-started' },
  { label: 'Architecture', href: '/docs/developer/architecture' },
  { label: 'Contribution', href: '/docs/developer' },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-14 gap-10">
      <div className="max-w-3xl text-center space-y-3">
        <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-muted-foreground">observiq.docs</p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          Two lanes: User Docs and Developer Docs
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Choose the path that matches what you are doing right now—operate Better Uptime or build on it.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-5xl">
        <SectionCard
          icon={<BookOpen className="h-5 w-5" />}
          title="User Docs"
          description="Operate Better Uptime: monitors, incidents, notifications, status pages."
          href="/docs/user"
          links={userLinks}
          tone="user"
        />
        <SectionCard
          icon={<Laptop className="h-5 w-5" />}
          title="Developer Docs"
          description="Set up locally, understand architecture, extend monitors and alerts."
          href="/docs/developer"
          links={devLinks}
          tone="dev"
        />
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Need the whole tree? Go to{' '}
        <Link href="/docs" className="underline font-medium">
          full documentation
        </Link>
        .
      </p>
    </div>
  );
}

type SectionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  links: { label: string; href: string }[];
  tone: 'user' | 'dev';
};

function SectionCard({ icon, title, description, href, links, tone }: SectionCardProps) {
  const accent =
    tone === 'user'
      ? 'bg-emerald-50 text-emerald-900 border-emerald-100'
      : 'bg-sky-50 text-sky-900 border-sky-100';

  return (
    <div className={`rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-4`}>
      <div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-semibold ${accent}`}>
        {icon}
        <span>{title}</span>
      </div>
      <p className="text-base text-muted-foreground">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group inline-flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span>{link.label}</span>
            <span className="opacity-60 group-hover:translate-x-1 transition">→</span>
          </Link>
        ))}
      </div>
      <div>
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
        >
          View full {title}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
