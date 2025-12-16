import * as productRepository from '../repositories/staff/product.repository';
import { deleteImageFromCloudinary } from '../utils/cloudinary/upload.middleware';
import { createHttpError } from '../exceptions/http.exception';

export const generateProductCode = async () => {
    let product_code: string;
    let isUnique: boolean = false;
    let attempt: number = 0;
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
    return product_code!;
}

export const handleImageCleanup = async (imagePath?: string) => {
    if (imagePath) {
        await deleteImageFromCloudinary(imagePath);
    }
}