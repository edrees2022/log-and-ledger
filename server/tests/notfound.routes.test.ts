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
  // Seed a fake session for any middleware that expects it
  app.use((req, _res, next) => {
    (req as any).session = { userId: 'u1', companyId: 'c1' } as any;
    next();
  });
  return app;
}

beforeAll(async () => {
  const app = makeApp();
  server = await registerRoutes(app);
});

describe('Catch-all 404', () => {
  it('returns JSON { error: "Not found" } for unknown paths', async () => {
    const res = await request(server).get('/this/route/does/not/exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
