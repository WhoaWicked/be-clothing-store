import * as productRepository from '../../repositories/staff/product.repository';
import { CreateProductRequest, InsertProductValues, UpdateProductRequest, UpdateProductValues } from '../../types/staff/product.type';
import { deleteImageFromCloudinary } from '../../utils/upload.middleware';
import { createHttpError } from '../../exceptions/http.exception';

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
        throw createHttpError(404, 'ไม่พบสินค้าที่ต้องการ');
    }
    return product;
}

export const createProduct = async (productData: CreateProductRequest, createdBy: number) => {
    const [checkCategory, existingName] = await Promise.all([
        productRepository.checkCategoryById(productData.category_id),
        productRepository.findProductByName(productData.name)
    ]);
    // ตรวจสอบหมวดหมู่สินค้า + ชื่อสินค้าว่ามีอยู่ในระบบหรือไม่
    // ถ้าไม่มีให้ลบรูปที่อัพโหลดไปแล้วออกจาก Cloudinary
    if (!checkCategory) {
        if (productData.image_path) {
            await deleteImageFromCloudinary(productData.image_path);
        }
        throw createHttpError(404, 'หมวดหมู่สินค้าที่เลือกไม่มีในระบบ');
    }

    if (existingName) {
        if (productData.image_path) {
            await deleteImageFromCloudinary(productData.image_path);
        }
        throw createHttpError(409, 'ชื่อสินค้านี้มีในระบบแล้ว');
    }
    let product_code: string;
    let isUnique = false;
    let attempt = 0;
    while (!isUnique && attempt < 10) {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        product_code = `PDT-${generatedCode}`;
        const existingCode = await productRepository.findProductByCode(product_code);
        if (!existingCode) {
            isUnique = true;
        }
        attempt++;
    }
    if (!isUnique) {
        throw createHttpError(500, 'ไม่สามารถสร้างรหัสสินค้าที่ไม่ซ้ำได้ กรุณาลองใหม่อีกครั้ง');
    }
    const values: InsertProductValues = {
        product_code: product_code!,
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
    const [checkCategory, existingName, existingProduct] = await Promise.all([
        productRepository.checkCategoryById(productData.category_id),
        productRepository.findProductByName(productData.name),
        productRepository.findProductById(id)
    ]);
   
    // ตรวจสอบหมวดหมู่สินค้า + ชื่อสินค้าว่ามีอยู่ในระบบหรือไม่ + สินค้าที่จะแก้ไขมีอยู่จริงหรือไม่
    // ถ้าไม่มีให้ลบรูปที่อัพโหลดไปแล้วออกจาก Cloudinary
    if (!existingProduct) {
        if (productData.image_path) {
            await deleteImageFromCloudinary(productData.image_path);
        }
        throw createHttpError(404, 'ไม่พบสินค้าที่ต้องการแก้ไข');
    }
    if (!checkCategory) {
        if (productData.image_path) {
            await deleteImageFromCloudinary(productData.image_path);
        }
        throw createHttpError(404, 'หมวดหมู่สินค้าที่เลือกไม่มีในระบบ');
    }
    if (existingName && existingName.id !== id) {
        if (productData.image_path) {
            await deleteImageFromCloudinary(productData.image_path);
        }
        throw createHttpError(409, 'ชื่อสินค้านี้มีในระบบแล้ว');
    }

    let imageUrl: string = existingProduct.image_path;
    // ถ้ามีการเปลี่ยนรูปใหม่
    if (productData.image_path && productData.image_path !== imageUrl) {
        // ลบรูปเก่าออกจาก Cloudinary
        if (imageUrl) {
            await deleteImageFromCloudinary(imageUrl);
        }
        imageUrl = productData.image_path;
    }
    const values: UpdateProductValues = {
        category_id: productData.category_id,
        name: productData.name,
        description: productData.description || '',
        base_price: productData.base_price,
        image_path: imageUrl || '',
        is_active: productData.is_active !== undefined ? productData.is_active : true,
        updated_by: updatedBy,
    };
    await productRepository.updateProductById(values, id,);
    return;
}

export const deleteProduct = async (id: number) => {
    const existingProduct = await productRepository.findProductById(id);
    if (!existingProduct) {
        throw createHttpError(404, 'ไม่พบสินค้าที่ต้องการลบ');
    }
    await productRepository.deleeteProductById(id);
    if (existingProduct.image_path) {
        await deleteImageFromCloudinary(existingProduct.image_path);
    }
    return;
}