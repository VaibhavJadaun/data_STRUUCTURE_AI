import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../.env") });
// Prefer repo-root .env and allow overriding any stale env vars
config({ path: path.resolve(__dirname, "../../.env"), override: true });
const cookieSecret = process.env.COOKIE_SECRET?.trim() || process.env.JWT_SECRET?.trim();
if (!cookieSecret) {
    throw new Error("Set JWT_SECRET (or COOKIE_SECRET) in .env — required for signed cookies.");
}
const app = express();
//middlewares — Origin is the *frontend* URL (comma-separated allowed)
const corsRaw = process.env.FRONTEND_URL?.trim() ||
    process.env.CORS_ORIGIN?.trim() ||
    "http://localhost:5173";
const allowedOrigins = corsRaw.split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser(cookieSecret));
//remove it in production
app.use(morgan("dev"));
app.get("/", (_req, res) => {
    res.status(200).json({ ok: true, message: "API up", api: "/api/v1" });
});
app.use("/api/v1", appRouter);
export default app;
//# sourceMappingURL=app.js.map