import { redirect } from 'next/navigation';

import { getCurrent } from '@/features/auth/queries';
import { getWorkspace } from '@/features/workspaces/queries';

import { EditWorkspaceForm } from '@/features/workspaces/components/edit-workspace-form';

interface WorkspaceIdSettingPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdSettingPage = async ({
  params,
}: WorkspaceIdSettingPageProps) => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');

  const { workspaceId } = await params;

  const initialValues = await getWorkspace({ workspaceId });

  if (!initialValues) {
    throw new Error('Workspace not found');
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
    </div>
  );
};

export default WorkspaceIdSettingPage;
