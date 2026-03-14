"use client";

import { useState } from "react";
import { 
  LucideAlertOctagon,
  LucideClock,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideHardHat
} from "lucide-react";

export default function IncidentsPage() {
  // Demo data for the UI
  const [incidents] = useState([
    {
      id: "1",
      title: "API Performance Degradation",
      status: "Investigating",
      severity: "Major",
      component: "Core API",
      date: "2026-03-14T10:30:00Z",
    },
    {
      id: "2",
      title: "Database Connection Timeouts",
      status: "Resolved",
      severity: "Critical",
      component: "Database",
      date: "2026-03-13T14:15:00Z",
    },
    {
      id: "3",
      title: "Elevated Error Rates on US-East",
      status: "Monitoring",
      severity: "Minor",
      component: "Edge Network",
      date: "2026-03-12T09:00:00Z",
    }
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Incidents</h1>
            <p className="text-muted-foreground mt-1">Track and manage service disruptions.</p>
          </div>
        </div>

        {/* Feature In Progress Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-50 dark:bg-blue-950/20 p-6 shadow-sm">
          <div className="absolute -right-10 -top-10 opacity-10">
            <LucideHardHat className="h-40 w-40 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-3">
              <LucideHardHat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">Feature in Progress</h3>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-300 max-w-2xl">
                The Incidents management system is currently under active development. 
                This page shows a preview of how incidents will be displayed. Soon you'll be able 
                to create, update, and resolve incidents directly from this dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Incidents Table/Grid - Demo UI */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm opacity-70">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="px-6 py-4 font-bold">Incident</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Severity</th>
                  <th className="px-6 py-4 font-bold">Component</th>
                  <th className="px-6 py-4 font-bold">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {incidents.map((incident) => (
                  <tr key={incident.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 pointer-events-none">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <LucideAlertOctagon className="h-4 w-4 opacity-40 text-rose-500 rounded-lg" />
                        </div>
                        <span className="font-medium">{incident.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {incident.status === 'Resolved' && <LucideCheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {incident.status === 'Investigating' && <LucideAlertTriangle className="h-4 w-4 text-orange-500" />}
                        {incident.status === 'Monitoring' && <LucideClock className="h-4 w-4 text-blue-500" />}
                        <span className="font-medium text-muted-foreground">{incident.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        incident.severity === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                        incident.severity === 'Major' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted-foreground">{incident.component}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted-foreground">
                        {new Date(incident.date).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
