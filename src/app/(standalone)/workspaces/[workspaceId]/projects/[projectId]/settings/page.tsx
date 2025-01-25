import { getCurrent } from '@/features/auth/queries';

import { redirect } from 'next/navigation';
import { ClientProjectIdSettingPage } from './client';

const ProjectIdSettingPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect('/sign-in');
  }

  return <ClientProjectIdSettingPage />;
};

export default ProjectIdSettingPage;
