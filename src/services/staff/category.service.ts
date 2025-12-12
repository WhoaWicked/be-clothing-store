import * as categoryRepository from '../../repositories/staff/category.repository';
import { createHttpError } from '../../exceptions/http.exception';
import { CreateCategoryRequest, InsertCategoryValues, UpdateCategoryRequest, UpdateCategoryValues } from '../../types/staff/category.type';

export const getCategories = async (page: number = 1, limit: number = 10) => {
    const [categories, totalItems] = await Promise.all([
        categoryRepository.findCategories(page, limit),
        categoryRepository.countCategories()
    ]);
    if (categories.length === 0) {
        return {
            categories: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: limit,
            }
        }
    }
    return {
        categories,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            itemsPerPage: limit
        }
    }
}

export const getCategoryById = async (id: number) => {
    const category = await categoryRepository.findCategoryById(id);
    if (!category) {
        throw createHttpError(404, 'ไม่พบหมวดหมู่สินค้าที่ต้องการ');
    }
    return category;
}

export const createCategory = async (categoryData: CreateCategoryRequest, createdBy: number) => {
    const [existingName, existingSlug] = await Promise.all([
        categoryRepository.findCategoryByName(categoryData.name),
        categoryRepository.findCategoryBySlug(categoryData.slug)
    ]);
    if (existingName) {
        throw createHttpError(409, 'ชื่อหมวดหมู่นี้มีในระบบแล้ว');
    }
    if (existingSlug) {
        throw createHttpError(409, 'Slug หมวดหมู่นี้มีในระบบแล้ว');
    }
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
    const values: InsertCategoryValues = {
        name: categoryData.name,
        slug: categoryData.slug,
        category_code: category_code!,
        created_by: createdBy
    }
    await categoryRepository.insertCategory(values);
    return;
}

export const updateCategory = async (id: number, categoryData: UpdateCategoryRequest, updatedBy: number) => {
    const existingCategory = await categoryRepository.findCategoryById(id);
    if (!existingCategory) {
        throw createHttpError(404, 'ไม่พบหมวดหมู่สินค้าที่ต้องการ');
    }
    const [existingName, existingSlug] = await Promise.all([
        categoryRepository.findCategoryByName(categoryData.name),
        categoryRepository.findCategoryBySlug(categoryData.slug)
    ]);
    if (existingName && existingName.id !== id) {
        throw createHttpError(409, 'ชื่อหมวดหมู่นี้มีในระบบแล้ว');
    }
    if (existingSlug && existingSlug.id !== id) {
        throw createHttpError(409, 'Slug หมวดหมู่นี้มีในระบบแล้ว');
    }
    const values: UpdateCategoryValues = {
        name: categoryData.name,
        slug: categoryData.slug,
        updated_by: updatedBy
    }
    await categoryRepository.updateCategoryById(values, id);
    return;
}

export const deleteCategory = async (id: number) => {
    const existingCategory = await categoryRepository.findCategoryById(id);
    if (!existingCategory) {
        throw createHttpError(404, 'ไม่พบหมวดหมู่สินค้าที่ต้องการ');
    }
    await categoryRepository.deleteCategoryById(id);
    return;
}