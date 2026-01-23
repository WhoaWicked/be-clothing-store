import express, { Express, Request, Response } from "express";
import cors from 'cors';
import healthCheckRouter from './routes/health-check.route';
import authRouter from './routes/auth.route';
import adminUserRouter from './routes/admin/user.route';
import staffProductRouter from './routes/staff/product.route';
import staffProductVariantRouter from './routes/staff/productVariant.route';
import staffCategoryRouter from './routes/staff/category.route';
import staffOrderRouter from './routes/staff/order.route';
import userProductRouter from './routes/user/product.route';
import userFilterRouter from './routes/user/filter.route';
import userCartRouter from './routes/user/cart.route';
import userOrderRouter from './routes/user/order.route';
import userAddressRouter from './routes/user/address.route';
import userReviewRouter from './routes/user/review.route';
import userProfileRouter from './routes/user/profile.route';
import { webhookHandler } from './controllers/user/order.controller';
import { errorMiddleware } from "./middlewares/error.middleware";

const app: Express = express();

app.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

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
app.use(staffOrderRouter);
app.use(userProductRouter);
app.use(userFilterRouter);
app.use(userCartRouter);
app.use(userOrderRouter);
app.use(userAddressRouter);
app.use(userReviewRouter);
app.use(userProfileRouter);
app.use(errorMiddleware);

export default app;