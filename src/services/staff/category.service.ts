import * as categoryRepository from '../../repositories/staff/category.repository';
import { createHttpError } from '../../exceptions/http.exception';
import { CategoryFilterParams, CreateCategoryRequest, InsertCategoryValues, UpdateCategoryRequest, UpdateCategoryValues } from '../../types/staff/category.type';
import { generateCategoryCode } from '../../utils/category.utill';
import { logActivity } from '../../utils/logger.util';

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

export const createCategory = async (categoryData: CreateCategoryRequest, createdBy: number, userContext: any) => {
    try {
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
        const categoryId = await categoryRepository.insertCategory(values);
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_CREATE_CATEGORY',
            resourceType: 'categories',
            resourceId: categoryId,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'สร้างหมวดหมู่สินค้าสำเร็จ',
                data: {
                    ...categoryData
                }
            }
        });
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_CREATE_CATEGORY_FAILED',
            resourceType: 'categories',
            resourceId: categoryData.category_name,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
                data: { ...categoryData }
            }
        });
        throw error;
    }
}

export const updateCategory = async (id: number, categoryData: UpdateCategoryRequest, updatedBy: number, userContext: any) => {
    try {
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
        const changes: Record<string, any> = {};
        const fieldToCheck = [
            'category_name',
            'is_active'
        ]
        fieldToCheck.forEach((field: any) => {
            const oldValue = (existingCategory as any)[field];
            const newValue = (categoryData as any)[field];
            if (oldValue !== newValue) {
                changes[field] = { old: oldValue, new: newValue };
            }
        });
        if (Object.keys(changes).length > 0) {
            logActivity({
                actorId: userContext.actorId,
                actorName: userContext.actorName,
                role: userContext.role,
                action: 'STAFF_UPDATE_CATEGORY',
                resourceType: 'categories',
                resourceId: id,
                ip: userContext.ip,
                userAgent: userContext.userAgent,
                isSuccess: true,
                details: {
                    message: 'แก้ไขหมวดหมู่สินค้าสำเร็จ',
                    diff: changes
                }
            });
        }
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_UPDATE_CATEGORY_FAILED',
            resourceType: 'categories',
            resourceId: id,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
                data: { ...categoryData }
            }
        });
        throw error;
    }
}

export const deleteCategory = async (id: number, userContext: any) => {
    try {
        const existingCategory = await categoryRepository.findCategoryById(id);
        if (!existingCategory) {
            throw createHttpError(404, 'ไม่พบหมวดหมู่สินค้าที่ต้องการ');
        }
        await categoryRepository.deleteCategoryById(id);
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_DELETE_CATEGORY',
            resourceType: 'categories',
            resourceId: id,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'ลบหมวดหมู่สินค้าสำเร็จ',
                data: { ...existingCategory }
            }
        });
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'STAFF_DELETE_CATEGORY_FAILED',
            resourceType: 'categories',
            resourceId: id,
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500
            }
        });
        throw error;
    }
}