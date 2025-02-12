import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface WorkspaceAvatarProps {
  image?: string;
  name: string;
  className?: string;
}

export const WorkspaceAvatar = ({
  image,
  name,
  className,
}: WorkspaceAvatarProps) => {
  if (image) {
    return (
      <div
        className={cn('size-10 relative rounded-sm overflow-hidden', className)}
      >
        <Image src={image} fill alt={name} className="object-cover" />
      </div>
    );
  }

  return (
    <Avatar className={cn('size-10 !rounded-sm', className)}>
      <AvatarFallback className="text-white bg-blue-600 font-semibold !rounded-sm text-lg uppercase">
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};
