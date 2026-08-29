/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  // Swagger configuration (kept outside the /api prefix + versioning scheme).
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API documentation for the Task Management application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(5000);
}
bootstrap();
