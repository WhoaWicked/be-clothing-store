import * as productRepository from '../../repositories/staff/product.repository';
import * as productVariantRepository from '../../repositories/staff/productVariant.repository';
import { CreateProductRequest, InsertProductValues, ProductFilterParams, UpdateProductRequest, UpdateProductValues } from '../../types/staff/product.type';
import { deleteImageFromCloudinary } from '../../utils/cloudinary/upload.middleware';
import { createHttpError } from '../../exceptions/http.exception';
import { generateProductCode, handleImageCleanup } from '../../utils/product.utill';
import { pool } from '../../config/db-middleware';

const checkCategoryAndProductName = async (productData: CreateProductRequest | UpdateProductRequest, id?: number) => {
    const [categoryExists, genderExists, productNameExists, productExists] = await Promise.all([
        productRepository.checkCategoryById(productData.category_id),
        productRepository.checkGenderById(productData.gender_id),
        productRepository.findProductByName(productData.product_name),
        id ? productRepository.findProductById(id) : null
    ]);
    if (!categoryExists) {
        await handleImageCleanup(productData.image_path);
        throw createHttpError(404, 'หมวดหมู่สินค้าที่เลือกไม่มีในระบบ');
    }
    if (!genderExists) {
        await handleImageCleanup(productData.image_path);
        throw createHttpError(404, 'เพศสินค้าที่เลือกไม่มีในระบบ');
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

export const getProductById = async (id: number) => {
    const product = await productRepository.findProductById(id);
    if (!product) {
        throw createHttpError(404, 'ไม่พบสินค้าที่ต้องการ');
    }
    return product;
}

// export const createProduct = async (productData: CreateProductRequest, createdBy: number) => {
//     await checkCategoryAndProductName(productData);
//     const product_code = await generateProductCode();
//     const values: InsertProductValues = {
//         product_code: product_code,
//         category_id: productData.category_id,
//         gender_id: productData.gender_id,
//         product_name: productData.product_name,
//         description: productData.description,
//         base_price: productData.base_price,
//         image_path: productData.image_path || '',
//         created_by: createdBy,
//     }
//     await productRepository.insertProduct(values);
//     return;
// }
export const createProduct = async (productData: CreateProductRequest, createdBy: number) => {
    await checkCategoryAndProductName(productData);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const product_code = await generateProductCode();
        const values: InsertProductValues = {
            product_code: product_code,
            category_id: productData.category_id,
            gender_id: productData.gender_id,
            product_name: productData.product_name,
            description: productData.description,
            base_price: productData.base_price,
            image_path: productData.image_path || '',
            created_by: createdBy,
        }
        const insertProduct = await productRepository.insertProduct(client, values);
        const newProductId = insertProduct.id;
        // เพิ่มตัวเลือกขนาดสินค้า
        for (const variant of productData.variants) {
            const existingSize = await productVariantRepository.findProductVariantByProductIdAndSize(newProductId, variant.size);
            if (existingSize) {
                throw createHttpError(409, `ขนาด ${variant.size} มีในระบบแล้วสำหรับสินค้านี้`);
            }
            await productVariantRepository.insertProductVariant(client, {
                product_id: newProductId,
                sku_code: `${product_code}-${variant.size}`,
                size: variant.size,
                stock_quantity: variant.stock_quantity,
                created_by: createdBy
            });
        }
        await client.query('COMMIT');
        return;
    } catch (error) {
        await client.query('ROLLBACK');
        await handleImageCleanup(productData.image_path);
        throw createHttpError(500, 'เกิดข้อผิดพลาดในการสร้างสินค้า: ' + (error as Error).message);
    } finally {
        client.release();
    }
}

export const updateProduct = async (productData: UpdateProductRequest, id: number, updatedBy: number) => {
    const imagePathExists = await checkCategoryAndProductName(productData, id);
    const client = await pool.connect();
    try {
        let imageUrl: string = imagePathExists || '';
        // ถ้ามีการเปลี่ยนรูปใหม่
        if (productData.image_path && productData.image_path !== imageUrl) {
            // ลบรูปเก่าออกจาก Cloudinary
            await handleImageCleanup(imageUrl);
            imageUrl = productData.image_path;
        }
        const values: UpdateProductValues = {
            category_id: productData.category_id,
            gender_id: productData.gender_id,
            product_name: productData.product_name,
            description: productData.description,
            base_price: productData.base_price,
            image_path: imageUrl || '',
            best_seller: productData.best_seller !== undefined ? productData.best_seller : false,
            is_active: productData.is_active !== undefined ? productData.is_active : true,
            updated_by: updatedBy,
        };
        await productRepository.updateProductById(client, values, id);
        const productVariants = productData.variants;
        for (const variant of productVariants) {
            if (variant.id) {
                const existingVariant = await productVariantRepository.findProductVariantsByProductIdAndId(id, variant.id);
                if (!existingVariant) {
                    throw createHttpError(404, `ไม่พบสินค้าตัวเลือกที่มี id ${variant.id} สำหรับสินค้านี้`);
                }
                const updateValues = {
                    stock_quantity: variant.stock_quantity,
                    updatedBy: updatedBy
                }
                await productVariantRepository.updateProductVariantById(client, updateValues, variant.id);
            } else {
                const existingSize = await productVariantRepository.findProductVariantByProductIdAndSize(id, variant.size);
                if (existingSize) {
                    throw createHttpError(409, `ขนาด ${variant.size} มีในระบบแล้วสำหรับสินค้านี้`);
                }
                const product = await productRepository.findProductById(id);
                if (!product) {
                    throw createHttpError(404, 'ไม่พบสินค้านี้');
                }
                let sku_code: string = `${product.product_code}-${variant.size}`;
                const insertValues = {
                    product_id: id,
                    sku_code: sku_code,
                    size: variant.size,
                    stock_quantity: variant.stock_quantity,
                    created_by: updatedBy
                }
                await productVariantRepository.insertProductVariant(client, insertValues);
            }
        }
        await client.query('COMMIT');
        return;
    } catch (error: unknown) {
        await client.query('ROLLBACK');
        await handleImageCleanup(productData.image_path);
        throw createHttpError(500, 'เกิดข้อผิดพลาดในการแก้ไขสินค้า: ' + (error as Error).message);
    } finally {
        client.release();
    }
}

// export const updateProducts = async (productData: UpdateProductRequest, id: number, updatedBy: number) => {
//     const imagePathExists = await checkCategoryAndProductName(productData, id);
//     let imageUrl: string = imagePathExists || '';
//     // ถ้ามีการเปลี่ยนรูปใหม่
//     if (productData.image_path && productData.image_path !== imageUrl) {
//         // ลบรูปเก่าออกจาก Cloudinary
//         await handleImageCleanup(imageUrl);
//         imageUrl = productData.image_path;
//     }
//     const values: UpdateProductValues = {
//         category_id: productData.category_id,
//         gender_id: productData.gender_id,
//         product_name: productData.product_name,
//         description: productData.description,
//         base_price: productData.base_price,
//         image_path: imageUrl || '',
//         best_seller: productData.best_seller,
//         is_active: productData.is_active !== undefined ? productData.is_active : true,
//         updated_by: updatedBy,
//     };
//     // await productRepository.updateProductById(values, id);
//     return;
// }

export const deleteProduct = async (id: number) => {
    const existingProduct = await productRepository.findProductById(id);
    if (!existingProduct) {
        throw createHttpError(404, 'ไม่พบสินค้าที่ต้องการลบ');
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const productOrdered = await productRepository.checkProductOrdered(id);
        let responseMessage = '';
        if (productOrdered) {
            await productRepository.deleteProduct(client, id);
            await productRepository.deleteVariants(client, id);
            responseMessage = 'สินค้านี้มีการสั่งซื้อในระบบ จึงทำการซ่อนสินค้าแทนการลบ';
        } else {
            await productRepository.deleteProductById(client, id);
            if (existingProduct.image_path) {
                await deleteImageFromCloudinary(existingProduct.image_path);
            }
            responseMessage = 'ลบสินค้าออกจากระบบเรียบร้อยแล้ว';
        }
        await client.query('COMMIT');
        return responseMessage;
    } catch (error: unknown) {
        await client.query('ROLLBACK');
        throw createHttpError(500, 'เกิดข้อผิดพลาดในการลบสินค้า: ' + (error as Error).message);
    } finally {
        client.release();
    }
}