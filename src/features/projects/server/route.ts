import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { ID, Query } from 'node-appwrite';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';

import { getMember } from '@/features/members/utils';
import { createProjectSchema, updateProjectSchema } from '../schemas';

import { sessionMiddleware } from '@/lib/session-middleware';

import { DATABASE_ID, PROJECT_ID, IMAGES_BUCKET_ID, TASK_ID } from '@/config';
import { Project } from '../types';
import { TaskStatus } from '@/features/tasks/types';

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

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECT_ID,
        [Query.orderDesc('$createdAt'), Query.equal('workspaceId', workspaceId)]
      );

      return c.json({
        data: projects,
      });
    }
  )
  .get('/:projectId', sessionMiddleware, async (c) => {
    const { projectId } = c.req.param();
    const user = c.get('user');
    const databases = c.get('databases');

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECT_ID,
      projectId
    );

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId: project.workspaceId,
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
      data: project,
    });
  })
  .patch(
    '/:projectId',
    sessionMiddleware,
    zValidator('form', updateProjectSchema),
    async (c) => {
      const databases = c.get('databases');
      const storage = c.get('storage');
      const user = c.get('user');

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid('form');

      const existingProject = await databases.getDocument(
        DATABASE_ID,
        PROJECT_ID,
        projectId
      );

      if (!existingProject) {
        return c.json({ error: 'Project not found' }, 404);
      }

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: existingProject.workspaceId,
      });

      if (!member) {
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
        PROJECT_ID,
        projectId,
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
  .delete('/:projectId', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { projectId } = c.req.param();

    const existingProject = await databases.getDocument(
      DATABASE_ID,
      PROJECT_ID,
      projectId
    );

    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const member = await getMember({
      workspaceId: existingProject.workspaceId,
      databases,
      userId: user.$id,
    });

    if (!member) {
      return c.json(
        {
          error: 'Unauthorized',
        },
        401
      );
    }

    /* TODO: delete tasks */
    await databases.deleteDocument(DATABASE_ID, PROJECT_ID, projectId);

    return c.json({
      data: {
        $id: projectId,
      },
    });
  })
  .get('/:projectId/analytics', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECT_ID,
      projectId
    );

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId: project.workspaceId,
    });

    if (!member) {
      return c.json(
        {
          error: 'Unauthorized',
        },
        401
      );
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments(DATABASE_ID, TASK_ID, [
      Query.equal('projectId', projectId),
      Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
      Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
    ]);

    const lastMonthTask = await databases.listDocuments(DATABASE_ID, TASK_ID, [
      Query.equal('projectId', projectId),
      Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
      Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
    ]);

    const taskCount = thisMonthTasks.total;
    const taskDifference = taskCount - lastMonthTask.total;

    const thisMonthTasksAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal('projectId', projectId),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
        Query.equal('assigneeId', member.$id),
      ]
    );

    const lastMonthTasksAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal('projectId', projectId),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
        Query.equal('assigneeId', member.$id),
      ]
    );

    const assignedTaskCount = thisMonthTasksAssignedTasks.total;
    const assignedTaskDifference =
      assignedTaskCount - lastMonthTasksAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal('projectId', projectId),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
        Query.notEqual('status', TaskStatus.DONE),
      ]
    );

    const lastMonthIncompleteTask = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal('projectId', projectId),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
        Query.notEqual('status', TaskStatus.DONE),
      ]
    );

    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDifference =
      incompleteTaskCount - lastMonthIncompleteTask.total;

    const thisMonthCompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal('projectId', projectId),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
        Query.equal('status', TaskStatus.DONE),
      ]
    );

    const lastMonthCompleteTask = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal('projectId', projectId),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
        Query.equal('status', TaskStatus.DONE),
      ]
    );

    const completeTaskCount = thisMonthCompleteTasks.total;
    const completeTaskDifference =
      completeTaskCount - lastMonthCompleteTask.total;

    const thisMonthOverdueTask = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal('projectId', projectId),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
        Query.notEqual('status', TaskStatus.DONE),
        Query.lessThan('dueDate', now.toISOString()),
      ]
    );

    const lastMonthOverdueTask = await databases.listDocuments(
      DATABASE_ID,
      TASK_ID,
      [
        Query.equal('projectId', projectId),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
        Query.notEqual('status', TaskStatus.DONE),
        Query.lessThan('dueDate', now.toISOString()),
      ]
    );

    const overDueTaskCount = thisMonthOverdueTask.total;
    const overdueTaskCountDifference =
      overDueTaskCount - lastMonthOverdueTask.total;

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        completeTaskCount,
        completeTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        overDueTaskCount,
        overdueTaskCountDifference,
      },
    });
  });

export default app;
