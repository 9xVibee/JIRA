import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[':taskId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[':taskId']['$delete']
>;

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[':taskId']['$delete']({ param });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success('Task deleted');
      queryClient.invalidateQueries({
        queryKey: ['task', data.$id],
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });

  return mutation;
};
