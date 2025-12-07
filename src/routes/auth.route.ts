import { Router } from "express";
import * as authController from '../controllers/auth.controller';
const router = Router();
const BASE_URL = '/auth';

router.post(`${BASE_URL}/login`, authController.login);
router.post(`${BASE_URL}/register`, authController.register);

export default router;
