import { getCurrent } from '@/features/auth/queries';

import { redirect } from 'next/navigation';
import { ClientProjectIdSettingPage } from './client';

interface ProjectIdSettingPageProps {
  params: {
    projectId: string;
  };
}

const ProjectIdSettingPage = async ({ params }: ProjectIdSettingPageProps) => {
  const user = await getCurrent();
  if (!user) {
    redirect('/sign-in');
  }

  return <ClientProjectIdSettingPage />;
};

export default ProjectIdSettingPage;
