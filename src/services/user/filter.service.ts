import * as genderRepository from '../../repositories/user/filter.repository';
import { createHttpError } from '../../exceptions/http.exception';

export const getGenders = async () => {
    const genders = await genderRepository.findGenders();
    if (genders.length === 0) {
        throw createHttpError(404, 'ไม่พบข้อมูลเพศ');
    }
    return genders;
}

export const getCategories = async () => {
    const categories = await genderRepository.findCategories();
    if (categories.length === 0) {
        throw createHttpError(404, 'ไม่พบข้อมูลหมวดหมู่');
    }
    return categories;
}