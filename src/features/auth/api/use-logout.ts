import { useMutation } from '@tanstack/react-query';
import { InferResponseType } from 'hono';

import { client } from '@/lib/rpc';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type ResponseType = InferResponseType<(typeof client.api.auth.logout)['$post']>;

export const useLogout = () => {
  const router = useRouter();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout.$post();

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      return await response.json();
    },
    onError: () => {
      toast.error('Failed to logout');
    },
    onSuccess: () => {
      toast.success('Logged out successfully');
      router.refresh();
    },
  });

  return mutation;
};
