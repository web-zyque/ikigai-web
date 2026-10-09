import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(err => 
          err.path.length > 0 
            ? `${err.path.join('.')}: ${err.message}`
            : err.message
        );
        throw new BadRequestException(messages);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}