'use client';

import { PageError } from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { EditProjectForm } from '@/features/projects/components/edit-project-form';

import { useGetProject } from '@/features/projects/api/use-get-project';
import { useProjectId } from '@/features/projects/hooks/use-project-id';

export const ClientProjectIdSettingPage = () => {
  const projectId = useProjectId();
  const { data, isLoading } = useGetProject({ projectId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!data) {
    return <PageError />;
  }

  return (
    <div className="w-full lg:max-w-lg">
      <EditProjectForm initialValues={data} />
    </div>
  );
};
