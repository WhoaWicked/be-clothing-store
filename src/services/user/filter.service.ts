import * as genderRepository from '../../repositories/user/filter.repository';
import { createHttpError } from '../../exceptions/http.exception';

export const getGenders = async () => {
    const genders = await genderRepository.findGenders();
    return genders;
}

export const getCategories = async () => {
    const categories = await genderRepository.findCategories();
    return categories;
}