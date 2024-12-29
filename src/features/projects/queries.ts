import { createSessionClient } from '@/lib/appwrite';

import { DATABASE_ID, PROJECT_ID } from '@/config';

import { Project } from './types';
import { getMember } from '../members/utils';

interface GeetProjectProps {
  projectId: string;
}

export const getProject = async ({ projectId }: GeetProjectProps) => {
  try {
    const { account, databases } = await createSessionClient();
    const user = await account.get();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECT_ID,
      projectId
    );

    const members = await getMember({
      userId: user.$id,
      workspaceId: project.workspaceId,
      databases,
    });

    if (!members) {
      return null;
    }

    return project;
  } catch {
    return null;
  }
};
