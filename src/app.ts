import express, { Express, Request, Response } from "express";

const app: Express = express();

app.use(express.json());

export default app;