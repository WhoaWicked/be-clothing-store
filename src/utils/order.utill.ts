import { createHttpError } from '../exceptions/http.exception';
import * as orderRepository from '../repositories/staff/order.repository';

export const generateTrackingNumber = async () => {
    let tracking_number: string;
    let isUnique: boolean = false;
    let attempt: number = 0;
    while (!isUnique && attempt < 10) {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        tracking_number = `DEV-${generatedCode}`;
        const existingCode = await orderRepository.findOrderByTrackingNumber(tracking_number);
        if (!existingCode) {
            isUnique = true;
        }
        attempt++;
    }
    if (!isUnique) {
        throw createHttpError(500, 'ไม่สามารถสร้างหมายเลขพัสดุที่ไม่ซ้ำกันได้ กรุณาลองใหม่อีกครั้ง');
    }
    return tracking_number!;
}