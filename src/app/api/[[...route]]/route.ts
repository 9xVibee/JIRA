import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import workspaces from '@/features/workspaces/server/route';
import auth from '@/features/auth/server/route';
import member from '@/features/members/server/route';
import projects from '@/features/projects/server/route';

const app = new Hono().basePath('/api');
const routes = app
  .route('/auth', auth)
  .route('/workspaces', workspaces)
  .route('/members', member)
  .route('/projects', projects); 

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;
