'use client';

import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';

import { redirect } from 'next/navigation';

import { PageLoader } from '@/components/page-loader';

const Workspace = () => {
  const { data, isLoading } = useGetWorkspaces();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!data || data?.total === 0) {
    redirect('/workspaces/create');
  } else if (data?.documents?.length > 0) {
    redirect(`/workspaces/${data?.documents[0].$id}`);
  }

  return null;
};
export default Workspace;
