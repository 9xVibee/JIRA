'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useGetProjects } from '@/features/projects/api/use-get-projects';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

import { cn } from '@/lib/utils';

import { RiAddCircleFill } from 'react-icons/ri';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';

const Projects = ({ open }: { open: () => void }) => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const { data } = useGetProjects({ workspaceId });

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between text-neutral-500">
        <p className="text-xs uppercase font-semibold">Projects</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      <div className="flex flex-col items-start">
        {data?.documents?.map((project, index) => {
          const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
          const isActive = pathname === href;

          return (
            <Link
              href={href}
              key={`${project.$id}-${index}`}
              className="w-full"
            >
              <div
                className={cn(
                  'flex w-full items-center gap-2.5 px-2.5 py-2 rounded-md transition hover:opacity-75 cursor-pointer text-neutral-500',
                  isActive &&
                    'bg-white shadow-sm hover:opacity-100 text-primary'
                )}
              >
                <ProjectAvatar image={project.imageUrl} name={project.name} />
                <span className="truncate">{project.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Projects;
