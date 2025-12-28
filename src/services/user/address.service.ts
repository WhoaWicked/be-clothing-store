import * as addressRepository from '../../repositories/user/address.repository';
import { createHttpError } from '../../exceptions/http.exception';

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

export const createAddress = async (userId: number, values: any) => {
    const address = await addressRepository.insertAddress(userId, values);
    return address;
}

export const updateAddress = async (addressId: number, userId: number, values: any) => {
    const existingAddress = await addressRepository.findAddressById(addressId, userId);
    if (!existingAddress) {
        throw createHttpError(404, 'ไม่พบที่อยู่ที่ต้องการ');
    }
    const updatedAddress = await addressRepository.updateAddress(addressId, userId, values);
    return updatedAddress;
}

export const deleteAddress = async (addressId: number, userId: number) => {
    const existingAddress = await addressRepository.findAddressById(addressId, userId);
    if (!existingAddress) {
        throw createHttpError(404, 'ไม่พบที่อยู่ที่ต้องการ');
    }
    await addressRepository.deleteAddress(addressId, userId);
    return;
}
