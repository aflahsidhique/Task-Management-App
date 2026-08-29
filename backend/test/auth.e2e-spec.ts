/* eslint-disable prettier/prettier */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/test-app';

// Seeded by SeedService against the freshly-migrated test database.
const DEMO_EMAIL = 'aflahgraphy@gmail.com';
const DEMO_PASSWORD = 'Demo@12345';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: DEMO_EMAIL, password: 'wrong-password' })
      .expect(401);
  });

  it('logs in and returns a token pair plus the sanitized user (no password hash)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      .expect(201);

    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.refreshToken).toEqual(expect.any(String));
    expect(res.body.data.user.email).toBe(DEMO_EMAIL);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('exposes the current user on /auth/me for a valid access token', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD });

    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .expect(200);

    expect(res.body.data.email).toBe(DEMO_EMAIL);
  });

  it('rotates the token pair on refresh, and the rotated-away token can no longer be reused', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    const { refreshToken } = login.body.data;

    const refreshed = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(201);
    expect(refreshed.body.data.accessToken).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('logs out and revokes the refresh token', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    const { accessToken, refreshToken } = login.body.data;

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('always returns the same generic message for forgot-password, known or unknown email', async () => {
    const known = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: DEMO_EMAIL })
      .expect(201);
    const unknown = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nobody@example.com' })
      .expect(201);

    expect(known.body.data.message).toBe(unknown.body.data.message);
  });
});
