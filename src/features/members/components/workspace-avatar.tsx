import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MemberAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const MemberAvatar = ({
  name,
  className,
  fallbackClassName,
}: MemberAvatarProps) => {
  return (
    <Avatar
      className={cn(
        'size-10 translate-x-0 border border-neutral-300 rounded-full',
        className
      )}
    >
      <AvatarFallback
        className={cn(
          'bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center',
          fallbackClassName
        )}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
