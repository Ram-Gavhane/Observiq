import type { Express } from "express";
import rateLimit from 'express-rate-limit';
import authRoutes from "../modules/auth/auth.routes";
import monitorsRoutes from "../modules/monitors/monitors.routes";
import statuspageRoutes from "../modules/statuspage/statuspage.routes";
import notificationRoutes from "../modules/notification/notification.routes";
import incidentsRoutes from "../modules/incidents/incidents.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";

export const registerRoutes = (app: Express) => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP address',
      retryAfter: '15 minutes',
      documentation: 'https://betteruptime.com/docs/rate-limits'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      console.log("Rate limit exceeded");
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP, please try again later',
        retryAfter: Math.round(req.rateLimit.resetTime / 1000)
      });
    }
  });
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
