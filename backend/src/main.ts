import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.use(cookieParser());

  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''));

  if (isProd && !process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL must be set in production');
  }

  app.enableCors({
    origin: (origin, cb) => {
      // no origin = curl/server-to-server
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(
  process.env.PORT ?? 3001,
  process.env.HOST ?? '0.0.0.0',
  () => {
    console.log(
      `Listening on ${process.env.HOST ?? '0.0.0.0'}:${process.env.PORT ?? 3001}`
    );
  },
);
}
bootstrap();