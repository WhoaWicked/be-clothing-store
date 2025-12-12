export interface InsertVariantValues {
    product_id: number;
    sku_code: string;
    size: string;
    stock_quantity: number;
    created_by: number;
}

export interface UpdateVariantValues {
    stock_quantity: number;
    updatedBy: number;
}

export interface CreateVariantRequest {
    product_id: number;
    size: string;
    stock_quantity: number;
}

export interface UpdateVariantRequest {
    stock_quantity: number;
}