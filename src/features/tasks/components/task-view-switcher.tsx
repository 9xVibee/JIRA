'use client';
import { useCallback } from 'react';
import { Loader, PlusIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { useQueryState } from 'nuqs';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetTasks } from '../api/use-get-tasks';

import { DottedSeparator } from '@/components/dotted-separator';
import { columns } from '@/components/columns';
import { DataKanban } from './data-kanban';
import { DataTable } from './data-table';
import { DataCalendar } from './data-calendar';

import { DataFilters } from './data-filters';

import { useProjectId } from '@/features/projects/hooks/use-project-id';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';
import { useTaskFilters } from '../hooks/use-task-filters';

import { TaskStatus } from '../types';
import { useBulkUpdateTasks } from '../api/use-bulk-update-task';

interface TaskViewSwitcherProps {
  hideProjectFilters?: boolean;
}

const TaskViewSwitcher = ({
  hideProjectFilters = false,
}: TaskViewSwitcherProps) => {
  const { mutate } = useBulkUpdateTasks();
  const [view, setView] = useQueryState('task-view', {
    defaultValue: 'table',
  });
  const paramProjectId = useProjectId();

  const [{ status, assigneeId, projectId, dueDate, search }] = useTaskFilters();

  const workspaceId = useWorkspaceId();
  const { open } = useCreateTaskModal();

  const { data, isLoading } = useGetTasks({
    workspaceId,
    status,
    assigneeId,
    projectId: paramProjectId || projectId,
    dueDate,
    search,
  });

  const onKanbanChange = useCallback(
    (tasks: { $id: string; status: TaskStatus; position: number }[]) => {
      mutate({
        json: {
          tasks,
        },
      });
    },
    [mutate]
  );

  return (
    <Tabs
      className="flex-1 w-full border rounded-lg"
      defaultValue={view}
      onValueChange={setView}
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
              Table
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
              Kanban
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="calender">
              Calender
            </TabsTrigger>
          </TabsList>

          <Button
            size={'sm'}
            className="w-full lg:w-auto"
            onClick={() => open('true')}
          >
            <PlusIcon className="size-4" /> New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters hideProjectFilters={hideProjectFilters} />
        <DottedSeparator className="my-4" />
        {isLoading ? (
          <div className="w-full border rounded-lg h-[200px] flex items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <DataTable columns={columns} data={data?.documents ?? []} />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban
                data={data?.documents ?? []}
                onChange={onKanbanChange}
              />
            </TabsContent>
            <TabsContent value="calender" className="mt-0 h-full">
              <DataCalendar data={data?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};

export default TaskViewSwitcher;
