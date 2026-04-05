import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { subjectsRouter } from "./modules/subjects/subjects.routes.js";
import { enrollmentsRouter } from "./modules/enrollments/enrollments.routes.js";
import { videosRouter } from "./modules/videos/videos.routes.js";
import { progressRouter } from "./modules/progress/progress.routes.js";
import { aiRouter } from "./modules/ai/ai.routes.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (env.clientOrigins.includes(origin)) {
        callback(null, origin);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/progress", progressRouter);
app.use("/api/ai", aiRouter);

app.use(errorMiddleware);

export { app };
