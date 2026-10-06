import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(
    process.env.PORT ?? 3001,
    process.env.HOST ?? '0.0.0.0',
    () => {
      console.log(
        `Listening on ${process.env.HOST ?? '0.0.0.0'}:${process.env.PORT ?? 3001}`,
      );
    },
  );
}
bootstrap();
