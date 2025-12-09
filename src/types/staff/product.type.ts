export interface CreateProductRequest {
    category_id: number;
    name: string;
    description: string;
    base_price: number;
    image_path?: string;
}

export type InsertProductValues = [
    number,
    string,
    string,
    number,
    string,
    number
]

export interface UpdateProductRequest {
    category_id: number;
    name: string;
    description: string;
    base_price: number;
    image_path?: string;
    is_active: boolean;
}

export interface UpdateProductValues {
    category_id: number;
    name: string;
    description: string;
    base_price: number;
    image_path: string;
    is_active: boolean;
    updated_by: number;
}