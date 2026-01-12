import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as addressService from '../../services/user/address.service';
import { Request, Response, NextFunction } from 'express';

export const getAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const addresses = await addressService.getAddresses(userId);
        res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลที่อยู่สำเร็จ',
            data: addresses
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const getAddressById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const addressId = Number(req.params.addressId);
        if (!addressId || addressId <= 0) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุที่อยู่ที่ต้องการ' });
        }
        const address = await addressService.getAddressById(addressId, userId);
        res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลที่อยู่สำเร็จ',
            data: address
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const createAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { street, sub_district, district, province, zip_code, first_name, last_name, phone } = req.body;
        if (!street || !sub_district || !district || !province || !zip_code || !first_name || !last_name || !phone) {
            return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน' });
        }
        const values = { street, sub_district, district, province, zip_code, first_name, last_name, phone };
        const newAddress = await addressService.createAddress(userId, values);
        res.status(201).json({
            success: true,
            message: 'สร้างที่อยู่ใหม่สำเร็จ',
            data: newAddress
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const updateAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const addressId = Number(req.params.addressId);
        const { street, sub_district, district, province, zip_code, first_name, last_name, phone } = req.body;
        if (!addressId || addressId <= 0) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุที่อยู่ที่ต้องการอัพเดต' });
        }
        if (!street || !sub_district || !district || !province || !zip_code || !first_name || !last_name || !phone) {
            return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน' });
        }
        const values = { street, sub_district, district, province, zip_code, first_name, last_name, phone };
        const updatedAddress = await addressService.updateAddress(addressId, userId, values);
        res.status(200).json({
            success: true,
            message: 'อัพเดตที่อยู่สำเร็จ',
            data: updatedAddress
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const addressId = Number(req.params.addressId);
        if (!addressId || addressId <= 0) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุที่อยู่ที่ต้องการลบ' });
        }
        await addressService.deleteAddress(addressId, userId);
        res.status(200).json({
            success: true,
            message: 'ลบที่อยู่สำเร็จ',
        });
    } catch (error: unknown) {
        next(error);
    }
}