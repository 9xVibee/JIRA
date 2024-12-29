import { redirect } from 'next/navigation';

import { getCurrent } from '@/features/auth/queries';
import { JoinWorkspaceform } from '@/features/workspaces/components/join-workspace-form';

import { getWorkspaceInfo } from '@/features/workspaces/queries';

interface WorkspaceJoinPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceJoinPage = async ({ params }: WorkspaceJoinPageProps) => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');

  const { workspaceId } = params;

  const workspace = await getWorkspaceInfo({ workspaceId });

  if (!workspace?.name) {
    throw new Error('Workspace not found');
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceform initialValues={workspace} />
    </div>
  );
};

export default WorkspaceJoinPage;
