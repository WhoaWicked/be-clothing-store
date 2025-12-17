export interface ProductOverviewFilters {
    page: number;
    limit: number;
    product_name?: string;
    category_name?: string[];
    gender_name?: string[];
}