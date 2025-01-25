'use client';

import { JoinWorkspaceform } from '@/features/workspaces/components/join-workspace-form';
import { PageLoader } from '@/components/page-loader';
import { PageError } from '@/components/page-error';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetWorkspaceInfo } from '@/features/workspaces/api/use-get-workspace-info';

export const WorkspaceJoinPageClient = () => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetWorkspaceInfo(workspaceId);

  if (isLoading) return <PageLoader />;

  if (!data) return <PageError />;

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceform initialValues={data} />
    </div>
  );
};
