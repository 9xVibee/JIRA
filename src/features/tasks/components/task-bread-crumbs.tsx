import Link from 'next/link';

import { Project } from '@/features/projects/types';
import { Task } from '../types';

import { Button } from '@/components/ui/button';

import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { ChevronRightIcon, TrashIcon } from 'lucide-react';
import { useDeleteTask } from '../api/use-delete-task';
import { useConfirm } from '@/hooks/use-confirm';
import { useRouter } from 'next/navigation';

interface TaskBreadcrumbsProps {
  project: Project;
  task: Task;
}

export const TaskBreadcrumbs = ({ project, task }: TaskBreadcrumbsProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useDeleteTask();
  const [ConfirmationDialog, confirm] = useConfirm({
    title: 'Delete Task',
    message: 'This action cannot be undone',
    variant: 'destructive',
  });

  const handleDeleteTask = async () => {
    const ok = await confirm();

    if (!ok) return;

    mutate(
      { param: { taskId: task.$id } },
      {
        onSuccess: () => {
          router.push(`/workspaces/${workspaceId}/projects/${project.$id}`);
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmationDialog />
      <ProjectAvatar
        name={project.name}
        image={project.imageUrl}
        className="size-6 lg:size-8"
      />
      <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
        <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
          {project.name}
        </p>
      </Link>
      <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />
      <p className="text-sm lg:text-lg font-semibold">{task.name}</p>
      <Button
        className="ml-auto"
        variant={'destructive'}
        size={'sm'}
        onClick={handleDeleteTask}
        disabled={isPending}
      >
        <TrashIcon className="size-4" />
        <span className="hidden lg:block">Delete Task</span>
      </Button>
    </div>
  );
};
