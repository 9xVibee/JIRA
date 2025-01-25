import { redirect } from 'next/navigation';

import { getCurrent } from '@/features/auth/queries';

import SettingClient from './client';

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

  return <SettingClient />;
};

export default WorkspaceIdSettingPage;
