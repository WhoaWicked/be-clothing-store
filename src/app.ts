import express, { Express, Request, Response } from "express";
import cors from 'cors';
import healthCheckRouter from './routes/health-check.route';
import authRouter from './routes/auth.route';
import adminUserRouter from './routes/admin/user.route';
import { errorMiddleware } from "./middlewares/error.middleware";

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(healthCheckRouter);
app.use(authRouter);
app.use(adminUserRouter);

app.use(errorMiddleware);

export default app;