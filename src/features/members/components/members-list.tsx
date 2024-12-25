'use client';

import Link from 'next/link';
import { Fragment } from 'react';

import { ArrowLeftIcon, MoreVerticalIcon } from 'lucide-react';

import { MemberAvatar } from './workspace-avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DottedSeparator } from '@/components/dotted-separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetMembers } from '../api/use-get-members';
import { useDeleteMember } from '../api/use-delete-member';
import { useUpdateMember } from '../api/use-update-member';
import { useConfirm } from '@/hooks/use-confirm';

import { MemberRole } from '../types';

export const MembersList = () => {
  /* --------------- hooks --------------- */
  const workspaceId = useWorkspaceId();

  const { data } = useGetMembers({ workspaceId });
  const [DeleteDialog, confirmDelete] = useConfirm({
    title: 'Remove Member',
    message: 'This member will be removed from the workspace.',
    variant: 'destructive',
  });
  const { mutate: deleteMember, isPending: deletePending } = useDeleteMember();
  const { mutate: updateMember, isPending: updatePending } = useUpdateMember();

  /* --------------- functions --------------- */
  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      param: { memberId },
      json: { role },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirmDelete();

    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <DeleteDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button variant={'secondary'} size={'sm'} asChild>
          <Link href={'/'}>
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
        </Button>

        <CardTitle className="text-xl font-bold">Members List</CardTitle>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        {data?.documents.map((member, index) => (
          <Fragment key={`${member.$id}-${index}`}>
            <div className="flex items-center gap-2">
              <MemberAvatar
                name={member.name}
                className="size-10"
                fallbackClassName="text-lg"
              />

              <div className="flex flex-col">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="ml-auto"
                    variant={'secondary'}
                    size={'icon'}
                  >
                    <MoreVerticalIcon className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem
                    className="font-medium cursor-pointer"
                    onClick={() =>
                      handleUpdateMember(member.$id, MemberRole.ADMIN)
                    }
                    disabled={deletePending || updatePending}
                  >
                    Set as Administrator
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="font-medium cursor-pointer"
                    onClick={() =>
                      handleUpdateMember(member.$id, MemberRole.MEMBER)
                    }
                    disabled={deletePending || updatePending}
                  >
                    Set as Member
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="font-medium text-amber-700 cursor-pointer"
                    onClick={() => handleDeleteMember(member.$id)}
                    disabled={deletePending || updatePending}
                  >
                    Remove {member.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {index < data.documents.length - 1 && (
              <Separator className="my-2.5" />
            )}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
};
