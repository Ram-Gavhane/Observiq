export type WebsiteTick = {
  responseTimeMs: number;
  status: "UP" | "DOWN" | "UNKNOWN";
  createdAt: Date;
};
