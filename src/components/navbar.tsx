'use client';

import { UserButton } from '@/features/auth/components/user-button';
import MobileSidebar from './mobile-sidebar';
import { usePathname } from 'next/navigation';

const pathNameMap = {
  tasks: {
    title: 'My Tasks',
    description: 'View all of your tasks here',
  },
  projects: {
    title: 'Projects',
    description: 'View tasks of your projects here',
  },
};

const defaultMap = {
  title: 'Home',
  description: 'Monitor all of your projects and tasks here',
};

const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split('/');

  const pathNameKey = pathnameParts[3] as keyof typeof pathNameMap;
  const { title, description } = pathNameMap[pathNameKey] || defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center w-full justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p>{description}</p>
      </div>

      <MobileSidebar />
      <UserButton />
    </nav>
  );
};

export default Navbar;
