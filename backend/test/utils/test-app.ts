/* eslint-disable prettier/prettier */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/bootstrap-app';

/** Boots a real Nest app (real Postgres, real modules) with the same
 * request pipeline as production, for e2e tests to exercise over HTTP. */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}
