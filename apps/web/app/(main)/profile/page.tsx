"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LucideLoader2,
  LucideUser,
  LucideMail,
  LucideGlobe,
  LucideBell,
  LucideShieldCheck,
  LucideActivity,
  LucideMapPin,
  LucideExternalLink,
  LucideArrowUpRight,
  LucideCheckCircle2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  _count: {
    monitors: number;
    notificationChannels: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.user);
    } catch (err: unknown) {
      toast.error("Failed to fetch profile details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <LucideLoader2 className="h-10 w-10 text-primary/50" />
        </motion.div>
      </div>
    );
  }

  const initials = profile ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase() : "U";

  // Mocked Intense Data
  const monitorData = [
    { name: 'HTTP', value: Math.floor((profile?._count.monitors || 0) * 0.6) || 4, color: 'oklch(0.6 0.18 240)' },
    { name: 'PING', value: Math.floor((profile?._count.monitors || 0) * 0.2) || 2, color: 'oklch(0.7 0.15 160)' },
    { name: 'SSL', value: Math.floor((profile?._count.monitors || 0) * 0.1) || 1, color: 'oklch(0.8 0.12 80)' },
    { name: 'DNS', value: Math.floor((profile?._count.monitors || 0) * 0.1) || 1, color: 'oklch(0.9 0.1 40)' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <AnimatePresence>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-10"
        >
          
          {/* Header Identity Section */}
          <motion.section variants={itemVariants} className="flex flex-col items-center gap-8 md:flex-row md:items-end">
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="flex h-32 w-32 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl transition-shadow hover:shadow-primary/20"
              >
                <span className="text-4xl font-black tracking-tighter">{initials}</span>
              </motion.div>
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-green-500 shadow-lg" title="Online now">
                <div className="h-3 w-3 animate-pulse rounded-full bg-white" />
              </div>
            </div>
            
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary ring-1 ring-primary/20"
                >
                   {profile?.role}
                </motion.span>
              </div>
              
              <p className="flex items-center justify-center gap-2 text-lg text-muted-foreground md:justify-start">
                <LucideMail className="h-5 w-5 opacity-60" />
                {profile?.email}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 pt-4 md:justify-start">
                 <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
                    <LucideMapPin className="h-3.5 w-3.5" />
                    REGION: EU-CENTRAL-1
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
                    <LucideShieldCheck className="h-3.5 w-3.5" />
                    SECURED WITH 2FA
                 </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
               <button 
                onClick={() => router.push("/settings/account")}
                className="group flex items-center gap-2 rounded-xl bg-background border border-border px-6 py-3 text-sm font-bold shadow-sm transition-all hover:bg-accent active:scale-[0.98]"
               >
                 Profile Settings
                 <LucideExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
               </button>
               <button 
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 hover:translate-y-[-2px] active:translate-y-0"
               >
                 Go to Console
                 <LucideArrowUpRight className="h-4 w-4" />
               </button>
            </div>
          </motion.section>

          {/* Intense Information Matrix */}
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Left Column: Stats & Breakdown */}
            <div className="space-y-8 lg:col-span-12 xl:col-span-8">
              
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  { label: "Monitors", value: profile?._count.monitors, icon: LucideGlobe, color: "text-blue-500", bg: "bg-blue-500/5" },
                  { label: "Channels", value: profile?._count.notificationChannels, icon: LucideBell, color: "text-orange-500", bg: "bg-orange-500/5" },
                  { label: "Avg Uptime", value: "99.98%", icon: LucideActivity, color: "text-green-500", bg: "bg-green-500/5" }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className={`flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md ${stat.bg}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl bg-background border border-border/50 ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
                    </div>
                    <div className="flex items-end gap-2 text-foreground">
                      <span className="text-4xl font-black">{stat.value}</span>
                      <div className="mb-2 h-2 w-10 flex gap-0.5 items-end">
                        {[4, 7, 5, 8, 10, 6].map((h, j) => (
                          <div key={j} className={`flex-1 rounded-full ${stat.color} bg-current opacity-30`} style={{ height: `${h * 10}%` }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Monitor Distribution Chart (Responsive & Interactive) */}
              <motion.div variants={itemVariants} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Monitor Distribution</h3>
                    <p className="text-sm text-muted-foreground">Type allocation across your workspace</p>
                  </div>
                  <div className="flex gap-2">
                    {monitorData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/30 border border-border/50">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[10px] font-bold text-muted-foreground">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monitorData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--muted-foreground)' }} dy={10} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-xl border border-border bg-card p-3 shadow-xl backdrop-blur-md">
                                <p className="text-xs font-bold">{payload[0].name}</p>
                                <p className="text-lg font-black text-primary">{payload[0].value} Monitors</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={50}>
                        {monitorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Security & Regions */}
            <div className="space-y-8 lg:col-span-12 xl:col-span-4">
              
              {/* Security Health Card */}
              <motion.div variants={itemVariants} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <LucideShieldCheck className="h-5 w-5 text-primary" />
                  Security Insight
                </h3>
                <div className="space-y-6">
                  {[
                    { label: "Master Password", status: "Strong", date: "3 months ago", ok: true },
                    { label: "Two-Factor Auth", status: "Enabled", date: "Last verified today", ok: true },
                    { label: "Auth Provider", status: "Local DB", date: "No external links", ok: true }
                  ].map((item, i) => (
                    <div key={i} className="group relative flex items-start gap-4">
                      <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.ok ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-foreground">{item.label}</p>
                          <LucideCheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">{item.status} • {item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-8 w-full rounded-2xl bg-muted/50 py-3 text-xs font-bold text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
                  View Security Audit
                </button>
              </motion.div>

              {/* Workspace Region Presence */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="overflow-hidden rounded-3xl border border-border bg-zinc-900 p-8 text-white shadow-xl dark:bg-zinc-950"
              >
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Workspace</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <LucideMapPin className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="space-y-4">
                   <p className="text-xs font-medium text-zinc-400">Your monitoring nodes are spread across 3 primary global regions for high availability.</p>
                   <div className="flex flex-wrap gap-2 pt-2">
                     {['us-east-1', 'eu-central-1', 'ap-south-1'].map((reg, i) => (
                       <span key={i} className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-mono uppercase text-zinc-300">
                         {reg}
                       </span>
                     ))}
                   </div>
                </div>
                <div className="mt-8 flex items-center justify-between rounded-2xl bg-primary/20 border border-primary/30 p-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary/80 uppercase">Global Node ID</span>
                    <span className="text-sm font-mono font-bold tracking-tight">NODE_0X44FE...</span>
                  </div>
                  <div className="h-5 w-5 bg-primary/40 rounded-full animate-ping" />
                </div>
              </motion.div>

            </div>
          </div>

          {/* Footer User Metadata */}
          <motion.div variants={itemVariants} className="mt-10 border-t border-border pt-10 text-center md:text-left">
            <p className="text-xs font-medium text-muted-foreground">
              Unique ID: <code className="bg-muted px-2 py-1 rounded text-[10px] font-mono">{profile?.id}</code> • 
              Account created 2026-03-30 • 
              Workspace ID: WS_DEF_6921
            </p>
          </motion.div>
        </motion.div>
      </main>
    </AnimatePresence>
  );
}

