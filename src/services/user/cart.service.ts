import * as cartRepository from '../../repositories/user/cart.repository';
import { createHttpError } from '../../exceptions/http.exception';


export const upsertUserCart = async (userId: number, variantId: number, quantity: number) => {
    let cart = await cartRepository.findCartByUserId(userId);
    if (!cart) {
        cart = await cartRepository.insertCart(userId);
    }
    const productInfo = await cartRepository.checkProductStock(cart.id, variantId);
    if (!productInfo) {
        throw createHttpError(404, 'ไม่พบสินค้าที่ระบุ');
    }
    if (!productInfo.is_active) {
        throw createHttpError(400, 'สินค้าที่ระบุไม่พร้อมให้บริการ');
    }
    const totalQuantity = productInfo.current_cart_quantity + quantity;
    if (totalQuantity > productInfo.stock_quantity) {
        throw createHttpError(400, `สินค้าคงเหลือไม่เพียงพอ, คุณมีอยู่ในตะกร้า ${productInfo.current_cart_quantity} ชิ้น`);
    }
    const upsertCartItem = await cartRepository.upsertCartItemQuantity(cart.id, variantId, quantity);
    return upsertCartItem;
}

export const getUserCartItems = async (userId: number) => {
    const cartItems = await cartRepository.findMyCartItemsByUserId(userId);
    const totalCartPrice = cartItems.reduce((total, item) => total + Number(item.total_item_price), 0);
    const totalItems = cartItems.reduce((total, item) => total + Number(item.quantity), 0);
    return {
        items: cartItems,
        summary: {
            total_cart_items: totalItems,
            total_cart_price: totalCartPrice
        }
    }
}

export const updateCartItemQuantity = async (userId: number, cartItemId: number, newQuantity: number) => {
    const checkItem = await cartRepository.findCartItemForUpdate(userId, cartItemId);
    if (!checkItem) {
        throw createHttpError(404, 'ไม่พบสินค้าที่ระบุในตะกร้าของคุณ');
    }
    if (newQuantity > checkItem.stock_quantity) {
        throw createHttpError(400, `สินค้าคงเหลือไม่เพียงพอ`);
    }
    const updateItemQuantity = await cartRepository.updateCartItemQuantity(cartItemId, newQuantity);
    return updateItemQuantity;
}

export const removeItemFromCart = async (userId: number, cartItemId: number) => {
    const removeItem = await cartRepository.deleteCartItem(userId, cartItemId);
    if (!removeItem) {
        throw createHttpError(404, 'ไม่พบสินค้าที่ระบุในตะกร้าของคุณ');
    }
    return;
}