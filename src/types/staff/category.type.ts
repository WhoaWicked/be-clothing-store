export interface InsertCategoryValues {
    name: string;
    slug: string;
    category_code: string;
    created_by: number;
}

export interface UpdateCategoryValues {
    name: string;
    slug: string;
    updated_by: number;
}

export interface CreateCategoryRequest {
    name: string;
    slug: string;
}

export interface UpdateCategoryRequest {
    name: string;
    slug: string;
}