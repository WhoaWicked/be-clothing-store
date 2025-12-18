import { Router } from "express";
import * as genderController from '../../controllers/user/filter.controller';
import { protect } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/filter';

router.get(`${BASE_URL}/gender/list`, protect, genderController.getGenders);
router.get(`${BASE_URL}/category/list`, protect, genderController.getCategories);
export default router;