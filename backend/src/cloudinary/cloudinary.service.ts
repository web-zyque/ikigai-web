import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { v2 as CloudinaryClient } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';


@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinary: typeof CloudinaryClient,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string; publicId: string }> {
    if (!file?.buffer || file.size === 0) {
      throw new BadRequestException('A valid image file is required');
    }

    try {
      const result = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const uploadStream = this.cloudinary.uploader.upload_stream(
            {
              folder: 'ikigai/products',
              resource_type: 'image',
            },
            (error, response) => {
              if (error) {
                reject(error);
                return;
              }

              if (!response) {
                reject(new Error('Missing Cloudinary response'));
                return;
              }

              resolve(response);
            },
          );

          uploadStream.end(file.buffer);
        },
      );

      return {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      this.logger.error('Cloudinary image upload failed');

      throw new InternalServerErrorException(
        'Failed to upload image',
      );
    }
  }
}