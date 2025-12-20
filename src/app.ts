import express, { Express, Request, Response } from "express";
import cors from 'cors';
import healthCheckRouter from './routes/health-check.route';
import authRouter from './routes/auth.route';
import adminUserRouter from './routes/admin/user.route';
import staffProductRouter from './routes/staff/product.route';
import staffProductVariantRouter from './routes/staff/productVariant.route';
import staffCategoryRouter from './routes/staff/category.route';
import userProductRouter from './routes/user/product.route';
import userFilterRouter from './routes/user/filter.route';
import { errorMiddleware } from "./middlewares/error.middleware";

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response) => {
    res.send('Hello from BE Clothing API!');
});

app.use(healthCheckRouter);
app.use(authRouter);
app.use(adminUserRouter);
app.use(staffProductRouter);
app.use(staffProductVariantRouter);
app.use(staffCategoryRouter);
app.use(userProductRouter);
app.use(userFilterRouter);
app.use(errorMiddleware);

export default app;