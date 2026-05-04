import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import reviewCodeRoutes from "./routes/review-code-routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from either backend/.env or repo-root/.env (works for both src and dist builds).
config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), "../.env"), override: true });

const cookieSecret =
  process.env.COOKIE_SECRET?.trim() || process.env.JWT_SECRET?.trim();
if (!cookieSecret) {
  throw new Error(
    "Set JWT_SECRET (or COOKIE_SECRET) in .env — required for signed cookies."
  );
}

const app = express();

//middlewares
const corsOrigin =
  process.env.CORS_ORIGIN?.trim() ||
  process.env.FRONTEND_URL?.trim() ||
  "http://localhost:5173";
const allowedOrigins = corsOrigin
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      // allow same-origin / server-to-server / curl
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(cookieSecret));

//remove it in production
app.use(morgan("dev"));

app.get("/api/v1/health", (_req, res) => res.status(200).json({ ok: true }));

app.use("/api/v1", appRouter);
// Backwards-compatible alias for non-versioned endpoint requirement.
app.use("/api", reviewCodeRoutes);

export default app;