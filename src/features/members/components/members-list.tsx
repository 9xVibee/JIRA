'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimate,
  usePresence,
} from 'framer-motion';

import { ArrowLeftIcon, Loader, MoreVerticalIcon } from 'lucide-react';

import { MemberAvatar } from './workspace-avatar';
import { Button } from '@/components/ui/button';
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
import { PageLoader } from '@/components/page-loader';
import { PageError } from '@/components/page-error';

export const MembersList = () => {
  const [members, setMembers] = useState({ documents: [] });
  const [memberId, setMemberId] = useState<string | null>(null);

  /* --------------- hooks --------------- */
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useGetMembers({ workspaceId });
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
    setMemberId(memberId);
    const ok = await confirmDelete();

    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          setMembers((prev) => ({
            documents: prev.documents.filter(
              (member) => member.$id !== memberId
            ),
          }));

          setMemberId(null);
        },
      }
    );
  };

  useEffect(() => {
    if (data) {
      setMembers(data);
    }
  }, [data]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!data) {
    return <PageError />;
  }

  return (
    <div className="w-full h-full flex flex-col gap-y-3">
      <DeleteDialog />
      <div className="flex flex-row bg-white shadow-box items-center rounded-lg gap-x-4 p-3 space-y-0">
        <Button variant={'secondary'} size={'sm'} asChild>
          <Link href={'/'}>
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
        </Button>

        <p className="text-xl font-bold">Members List</p>
      </div>

      <div className="p-7 rounded-lg flex flex-col gap-y-2 w-full">
        <AnimatePresence>
          {members?.documents.map((member, index) => (
            <Member
              key={`${member.$id}-${index}`}
              deletePending={deletePending}
              updatePending={updatePending}
              handleDeleteMember={handleDeleteMember}
              handleUpdateMember={handleUpdateMember}
              index={index}
              member={member}
              memberId={memberId}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Member = ({
  member,
  handleDeleteMember,
  handleUpdateMember,
  deletePending,
  updatePending,
  index,
  memberId,
}) => {
  const [isPresent, safeToRemove] = usePresence();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!isPresent) {
      const exitAnimation = async () => {
        await animate(
          scope.current,
          {
            zIndex: 99,
            scale: 1.025,
            y: 10,
          },
          {
            duration: 0.2,
            type: 'spring',
            damping: 15,
            stiffness: 250,
            ease: 'easeIn',
          }
        );
        await animate(
          '.member-details',
          {
            textDecoration: 'line-through',
            color: 'red',
          },
          {
            duration: 0.2,
            ease: 'easeIn',
          }
        );
        await animate(
          scope.current,
          {
            opacity: 0,
            x: -50,
          },
          {
            delay: 0.7,
          }
        );
        safeToRemove();
      };

      exitAnimation();
    }
  }, [isPresent]);

  return (
    <motion.div
      className="relative !bg-white shadow-box rounded-md p-2 w-full"
      ref={scope}
      initial={{ opacity: 0, x: 50 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          delay: index * 0.1,
          duration: 0.3,
          type: 'spring',
          damping: 15,
          stiffness: 250,
        },
      }}
    >
      <div className="flex items-center gap-2">
        <MemberAvatar
          name={member.name}
          className="size-10"
          fallbackClassName="text-lg"
        />

        <div className="flex flex-col">
          <p className="text-sm font-medium member-details">{member.name}</p>
          <p className="text-xs text-muted-foreground member-details">
            {member.email}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="ml-auto"
              variant={'secondary'}
              size={'icon'}
              disabled={deletePending || updatePending}
            >
              {(deletePending || updatePending) && memberId === member.$id ? (
                <Loader className="size-4 text-muted-foreground animate-spin" />
              ) : (
                <MoreVerticalIcon className="size-4 text-muted-foreground" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem
              className="font-medium cursor-pointer"
              onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
              disabled={deletePending || updatePending}
            >
              Set as Administrator
            </DropdownMenuItem>

            <DropdownMenuItem
              className="font-medium cursor-pointer"
              onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)}
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
    </motion.div>
  );
};
