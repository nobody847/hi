import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();

let initPromise: Promise<void> | null = null;

async function initialize() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await registerRoutes(app);

        app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
          const status = err.status || err.statusCode || 500;
          const message = err.message || "Internal Server Error";
          console.error("API Error:", err);
          res.status(status).json({ message });
        });
      } catch (error) {
        console.error("Failed to initialize API:", error);
        throw error;
      }
    })();
  }
  return initPromise;
}

app.use(async (req, res, next) => {
  await initialize();
  next();
});

export default app;
