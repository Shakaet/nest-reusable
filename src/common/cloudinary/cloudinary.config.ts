import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cloudinary ইনিশিয়ালাইজেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dglcaf1e7',
  api_key: process.env.CLOUDINARY_API_KEY || '993983958445659',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'PHh4KeMTqT7mvVNqo8tFx4SJuz4',
});

// Multer Storage ইঞ্জিন
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'erp_backend_image', // ফোল্ডারের নাম
      resource_type: isVideo ? 'video' : 'image',
      format: isVideo ? 'mp4' : 'webp',
      transformation: isVideo
        ? [{ width: 1280, crop: 'scale' }, { quality: 'auto' }]
        : [
            { width: 1920, crop: 'limit' },
            { quality: '70', fetch_format: 'webp' },
          ],
    };
  },
});

export { cloudinary };