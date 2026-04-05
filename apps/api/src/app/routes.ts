import type { Express } from "express";
import authRoutes from "../modules/auth/auth.routes";
import monitorsRoutes from "../modules/monitors/monitors.routes";
import statuspageRoutes from "../modules/statuspage/statuspage.routes";
import notificationRoutes from "../modules/notification/notification.routes";
import incidentsRoutes from "../modules/incidents/incidents.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import { limiter } from "./rate-limiter";

export const registerRoutes = (app: Express) => {

  app.use(limiter);
  app.get("/", (req, res) => {
    res.json({ message: "Backend is up" });
  });

  app.use(authRoutes);
  app.use(monitorsRoutes);
  app.use(statuspageRoutes);
  app.use(notificationRoutes);
  app.use(incidentsRoutes);
  app.use(dashboardRoutes);
};
