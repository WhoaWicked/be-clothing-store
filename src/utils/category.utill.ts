import * as categoryRepository from '../repositories/staff/category.repository';
import { createHttpError } from '../exceptions/http.exception';

export const generateCategoryCode = async () => {
    let category_code: string;
    let isUnique: boolean = false;
    let attempt: number = 0;
    while (!isUnique && attempt < 10) {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        category_code = `CAT-${generatedCode}`;
        const existingCode = await categoryRepository.findCategoryByCode(category_code);
        if (!existingCode) {
            isUnique = true;
        }
        attempt++;
    }
    if (!isUnique) {
        throw createHttpError(500, 'ไม่สามารถสร้างรหัสสินค้าที่ไม่ซ้ำได้ กรุณาลองใหม่อีกครั้ง');
    }
    return category_code!;
}