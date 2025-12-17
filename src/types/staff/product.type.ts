export interface ProductList {
    id: number;
    product_code: string;
    category_id: number;
    category_name: string;
    gender_id: number;
    gender_name: string;
    product_name: string;
    description: string;
    base_price: number;
    image_path: string;
    best_seller: boolean;
    is_active: boolean;
    created_by: number;
    created_at: string;
}

export interface ProductById {
    id: number;
    product_code: string;
    category_id: number;
    gender_id: number;
    name: string;
    description: string;
    base_price: number;
    image_path: string;
    best_seller: boolean;
    is_active: boolean;
    created_by: number;
    created_at: string;
}

export interface CreateProductRequest {
    category_id: number;
    gender_id: number;
    product_name: string;
    description: string;
    base_price: number;
    image_path?: string;
}

// export type InsertProductValues = [
//     number,
//     string,
//     string,
//     number,
//     string,
//     number
// ]

export interface InsertProductValues {
    product_code: string;
    category_id: number;
    gender_id: number;
    product_name: string;
    description: string;
    base_price: number;
    image_path: string;
    created_by: number;
}

export interface UpdateProductRequest {
    category_id: number;
    gender_id: number;
    product_name: string;
    description: string;
    base_price: number;
    image_path?: string;
    best_seller?: boolean;
    is_active: boolean;
}

export interface UpdateProductValues {
    category_id: number;
    gender_id: number;
    product_name: string;
    description: string;
    base_price: number;
    image_path?: string;
    best_seller?: boolean;
    is_active: boolean;
    updated_by: number;
}

export interface ProductFilterParams {
    page: number;
    limit: number;
    product_code?: string;
    product_name?: string;
    category_name?: string;
    gender_name?: string;
}