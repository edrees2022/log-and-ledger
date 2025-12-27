import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';
import type { Express } from 'express';

import { registerRoutes } from '../routes';

let server: any;

function makeApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
  return app;
}

beforeAll(async () => {
  const app = makeApp();
  server = await registerRoutes(app);
});

describe('Health route', () => {
  it('GET /api/health returns ok with env info', async () => {
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('db');
    expect(res.body).toHaveProperty('env');
  });
});
