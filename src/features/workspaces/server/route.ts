import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';

import { sessionMiddleware } from '@/lib/session-middleware';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';

import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  MEMBERS_ID,
  WORKSPACES_ID,
} from '@/config';

import { MemberRole } from '@/features/members/types';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { z } from 'zod';

import { Workspace } from '../types';

const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');

    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal('userId', user.$id),
    ]);

    const workspacesId = members.documents.map((member) => member.workspaceId);

    if (members.total === 0) {
      return c.json({
        data: { documents: [], total: 0 },
      });
    }

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.orderDesc('$createdAt'), Query.contains('$id', workspacesId)]
    );

    return c.json({
      data: workspaces,
    });
  })
  .get('/:workspaceId', sessionMiddleware, async (c) => {
    const { workspaceId } = c.req.param();
    const user = c.get('user');
    const databases = c.get('databases');

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    if (!workspaceId) {
      return c.json(
        {
          error: 'workspace not found',
        },
        404
      );
    }

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });

    if (!member) {
      return c.json(
        {
          error: 'Unauthorized',
        },
        404
      );
    }

    return c.json({
      data: workspace,
    });
  })
  .get('/:workspaceId/info', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    if (!workspace) {
      return c.json(
        {
          error: 'Workspace not found',
        },
        404
      );
    }

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });

    if (!member) {
      return c.json(
        {
          error: 'Unauthorized',
        },
        401
      );
    }

    return c.json({
      data: {
        $id: workspace.$id,
        name: workspace.name,
        imageUrl: workspace.imageUrl,
      },
    });
  })
  .post(
    '/',
    zValidator('form', createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const storage = c.get('storage');
      const user = c.get('user');

      const { name, image } = c.req.valid('form');

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
      }

      const workspaces = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          inviteCode: generateInviteCode(10),
        }
      );

      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        userId: user.$id,
        workspaceId: workspaces.$id,
        role: MemberRole.ADMIN,
      });

      return c.json({
        data: workspaces,
      });
    }
  )
  .patch(
    '/:workspaceId',
    sessionMiddleware,
    zValidator('form', updateWorkspaceSchema),
    async (c) => {
      const databases = c.get('databases');
      const storage = c.get('storage');
      const user = c.get('user');

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid('form');

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json(
          {
            error: 'Unauthorized',
          },
          401
        );
      }

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

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );

      return c.json({
        data: workspace,
      });
    }
  )
  .delete('/:workspaceId', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    const member = await getMember({
      workspaceId,
      databases,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json(
        {
          error: 'Unauthorized',
        },
        401
      );
    }

    /* TODO: Delete members, projects and tasks */

    await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);

    return c.json({
      data: {
        $id: workspaceId,
      },
    });
  })
  .post('/:workspaceId/reset-invite-code', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    const member = await getMember({
      workspaceId,
      databases,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json(
        {
          error: 'Unauthorized',
        },
        401
      );
    }

    const workspace = await databases.updateDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
      {
        inviteCode: generateInviteCode(10),
      }
    );

    return c.json({
      data: workspace,
    });
  })
  .post(
    '/:workspaceId/join',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        code: z.string(),
      })
    ),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid('json');

      const databases = c.get('databases');
      const user = c.get('user');

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      /* checking wheather the user is already a memeber of the workspace or not */
      if (member) {
        return c.json(
          {
            error: 'Already a member',
          },
          400
        );
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
      );

      if (!workspace) {
        return c.json(
          {
            error: 'Workspace not found',
          },
          400
        );
      }

      if (workspace.inviteCode !== code) {
        return c.json(
          {
            error: 'Invalid Invite code',
          },
          400
        );
      }

      await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
        userId: user.$id,
        workspaceId,
        role: MemberRole.MEMBER,
      });

      return c.json({
        data: workspace,
      });
    }
  );

export default app;
