import cloudinary from '../config/cloudinary';

export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
    try {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

const getPublicIdFromUrl = (url: string): string | null => {
    try {
        const urlParts = url.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex === -1) return null;
        
        const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = pathAfterUpload.split('.')[0];
        return publicId;
    } catch (error) {
        return null;
    }
};