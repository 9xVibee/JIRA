import { Hono } from 'hono';

import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminClient } from '@/lib/appwrite';
import { getMember } from '../utils';
import { DATABASE_ID, MEMBERS_ID } from '@/config';
import { Query } from 'node-appwrite';
import { MemberRole } from '../types';

const app = new Hono()
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
      const { users } = await createAdminClient();
      const databases = c.get('databases');
      const user = c.get('user');
      const { workspaceId } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'UnAuthorized' }, 404);
      }

      const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
        Query.equal('workspaceId', workspaceId),
      ]);

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            email: user.email,
            name: user.name,
          };
        })
      );

      return c.json({
        data: {
          documents: [...populatedMembers],
          total: populatedMembers.length,
        },
      });
    }
  )
  .delete('/:memberId', sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get('user');
    const databases = c.get('databases');

    const memberToDelete = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      memberId
    );

    if (!memberToDelete) {
      return c.json({ error: 'Member not found' }, 404);
    }

    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal('workspaceId', memberToDelete.workspaceId)]
    );

    const member = await getMember({
      userId: user.$id,
      databases,
      workspaceId: memberToDelete.workspaceId,
    });

    if (!member) {
      return c.json({
        error: 'UnAuthorized',
      });
    }

    if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: 'UnAuthorized' }, 403);
    }

    if (allMembersInWorkspace.documents.length === 1) {
      return c.json(
        { error: 'Cannot delete the last member in the workspace' },
        400
      );
    }

    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    return c.json({
      data: {
        $id: memberToDelete.$id,
      },
    });
  })
  .patch(
    '/:memberId',
    sessionMiddleware,
    zValidator('json', z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid('json');
      const user = c.get('user');
      const databases = c.get('databases');

      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );

      if (!memberToUpdate) {
        return c.json({ error: 'Member not found' }, 404);
      }

      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal('workspaceId', memberToUpdate.workspaceId)]
      );

      const member = await getMember({
        userId: user.$id,
        databases,
        workspaceId: memberToUpdate.workspaceId,
      });

      if (!member) {
        return c.json({
          error: 'UnAuthorized',
        });
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: 'UnAuthorized' }, 403);
      }

      if (allMembersInWorkspace.documents.length === 1) {
        return c.json({ error: 'Cannot downgrade the only member' }, 400);
      }

      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        role,
      });

      return c.json({
        data: {
          $id: memberToUpdate.$id,
        },
      });
    }
  );

export default app;
