/* eslint-disable @typescript-eslint/no-unused-vars */
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import workspaces from '@/features/workspaces/server/route';
import auth from '@/features/auth/server/route';
import member from '@/features/members/server/route';
import projects from '@/features/projects/server/route';
import tasks from '@/features/tasks/server/route';

import { cors } from 'hono/cors';

const app = new Hono().basePath('/api');

// Get the allowed origin from environment variables
const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL! || 'http://localhost:3000';

// Enable CORS for specific domains (e.g., your Next.js app)
app.use(
  '*',
  cors({
    origin: [allowedOrigin], // Allow your Next.js frontend
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);

const routes = app
  .route('/auth', auth)
  .route('/workspaces', workspaces)
  .route('/members', member)
  .route('/projects', projects)
  .route('/tasks', tasks);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;