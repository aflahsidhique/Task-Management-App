/* eslint-disable prettier/prettier */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/test-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns a wrapped success envelope', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({ success: true, statusCode: 200, data: 'Hello World!' }),
        );
      });
  });

  it('an unknown route returns a wrapped 404 error envelope', () => {
    return request(app.getHttpServer())
      .get('/api/v1/does-not-exist')
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual(expect.objectContaining({ success: false, statusCode: 404 }));
      });
  });

  it('a protected route without a token is rejected with 401', () => {
    return request(app.getHttpServer()).get('/api/v1/users').expect(401);
  });
});
