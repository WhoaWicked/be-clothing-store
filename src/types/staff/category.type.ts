export interface InsertCategoryValues {
    category_name: string;
    category_code: string;
    created_by: number;
}

export interface UpdateCategoryValues {
    category_name: string;
    updated_by: number;
    is_active?: boolean;
}

export interface CreateCategoryRequest {
    category_name: string;
}

export interface UpdateCategoryRequest {
    category_name: string;
    is_active?: boolean;
}

export interface CategoryFilterParams {
    page: number;
    limit: number;
    category_name?: string;
    category_code?: string;
}

export interface CategoryList {
    id: number;
    category_name: string;
    category_code: string;
    created_by: number;
    created_at: string;
}