import type { REGION as RegionEnum } from "@repo/db";

type MonitorJob = {
  id: string;
  type: string;
  target: string;
  region: RegionEnum;
  config?: Record<string, unknown>;
};

type CheckExecutionResult = {
  status: "UP" | "DOWN" | "DEGRADED" | "UNKNOWN";
  startedAt: Date;
  finishedAt: Date;
  durationMs?: number;
  summary?: string;
  details: Record<string, unknown>;
};

import tls from "tls";

export async function runSslCheck(job: MonitorJob): Promise<CheckExecutionResult> {
  const startedAt = new Date();
  const host = job.target;
  const port = (job.config as any)?.port ?? 443;
  const expiryThresholdDays = (job.config as any)?.expiryThresholdDays ?? 14;

  return new Promise(resolve => {
    const socket = tls.connect(
      { host, port, servername: host, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate();
        if (!cert || !cert.valid_to) {
          socket.end();
          return resolve({
            status: "DOWN",
            startedAt,
            finishedAt: new Date(),
            details: { error: "No certificate presented" },
          });
        }
        const now = new Date();
        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        let status: "UP" | "DOWN" | "DEGRADED" = "UP";
        if (now < validFrom || now > validTo) status = "DOWN";
        else if (daysRemaining <= expiryThresholdDays) status = "DEGRADED";

        socket.end();
        resolve({
          status,
          startedAt,
          finishedAt: new Date(),
          durationMs: Date.now() - startedAt.getTime(),
          details: {
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysRemaining,
            issuer: cert.issuer,
            subject: cert.subject,
            altNames: cert.subjectaltname,
          },
        });
      }
    );

    socket.setTimeout(8000, () => {
      socket.destroy();
      resolve({
        status: "DOWN",
        startedAt,
        finishedAt: new Date(),
        details: { error: "TLS connection timeout" },
      });
    });

    socket.on("error", (err: any) => {
      resolve({
        status: "DOWN",
        startedAt,
        finishedAt: new Date(),
        details: { error: err.message },
      });
    });
  });


}
