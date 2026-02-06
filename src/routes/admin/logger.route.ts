import { Router } from "express";
import * as loggerController from '../../controllers/admin/logger.controller';
import { admin, protect } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/admin/activity-log';

router.get(`${BASE_URL}/list`, protect, admin, loggerController.getLogs);

export default router;