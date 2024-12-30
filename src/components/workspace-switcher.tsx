'use client';

import { RiAddCircleFill } from 'react-icons/ri';

import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from './ui/skeleton';

import { useRouter } from 'next/navigation';

import { WorkspaceAvatar } from '@/features/workspaces/components/workspace-avatar';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

const WorkspaceSwitcher = ({ open }: { open: () => void }) => {
  /* ---------- hooks ---------- */
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: workspaces, isPending } = useGetWorkspaces();

  /* ---------- functions ---------- */
  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between text-neutral-500">
        <p className="text-xs uppercase font-semibold">Workspaces</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>

      {isPending || !workspaces ? (
        <Skeleton className="h-[50px] w-full rounded-md" />
      ) : (
        <Select onValueChange={onSelect} value={workspaceId}>
          <SelectTrigger className="w-full bg-neutral-200 font-medium p-1 py-6">
            <SelectValue placeholder="No workspace selected" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.documents.map((workspace) => {
              return (
                <SelectItem value={workspace.$id} key={workspace.$id}>
                  <div className="flex justify-start items-center gap-3 font-medium">
                    <WorkspaceAvatar
                      name={workspace.name}
                      image={workspace.imageUrl}
                    />

                    <span className="truncate">{workspace.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
