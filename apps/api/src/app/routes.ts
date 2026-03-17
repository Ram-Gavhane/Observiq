import type { Express } from "express";
import authRoutes from "../modules/auth/auth.routes";
import websitesRoutes from "../modules/websites/websites.routes";
import statuspageRoutes from "../modules/statuspage/statuspage.routes";
import notificationRoutes from "../modules/notification/notification.routes";

export const registerRoutes = (app: Express) => {
  app.get("/", (req, res) => {
    res.send("Backend is up");
  });

  app.use(authRoutes);
  app.use(websitesRoutes);
  app.use(statuspageRoutes);
  app.use(notificationRoutes);
};
