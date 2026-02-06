import * as addressRepository from '../../repositories/user/address.repository';
import { createHttpError } from '../../exceptions/http.exception';
import { logActivity } from '../../utils/logger.util';

export const getAddresses = async (userId: number) => {
    const address = await addressRepository.findAddresses(userId);
    return address;
}

export const getAddressById = async (addressId: number, userId: number) => {
    const address = await addressRepository.findAddressById(addressId, userId);
    if (!address) {
        throw createHttpError(404, 'ไม่พบที่อยู่ที่ต้องการ');
    }
    return address;
}

export const createAddress = async (userId: number, values: any, userContext: any) => {
    try {
        const address = await addressRepository.insertAddress(userId, values);
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'USER_CREATE_ADDRESS',
            resourceId: address.id,
            resourceType: 'addresses',
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'สร้างที่อยู่ใหม่สำเร็จ',
                data: { ...values }
            }
        });
        return address;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'USER_CREATE_ADDRESS_FAILED',
            resourceId: null,
            resourceType: 'addresses',
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
                data: { ...values }
            }
        });
        throw error;
    }
}

export const updateAddress = async (addressId: number, userId: number, values: any, userContext: any) => {
    try {
        const existingAddress = await addressRepository.findAddressById(addressId, userId);
        if (!existingAddress) {
            throw createHttpError(404, 'ไม่พบที่อยู่ที่ต้องการ');
        }
        const updatedAddress = await addressRepository.updateAddress(addressId, userId, values);
        const changes: Record<string, any> = {};
        const fieldToCheck = [
            'street',
            'sub_district',
            'district',
            'province',
            'zip_code',
            'first_name',
            'last_name',
            'phone'
        ];
        fieldToCheck.forEach((field: any) => {
            const oldValue = (existingAddress as any)[field];
            const newValue = (updatedAddress as any)[field];
            if (oldValue !== newValue) {
                changes[field] = { from: oldValue, to: newValue };
            }
        });
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'USER_UPDATE_ADDRESS',
            resourceId: addressId,
            resourceType: 'addresses',
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'อัพเดตที่อยู่สำเร็จ',
                diff: changes
            }
        });
        return updatedAddress;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'USER_UPDATE_ADDRESS_FAILED',
            resourceId: addressId,
            resourceType: 'addresses',
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
                data: { ...values }
            }
        });
        throw error;
    }
}

export const deleteAddress = async (addressId: number, userId: number, userContext: any) => {
    try {
        const existingAddress = await addressRepository.findAddressById(addressId, userId);
        if (!existingAddress) {
            throw createHttpError(404, 'ไม่พบที่อยู่ที่ต้องการ');
        }
        await addressRepository.deleteAddress(addressId, userId);
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'USER_DELETE_ADDRESS',
            resourceId: addressId,
            resourceType: 'addresses',
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: true,
            details: {
                message: 'ลบที่อยู่สำเร็จ',
                data: { ...existingAddress }
            }
        });
        return;
    } catch (error: unknown) {
        logActivity({
            actorId: userContext.actorId,
            actorName: userContext.actorName,
            role: userContext.role,
            action: 'USER_DELETE_ADDRESS_FAILED',
            resourceId: addressId,
            resourceType: 'addresses',
            ip: userContext.ip,
            userAgent: userContext.userAgent,
            isSuccess: false,
            details: {
                error: (error as Error).message,
                status: (error as any).status || 500,
            }
        });
        throw error;
    }
}
