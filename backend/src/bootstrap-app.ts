/* eslint-disable prettier/prettier */
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import helmet from 'helmet';

/**
 * Applies the same request pipeline (Helmet, CORS, /api/v1 prefix +
 * versioning, global validation) to a Nest application instance —
 * shared by main.ts and the e2e test bootstrapper so tests exercise the
 * exact same HTTP surface as the real app.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  return app;
}
