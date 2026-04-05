import "express";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      sessionId?: string;
      rateLimit: {
        windowMs: number;
        max: number;
        message: string;
        statusCode: number;
        resetTime: number;
      }
    }
  }
}
