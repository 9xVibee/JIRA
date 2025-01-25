import { useState } from 'react';
import { PencilIcon, XIcon } from 'lucide-react';

import { useUpdateTask } from '../api/use-update-task';
import { Task } from '../types';

import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { Textarea } from '@/components/ui/textarea';

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description);

  const { mutate, isPending } = useUpdateTask();

  const handleSave = () => {
    mutate({
      param: {
        taskId: task.$id,
      },
      json: {
        description: value,
      },
    }, {
      onSuccess: () => { 
        setIsEditing(false);
      }
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button
          onClick={() => setIsEditing((prev) => !prev)}
          size={'sm'}
          variant={'secondary'}
        >
          {isEditing ? (
            <XIcon className="size-4" />
          ) : (
            <>
              <PencilIcon className="size-4" />
            </>
          )}
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <DottedSeparator className="my-4" />

      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            disabled={isPending}
          />

          <Button
            size={'sm'}
            className="w-fit ml-auto"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      ) : (
        <div>
          {task.description || (
            <span className="text-muted-foreground">No description set</span>
          )}
        </div>
      )}
    </div>
  );
};
