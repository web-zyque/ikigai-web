import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  await app.listen(
    process.env.PORT ?? 3001,
    process.env.HOST ?? '0.0.0.0',
    () => {
      console.log(
        `Listening on ${process.env.HOST ?? '0.0.0.0'}:${process.env.PORT ?? 3001}`
      );
    },
  )
}
bootstrap();
