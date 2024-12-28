'use client';

import Image from 'next/image';
import Link from 'next/link';

import CreateProjectModal from '@/features/projects/components/create-project-modal';
import CreateWorkspaceModal from '@/features/workspaces/components/create-workspace-modal';
import { DottedSeparator } from './dotted-separator';
import Navigation from './navigation';
import WorkspaceSwitcher from './workspace-switcher';
import Projects from './projects';
import { useState } from 'react';

const Sidebar = () => {
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  return (
    <aside className="h-full bg-neutral-100 p-4 w-full">
      <CreateProjectModal
        isOpen={projectModalOpen}
        setIsOpen={setProjectModalOpen}
      />
      <CreateWorkspaceModal
        isOpen={workspaceModalOpen}
        setIsOpen={setWorkspaceModalOpen}
      />
      <Link href="/">
        <Image src={'/logo.svg'} alt="logo" width={164} height={48} />
      </Link>
      <DottedSeparator className="my-4" />
      <WorkspaceSwitcher open={() => setWorkspaceModalOpen(true)} />
      <DottedSeparator className="my-4" />
      <Navigation />
      <DottedSeparator className="my-4" />
      <Projects open={() => setProjectModalOpen(true)} />
    </aside>
  );
};

export default Sidebar;
