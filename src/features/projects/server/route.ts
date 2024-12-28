import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { ID, Query } from 'node-appwrite';

import { getMember } from '@/features/members/utils';

import { sessionMiddleware } from '@/lib/session-middleware';

import { DATABASE_ID, PROJECT_ID, IMAGES_BUCKET_ID } from '@/config';
import { createProjectSchema } from '../schemas';

const app = new Hono()
  .post(
    '/',
    sessionMiddleware,
    zValidator('form', createProjectSchema),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const storage = c.get('storage');

      const { name, workspaceId, image } = c.req.valid('form');
      console.log(name, workspaceId, image, 'name, workspaceId, image');

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString('base64')}`;
      } else uploadedImageUrl = image;

      const member = await getMember({
        userId: user.$id,
        workspaceId,
        databases,
      });

      if (!member) {
        return c.json({ error: 'UnAuthorized' }, 401);
      }

      const project = await databases.createDocument(
        DATABASE_ID,
        PROJECT_ID,
        ID.unique(),
        {
          name,
          workspaceId,
          imageUrl: uploadedImageUrl,
          userId: user.$id,
        }
      );

      return c.json({
        data: project,
      });
    }
  )
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');

      const { workspaceId } = c.req.valid('query');

      if (!workspaceId) {
        return c.json({ error: 'Missing workspace Id' }, 400);
      }

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member) {
        return c.json({ error: 'UnAuthorized' }, 401);
      }

      const projects = await databases.listDocuments(DATABASE_ID, PROJECT_ID, [
        Query.orderDesc('$createdAt'),
        Query.equal('workspaceId', workspaceId),
      ]);

      return c.json({
        data: projects,
      });
    }
  );

export default app;
