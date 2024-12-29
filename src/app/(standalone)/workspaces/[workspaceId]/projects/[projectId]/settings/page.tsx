import { getCurrent } from '@/features/auth/queries';
import { EditProjectForm } from '@/features/projects/components/edit-project-form';
import { getProject } from '@/features/projects/queries';

import { redirect } from 'next/navigation';

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

  const { projectId } = await params;

  const initialValues = await getProject({ projectId });

  if (!initialValues) {
    throw new Error('Project not found');
  }

  return (
    <div className="w-full lg:max-w-lg">
      <EditProjectForm initialValues={initialValues} />
    </div>
  );
};

export default ProjectIdSettingPage;
