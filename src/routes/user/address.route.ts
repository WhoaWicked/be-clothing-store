import { Router } from "express";
import * as addressController from '../../controllers/user/address.controller';
import { protect } from "../../middlewares/auth.middleware";
const router = Router();
const BASE_URL = '/user/address';

router.get(`${BASE_URL}/list`, protect, addressController.getAddresses);
router.get(`${BASE_URL}/list/:addressId`, protect, addressController.getAddressById);
router.post(`${BASE_URL}/create`, protect, addressController.createAddress);
router.put(`${BASE_URL}/update/:addressId`, protect, addressController.updateAddress);
router.delete(`${BASE_URL}/delete/:addressId`, protect, addressController.deleteAddress);

export default router;