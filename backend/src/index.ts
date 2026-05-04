import app from "./app.js";
import { connectToDatabase } from "./db/connection.js";

// Start the HTTP server even if DB is down, so the frontend doesn't get ECONNREFUSED.
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);

function shutdown(signal: string) {
  console.log(`${signal} received: closing server...`);
  server.close(() => process.exit(0));
  // If something is stuck, don't keep the port occupied forever
  setTimeout(() => process.exit(1), 3000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

connectToDatabase()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err));
