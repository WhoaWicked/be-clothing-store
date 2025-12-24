import { Request, Response, NextFunction } from 'express';
import * as cartService from '../../services/user/cart.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const upsertCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { variantId, quantity } = req.body;
        if (!variantId || !quantity) {
            return res.status(400).json({ success: false, message: 'กรุณาเลือกสินค้าและจำนวน' });
        }
        const upsertCartItem = await cartService.upsertUserCart(userId, variantId, quantity);
        res.status(200).json({
            success: true,
            message: 'เพิ่มสินค้าลงในตะกร้าสำเร็จ',
            data: upsertCartItem
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const getCartItems = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const cartData = await cartService.getUserCartItems(userId);
        res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลตะกร้าสินค้าสำเร็จ',
            data: cartData
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const updateCartItemQuantity = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const cartItemId = Number(req.params.cartItemId);
        const { newQuantity } = req.body;
        if (!cartItemId || !newQuantity) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุสินค้าที่ต้องการอัพเดตและจำนวนใหม่' });
        }
        const updatedItem = await cartService.updateCartItemQuantity(userId, cartItemId, newQuantity);
        res.status(200).json({
            success: true,
            message: 'อัพเดตจำนวนสินค้าสำเร็จ',
            data: updatedItem
        });
    } catch (error: unknown) {
        next(error);
    }
}

export const removeCartItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const cartItemId = Number(req.params.cartItemId);
        if (!cartItemId) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุสินค้าที่ต้องการลบ' });
        }
        await cartService.removeItemFromCart(userId, cartItemId);
        res.status(200).json({
            success: true,
            message: 'ลบสินค้าจากตะกร้าสำเร็จ'
        });
    } catch (error: unknown) {
        next(error);
    }
}