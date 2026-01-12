import * as productRepository from '../../repositories/user/product.repository';
import { createHttpError } from '../../exceptions/http.exception';
import { ProductOverviewFilters } from '../../types/user/product.type';

export const getProducts = async (filters: ProductOverviewFilters) => {
    const { page, limit } = filters;
    const [products, totalItems] = await Promise.all([
        productRepository.findProducts(filters),
        productRepository.countProducts(filters)
    ]);
    if (products.length === 0) {
        return {
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit
            },
            products: []
        }
    }
    return {
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            itemsPerPage: limit
        },
        products
    }
}

export const getProductByCode = async (productCode: string) => {
    const product = await productRepository.findProductByCode(productCode);
    if (!product) {
        throw createHttpError(404, 'ไม่พบสินค้าที่คุณต้องการ');
    }
    return product;
}

export const getProductVariantByProductId = async (productId: number) => {
    const product = await productRepository.findProductById(productId);
    if (!product) {
        throw createHttpError(404, 'ไม่พบสินค้าที่คุณต้องการ');
    }
    const variants = await productRepository.findProductVariantByProductId(productId);
    if (!variants || variants.length === 0) {
        throw createHttpError(404, 'ไม่พบตัวเลือกสินค้าที่คุณต้องการ');
    }
    return variants;
}