import { Injectable, BadRequestException } from '@nestjs/common';
import {cloudinary} from './cloudinary.config.js';

@Injectable()
export class CloudinaryService {
  // সিঙ্গেল ফাইল ডিলিট করার মেথড
  async deleteFile(key: string, resourceType: 'image' | 'video' = 'image') {
    if (!key) return;

    const result = await cloudinary.uploader.destroy(key, {
      resource_type: resourceType,
    });

    if (result.result !== 'ok') {
      throw new BadRequestException('Cloudinary file deletion failed');
    }

    return true;
  }

  // একাধিক ফাইল একসাথে ডিলিট করার মেথড
  async deleteMultipleFiles(keys: string[], resourceType: 'image' | 'video' = 'image') {
    if (!keys || keys.length === 0) return;

    const results = await Promise.allSettled(
      keys.map((key) =>
        cloudinary.uploader.destroy(key, { resource_type: resourceType }),
      ),
    );

    const hasFailed = results.some((r) => r.status === 'rejected');
    if (hasFailed) {
      throw new BadRequestException('Some files failed to delete from Cloudinary');
    }

    return true;
  }
}