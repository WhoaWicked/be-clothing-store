import * as productVariantRepository from '../../repositories/staff/productVariant.repository';
import * as productRepository from '../../repositories/staff/product.repository';
import { createHttpError } from '../../exceptions/http.exception';
import { InsertVariantValues, UpdateVariantValues } from '../../types/staff/productVariant.type';
import { pool } from '../../config/db-middleware';

export const getProductVariantById = async (id: number) => {
    const productVariant = await productVariantRepository.findProductVariantById(id);
    if (!productVariant) {
        throw createHttpError(404, 'ไม่พบสินค้าตัวเลือกนี้');
    }
    return productVariant;
}

export const getProductVariantsByProductId = async (productId: number) => {
    const productVariants = await productVariantRepository.findProductVariantsByProductId(productId);
    if (productVariants.length === 0) {
        throw createHttpError(404, 'ไม่พบสินค้าตัวเลือกสำหรับสินค้านี้');
    }
    return productVariants;
}

export const createProductVariant = async (requestData: any, createdBy: number) => {
    const existingVariant = await productVariantRepository.findProductVariantByProductIdAndSize(requestData.product_id, requestData.size);
    const client = await pool.connect();
    if (existingVariant) {
        throw createHttpError(400, 'สินค้าตัวเลือกนี้มีอยู่แล้วสำหรับขนาดที่ระบุ');
    }
    const existingProduct = await productRepository.findProductById(requestData.product_id);
    if (!existingProduct) {
        throw createHttpError(404, 'ไม่พบสินค้านี้');
    }
    let sku_code: string = `${existingProduct.product_code}-${requestData.size}`;
    const values: InsertVariantValues = {
        product_id: requestData.product_id,
        sku_code: sku_code,
        size: requestData.size,
        stock_quantity: requestData.stock_quantity,
        created_by: createdBy
    };
    await productVariantRepository.insertProductVariant(client, values);
    return;
}

export const updateProductVariant = async (id: number, requestData: any, updatedBy: number) => {
    const existingVariant = await productVariantRepository.findProductVariantById(id);
    if (!existingVariant) {
        throw createHttpError(404, 'ไม่พบสินค้าตัวเลือกนี้');
    }
    const values: UpdateVariantValues = {
        stock_quantity: requestData.stock_quantity,
        updatedBy: updatedBy
    };
    // await productVariantRepository.updateProductVariantById(values, id);
    return;
}

export const deleteProductVariant = async (id: number) => {
    const existingVariant = await productVariantRepository.findProductVariantById(id);
    if (!existingVariant) {
        throw createHttpError(404, 'ไม่พบสินค้าตัวเลือกนี้');
    }
    await productVariantRepository.deleteProductVariantById(id);
    return;
}