'use client';

import { PageError } from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { EditWorkspaceForm } from '@/features/workspaces/components/edit-workspace-form';

import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

const SettingClient = () => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetWorkspace(workspaceId);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!data) {
    return <PageError />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={data} />
    </div>
  );
};
export default SettingClient;
