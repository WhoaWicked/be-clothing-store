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