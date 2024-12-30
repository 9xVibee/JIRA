import { z } from 'zod';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { createAdminClient } from '@/lib/appwrite';
import { sessionMiddleware } from '@/lib/session-middleware';

import { createTaskSchema } from '../schemas';
import { getMember } from '@/features/members/utils';

import { DATABASE_ID, PROJECT_ID, TASK_ID } from '@/config';
import { TaskStatus } from '../types';

const app = new Hono()
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get('databases');
      const user = c.get('user');

      const { status, workspaceId, assigneeId, dueDate, projectId, search } =
        c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'UnAuthorized' }, 404);
      }

      const query = [
        Query.equal('workspaceId', workspaceId),
        Query.equal('status', status),
      ];

      if (projectId) {
        query.push(Query.equal('projectId', projectId));
      }

      if (assigneeId) {
        query.push(Query.equal('assigneeId', assigneeId));
      }

      if (dueDate) {
        query.push(Query.equal('dueDate', dueDate));
      }

      if (search) {
        query.push(Query.search('name', search));
      }

      const tasks = await databases.listDocuments(DATABASE_ID, TASK_ID, query);

      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      const projects = await databases.listDocuments(
        DATABASE_ID,
        PROJECT_ID,
        projectIds?.length > 0 ? [Query.contains('$id', projectIds)] : []
      );

      const members = await databases.listDocuments(
        DATABASE_ID,
        TASK_ID,
        assigneeIds.length > 0 ? [Query.contains('$id', assigneeIds)] : []
      );

      const assignes = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user.name,
            email: user.email,
          };
        })
      );

      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );

        const assignee = assignes.find(
          (assignee) => assignee.$id === task.assigneeId
        );

        return {
          ...task,
          project,
          assignee,
        };
      });

      return c.json({
        data: populatedTasks,
      });
    }
  )
  .post(
    '/',
    sessionMiddleware,
    zValidator('json', createTaskSchema),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');

      const {
        assigneeId,
        dueDate,
        name,
        projectId,
        status,
        workspaceId,
        description,
      } = c.req.valid('json');

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member) {
        return c.json({ error: 'You are not a member of this workspace' }, 401);
      }

      const highestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        TASK_ID,
        [
          Query.equal('status', status),
          Query.equal('workspaceId', workspaceId),
          Query.orderAsc('position'),
          Query.limit(1),
        ]
      );

      const newPosition =
        highestPositionTask.documents.length > 0
          ? highestPositionTask.documents[0].position + 1000
          : 1000;

      const task = await databases.createDocument(
        DATABASE_ID,
        TASK_ID,
        ID.unique(),
        {
          assigneeId,
          dueDate,
          name,
          projectId,
          status,
          workspaceId,
          position: newPosition,
          description: description || '',
        }
      );

      return c.json({
        data: task,
      });
    }
  );

export default app;
