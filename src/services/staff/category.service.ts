import * as categoryRepository from '../../repositories/staff/category.repository';
import { createHttpError } from '../../exceptions/http.exception';
import { CategoryFilterParams, CreateCategoryRequest, InsertCategoryValues, UpdateCategoryRequest, UpdateCategoryValues } from '../../types/staff/category.type';
import { generateCategoryCode } from '../../utils/category.utill';

export const getCategories = async (filters: CategoryFilterParams) => {
    const { page, limit } = filters;
    const [categories, totalItems] = await Promise.all([
        categoryRepository.findCategories(filters),
        categoryRepository.countCategories(filters)
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
    const existingName = await categoryRepository.findCategoryByName(categoryData.category_name);
    if (existingName) {
        throw createHttpError(409, 'ชื่อหมวดหมู่นี้มีในระบบแล้ว');
    }
    const category_code = await generateCategoryCode();
    const values: InsertCategoryValues = {
        category_name: categoryData.category_name,
        category_code: category_code,
        created_by: createdBy
    }
    await categoryRepository.insertCategory(values);
    return;
}

export const updateCategory = async (id: number, categoryData: UpdateCategoryRequest, updatedBy: number) => {
    const [existingCategory, existingName] = await Promise.all([
        categoryRepository.findCategoryById(id),
        categoryRepository.findCategoryByName(categoryData.category_name)
    ]);
    if (!existingCategory) {
        throw createHttpError(404, 'ไม่พบหมวดหมู่สินค้าที่ต้องการ');
    }
    if (existingName && existingName.id !== id) {
        throw createHttpError(409, 'ชื่อหมวดหมู่นี้มีในระบบแล้ว');
    }
    const values: UpdateCategoryValues = {
        category_name: categoryData.category_name,
        is_active: categoryData.is_active,
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