import * as productRepository from '../../repositories/staff/product.repository';
import { CreateProductRequest, InsertProductValues, ProductFilterParams, UpdateProductRequest, UpdateProductValues } from '../../types/staff/product.type';
import { deleteImageFromCloudinary } from '../../utils/cloudinary/upload.middleware';
import { createHttpError } from '../../exceptions/http.exception';
import { generateProductCode, handleImageCleanup } from '../../utils/product.utill';

const checkCategoryAndProductName = async (productData: CreateProductRequest | UpdateProductRequest, id?: number) => {
    const [categoryExists, productNameExists, productExists] = await Promise.all([
        productRepository.checkCategoryById(productData.category_id),
        productRepository.findProductByName(productData.name),
        id ? productRepository.findProductById(id) : null
    ]);
    if (!categoryExists) {
        await handleImageCleanup(productData.image_path);
        throw createHttpError(404, 'หมวดหมู่สินค้าที่เลือกไม่มีในระบบ');
    }
    if (productNameExists && (!id || productNameExists.id !== id)) {
        await handleImageCleanup(productData.image_path);
        throw createHttpError(409, 'ชื่อสินค้านี้มีในระบบแล้ว');
    }
    if (id && !productExists) {
        await handleImageCleanup(productData.image_path);
        throw createHttpError(404, 'ไม่พบสินค้าที่ต้องการแก้ไข');
    }
    return productExists?.image_path || null;
}

export const getProducts = async (filters: ProductFilterParams) => {
    const { page, limit } = filters;
    const [products, totalItems] = await Promise.all([
        productRepository.findProducts(filters),
        productRepository.countProducts(filters)
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
        throw createHttpError(404, 'ไม่พบสินค้าที่ต้องการ');
    }
    return product;
}

export const createProduct = async (productData: CreateProductRequest, createdBy: number) => {
    await checkCategoryAndProductName(productData);
    const product_code = await generateProductCode();
    const values: InsertProductValues = {
        product_code: product_code,
        category_id: productData.category_id,
        name: productData.name,
        description: productData.description,
        base_price: productData.base_price,
        image_path: productData.image_path || '',
        created_by: createdBy,
    }
    await productRepository.insertProduct(values);
    return;
}

export const updateProduct = async (productData: UpdateProductRequest, id: number, updatedBy: number) => {
    const imagePathExists = await checkCategoryAndProductName(productData, id);
    let imageUrl: string = imagePathExists || '';
    // ถ้ามีการเปลี่ยนรูปใหม่
    if (productData.image_path && productData.image_path !== imageUrl) {
        // ลบรูปเก่าออกจาก Cloudinary
        await handleImageCleanup(imageUrl);
        imageUrl = productData.image_path;
    }
    const values: UpdateProductValues = {
        category_id: productData.category_id,
        name: productData.name,
        description: productData.description,
        base_price: productData.base_price,
        image_path: imageUrl || '',
        is_active: productData.is_active !== undefined ? productData.is_active : true,
        updated_by: updatedBy,
    };
    await productRepository.updateProductById(values, id);
    return;
}

export const deleteProduct = async (id: number) => {
    const existingProduct = await productRepository.findProductById(id);
    if (!existingProduct) {
        throw createHttpError(404, 'ไม่พบสินค้าที่ต้องการลบ');
    }
    await productRepository.deleteProductById(id);
    if (existingProduct.image_path) {
        await deleteImageFromCloudinary(existingProduct.image_path);
    }
    return;
}