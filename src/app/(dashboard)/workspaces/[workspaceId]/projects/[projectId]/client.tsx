'use client';

import Link from 'next/link';
import { PencilIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useGetProject } from '@/features/projects/api/use-get-project';
import { useGetProjectAnalytics } from '@/features/projects/api/use-get-project-analytics';
import { useProjectId } from '@/features/projects/hooks/use-project-id';

import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import TaskViewSwitcher from '@/features/tasks/components/task-view-switcher';
import { PageLoader } from '@/components/page-loader';
import { PageError } from '@/components/page-error';
import { Analytics } from '@/components/analytics';

export const ProjectIdClient = () => {
  const projectId = useProjectId();

  const { data: projectData, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });
  const { data: analyticsData, isLoading: isLoadingAnalytics } =
    useGetProjectAnalytics({ projectId });

  const isLoading = isLoadingProject || isLoadingAnalytics;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!projectData || !analyticsData) {
    return <PageError message="Project not found" />;
  }

  return (
    <div className={`flex flex-col gap-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={projectData.name}
            image={projectData.imageUrl}
            className="size-8"
          />
          <p className="text-lg font-semibold">{projectData.name}</p>
        </div>

        <div>
          <Button variant={'secondary'} size={'sm'} asChild>
            <Link
              href={`/workspaces/${projectData.workspaceId}/projects/${projectId}/settings`}
            >
              <PencilIcon />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>

      {analyticsData && <Analytics data={analyticsData} />}
      <TaskViewSwitcher hideProjectFilters={true} />
    </div>
  );
};
