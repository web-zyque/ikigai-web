import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UploadController } from './upload.controller';

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [UploadController],
})
export class UploadModule {}
