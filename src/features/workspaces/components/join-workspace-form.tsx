'use client';

import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { useJoinWorkspace } from '../api/use-join-workspace';
import { useInviteCode } from '../hooks/use-invite-code';
import { useWorkspaceId } from '../hooks/use-workspace-id';
import { useRouter } from 'next/navigation';

interface JoinWorkspaceformProps {
  initialValues: {
    name: string;
  };
}

export const JoinWorkspaceform = ({
  initialValues,
}: JoinWorkspaceformProps) => {
  const router = useRouter();
  const { mutate, isPending } = useJoinWorkspace();
  const inviteCode = useInviteCode();
  const workspaceId = useWorkspaceId();

  const handleOnJoinWorkspace = () => {
    mutate(
      { json: { code: inviteCode }, param: { workspaceId } },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data.$id}`);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">Join workspace</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{initialValues.name}</strong>
        </CardDescription>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-y-2 gap-x-2">
          <Button
            type="button"
            asChild
            size={'lg'}
            variant={'secondary'}
            className="w-full lg:w-fit"
            disabled={isPending}
          >
            <Link href={'/'}>Cancel</Link>
          </Button>
          <Button
            onClick={handleOnJoinWorkspace}
            size={'lg'}
            className="w-full lg:w-fit"
            disabled={isPending}
            type="button"
          >
            Join Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
