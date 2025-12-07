import { Router } from "express";
import * as userController from '../../controllers/admin/user.controller';
import { protect, admin } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/admin/user';

router.get(`${BASE_URL}/list`, protect, admin, userController.getUsers);
router.get(`${BASE_URL}/list/:id`, protect, admin, userController.getUserById);
router.post(`${BASE_URL}/create`, protect, admin, userController.createUser);
router.put(`${BASE_URL}/update/:id`, protect, admin, userController.updateUserById);
router.delete(`${BASE_URL}/delete/:id`, protect, admin, userController.deleteUserById);

export default router;