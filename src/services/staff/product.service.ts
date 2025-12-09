import * as productRepository from '../../repositories/staff/product.repository';
import { CreateProductRequest, InsertProductValues, UpdateProductRequest, UpdateProductValues } from '../../types/staff/product.type';

export const getProducts = async (page: number = 1, limit: number = 10) => {
    const [products, totalItems] = await Promise.all([
        productRepository.findProducts(page, limit),
        productRepository.countProducts()
    ]);
    if (products.length === 0) {
        return {
            products: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: limit,
            }
        }
    }
    return {
        products,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            itemsPerPage: limit
        }
    }
}

export const getProductById = async (id: number) => {
    const product = await productRepository.findProductById(id);
    if (!product) {
        throw new Error('ไม่พบสินค้าที่ต้องการ');
    }
    return product;
}

export const createProduct = async (productData: CreateProductRequest, createdBy: number) => {
    const [checkCategory, existingProduct] = await Promise.all([
        productRepository.checkCategoryById(productData.category_id),
        productRepository.findProductByName(productData.name)
    ]);
    if (!checkCategory) {
        throw new Error('หมวดหมู่สินค้าที่เลือกไม่มีในระบบ');
    }
    if (existingProduct) {
        throw new Error('ชื่อสินค้านี้มีในระบบแล้ว');
    }
    const values: InsertProductValues = [
        productData.category_id,
        productData.name,
        productData.description,
        productData.base_price,
        productData.image_path || '',
        createdBy,
    ];
    await productRepository.insertProduct(values);
    return;
}

export const updateProduct = async (productData: UpdateProductRequest, id: number, updatedBy: number) => {
    const [checkCategory, existingProduct] = await Promise.all([
        productRepository.checkCategoryById(productData.category_id),
        productRepository.findProductByName(productData.name)
    ]);
    if (!checkCategory) {
        throw new Error('หมวดหมู่สินค้าที่เลือกไม่มีในระบบ');
    }
    if (existingProduct) {
        throw new Error('ชื่อสินค้านี้มีในระบบแล้ว');
    }
    const values: UpdateProductValues = {
        category_id: productData.category_id,
        name: productData.name,
        description: productData.description,
        base_price: productData.base_price,
        image_path: productData.image_path || '',
        is_active: productData.is_active !== undefined ? productData.is_active : true,
        updated_by: updatedBy,
    };
    await productRepository.updateProductById(values, id,);
    return;
}

export const deleteProduct = async (id: number) => {
    await productRepository.deleeteProductById(id);
    return;
}