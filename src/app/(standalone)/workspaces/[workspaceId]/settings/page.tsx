import { redirect } from 'next/navigation';

import { getCurrent } from '@/features/auth/queries';

import SettingClient from './client';

const WorkspaceIdSettingPage = async () => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');

  return <SettingClient />;
};

export default WorkspaceIdSettingPage;
