import * as productService from '../../services/user/product.service';
import { Request, Response, NextFunction } from 'express';
import { ProductOverviewFilters } from '../../types/user/product.type';

const parseCommaSeparated = (value: string | undefined) =>
    value ? value.split(',').map(name => name.trim()) : undefined;

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters: ProductOverviewFilters = {
            page: Number(req.query.page) || 1,       // default = 1
            limit: Number(req.query.limit) || 10,    // default = 10
            product_name: req.query.product_name as string || undefined,
            category_name: parseCommaSeparated(req.query.category_name as string),
            gender_name: parseCommaSeparated(req.query.gender_name as string)
        }
        const response = await productService.getProducts(filters);
        res.status(200).json({
            success: true,
            message: 'ดึงข้อมูลสินค้าสำเร็จ',
            data: response
        })
    } catch (error: unknown) {
        next(error);
    }
}