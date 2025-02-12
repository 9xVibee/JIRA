import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/rpc';
import { useRouter } from 'next/navigation';

type ResponseType = InferResponseType<
  (typeof client.api.projects)['$post'],
  200
>;
type RequestType = InferRequestType<(typeof client.api.projects)['$post']>;

export const useCreateProject = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.projects['$post']({ form });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success('Project created');
      router.push(`/workspaces/${data.workspaceId}/projects/${data.$id}`);
      queryClient.invalidateQueries({
        queryKey: ['projects', data.workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to create project');
    },
  });

  return mutation;
};
