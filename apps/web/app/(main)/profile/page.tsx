"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LucideLoader2,
  LucideUser,
  LucideMail,
  LucideGlobe,
  LucideBell
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  _count: {
    websites: number;
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-6 border-none">
      <div className="flex flex-col gap-8 border-none">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information and view statistics.</p>
        </div>

        {profile && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Info Card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col gap-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground transition-transform hover:scale-105">
                  <LucideUser className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Account Details</h2>
                  <p className="text-sm text-muted-foreground">Basic information</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-2xl bg-zinc-50/50 p-4 dark:bg-zinc-900/50 shadow-sm border border-border/50">
                  <LucideMail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                    <p className="text-sm font-medium">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 rounded-2xl bg-zinc-50/50 p-4 dark:bg-zinc-900/50 shadow-sm border border-border/50">
                  <LucideUser className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">User ID</p>
                    <p className="text-sm font-medium break-all">{profile.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col gap-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div>
                <h2 className="text-xl font-bold">Usage Statistics</h2>
                <p className="text-sm text-muted-foreground">Overview of your activity</p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 h-full">
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-zinc-50/50 p-6 text-center dark:bg-zinc-900/50 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                    <LucideGlobe className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{profile._count.websites}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Monitored Websites</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-zinc-50/50 p-6 text-center dark:bg-zinc-900/50 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                    <LucideBell className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{profile._count.notificationChannels}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-1">Alert Channels</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
