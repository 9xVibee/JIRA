import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProjectAvatarProps {
  image?: string;
  name: string;
  className?: string;
}

export const ProjectAvatar = ({
  image,
  name,
  className,
}: ProjectAvatarProps) => {
  if (image) {
    return (
      <div
        className={cn('size-5 relative rounded-md overflow-hidden', className)}
      >
        <Image
          src={image}
          fill
          alt={name}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <Avatar className={cn('size-5 !rounded-sm', className)}>
      <AvatarFallback className="text-white bg-blue-600 !rounded-sm font-semibold text-sm uppercase">
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};
