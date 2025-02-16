import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes/index.ts";
import initAuth from "./routes/auth.ts";
import logEventsRouter from "./routes/log-events.ts";

import cors from "cors";

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", indexRouter);
app.use('/api', logEventsRouter);

// Basic health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export async function startServer(port: string = '3000') {
  const authRouter = await initAuth(process.env.INITIAL_ADMIN_PASSWORD || 'admin123');
  app.use("/auth", authRouter);
  // error handler
  app.use(function (err: any, req: Request, res: Response, _next: NextFunction) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(500);
    res.render("error");
  });
  app.listen(+port, () => {
    console.log("Server is running on port", port);
  });
}

