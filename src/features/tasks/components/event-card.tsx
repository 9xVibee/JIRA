import { TaskStatus } from '../types';
import { Project } from '../../projects/types';
import { cn } from '@/lib/utils';
import { MemberAvatar } from '@/features/members/components/workspace-avatar';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Member } from '@/features/members/types';

interface EventCardProps {
  id: string;
  title: string;
  project: Project;
  assignee: Member;
  status: TaskStatus;
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'border-l-pink-500',
  [TaskStatus.TODO]: 'border-l-red-500',
  [TaskStatus.IN_PROGRESS]: 'border-l-yellow-500',
  [TaskStatus.IN_REVIEW]: 'border-l-blue-500',
  [TaskStatus.DONE]: 'border-l-emerald-500',
};

export const EventCard = ({
  assignee,
  id,
  project,
  status,
  title,
}: EventCardProps) => {
  const router = useRouter();
  const workspaceId = project.workspaceId;

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          'p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition',
          statusColorMap[status]
        )}
      >
        <p>{title}</p>
        <div className="flex items-center gap-x-1">
          <MemberAvatar name={assignee?.name} />
          <ProjectAvatar name={project.name} image={project.imageUrl} />
        </div>
      </div>
    </div>
  );
};
