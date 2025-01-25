import { z } from 'zod';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { createAdminClient } from '@/lib/appwrite';
import { sessionMiddleware } from '@/lib/session-middleware';

import { createTaskSchema } from '../schemas';
import { getMember } from '@/features/members/utils';

import { DATABASE_ID, MEMBERS_ID, PROJECT_ID, TASK_ID } from '@/config';
import { Task, TaskStatus } from '../types';
import { Project } from '@/features/projects/types';

const app = new Hono()
  .delete('/:taskId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASK_ID,
      taskId
    );

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId: task.workspaceId,
    });

    if (!member) {
      return c.json({ error: 'UnAuthorized' }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, TASK_ID, taskId);

    return c.json({
      data: {
        $id: taskId,
      },
    });
  })
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish().optional(),
        assigneeId: z.string().nullish().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        search: z.string().nullish().optional(),
        dueDate: z.string().nullish().optional(),
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

      const query = [Query.equal('workspaceId', workspaceId)];

      if (status) {
        query.push(Query.equal('status', status));
      }

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

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASK_ID,
        query
      );

      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      const projects = await databases.listDocuments(
        DATABASE_ID,
        PROJECT_ID,
        projectIds?.length > 0 ? [Query.contains('$id', projectIds)] : []
      );

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains('$id', assigneeIds)] : []
      );

      const assignes = await Promise.all(
        members.documents?.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user.name || user.email,
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
        data: {
          ...tasks,
          documents: populatedTasks,
        },
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
  )
  .patch(
    '/:taskId',
    sessionMiddleware,
    zValidator('json', createTaskSchema.partial()),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');

      const { taskId } = c.req.param();

      const { assigneeId, dueDate, name, projectId, status, description } =
        c.req.valid('json');

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASK_ID,
        taskId
      );

      if (!existingTask) {
        return c.json({ error: 'Task not found' }, 404);
      }

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: existingTask.workspaceId,
      });

      if (!member) {
        return c.json({ error: 'UnAuthorized' }, 401);
      }

      const task = await databases.updateDocument(
        DATABASE_ID,
        TASK_ID,
        taskId,
        {
          assigneeId,
          dueDate,
          name,
          projectId,
          status,
          description: description || '',
        }
      );

      return c.json({
        data: task,
      });
    }
  )
  .get('/:taskId', sessionMiddleware, async (c) => {
    const currentUser = c.get('user');
    const databases = c.get('databases');
    const { taskId } = c.req.param();
    const { users } = await createAdminClient();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASK_ID,
      taskId
    );

    if (!task) {
      return c.json({ error: 'No task found' }, 401);
    }

    const currentMember = await getMember({
      databases,
      userId: currentUser.$id,
      workspaceId: task.workspaceId,
    });

    if (!currentMember) {
      return c.json(
        {
          error: 'Unauthorized',
        },
        404
      );
    }

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECT_ID,
      task.projectId
    );

    const member = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      task.assigneeId
    );

    const user = await users.get(member.userId);

    const assignee = {
      ...member,
      name: user.name || user.email,
      email: user.email,
    };

    return c.json({
      data: {
        ...task,
        project,
        assignee,
      },
    });
  })
  .post(
    '/bulk-update',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(0).max(1_000_000),
          })
        ),
      })
    ),
    async (c) => {
      const databases = c.get('databases');
      const { tasks } = c.req.valid('json');
      const user = c.get('user');

      const tasksToUpdate = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASK_ID,
        [
          Query.contains(
            '$id',
            tasks.map((task) => task.$id)
          ),
        ]
      );

      const workspaceIds = tasksToUpdate.documents.map(
        (task) => task.workspaceId
      );

      if (workspaceIds.length !== 1) {
        return c.json(
          { error: 'All tasks must be belog to the same workspace' },
          400
        );
      }

      const workspaceId = workspaceIds.values().next().value;
      if (!workspaceId) {
        return c.json({ error: 'Workspace not found' }, 404);
      }

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member) {
        return c.json({ error: 'UnAuthorized' }, 401);
      }

      const updates = tasks.map((task) => {
        const taskToUpdate = tasksToUpdate.documents.find(
          (t) => t.$id === task.$id
        );

        if (!taskToUpdate) {
          return null;
        }

        return databases.updateDocument(
          DATABASE_ID,
          TASK_ID,
          taskToUpdate.$id,
          {
            status: task.status,
            position: task.position,
          }
        );
      });

      await Promise.all(updates);
      return c.json({ data: 'Tasks updated' });
    }
  );

export default app;
