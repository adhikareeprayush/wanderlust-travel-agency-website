import app from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import mongoose from "mongoose";
try {
  await connectDb();
  const server = app.listen(env.port, () =>
    console.log(`Wanderlust API listening on :${env.port}`),
  );
  const shutdown = () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} catch (error) {
  console.error("Startup failed:", error.message);
  process.exit(1);
}
