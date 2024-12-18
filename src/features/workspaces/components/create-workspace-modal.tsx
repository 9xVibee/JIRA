'use client';

import ResponsiveModal from '@/components/responsive-moda';
import { CreateWorkspaceForm } from './create-workspace-form';
import { useCreateWorkspaceModal } from '../hooks/use-create-workspace-moda';

const CreateWorkspaceModal = () => {
  const { isOpen, close, setIsOpen } = useCreateWorkspaceModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateWorkspaceForm onCancel={close} />
    </ResponsiveModal>
  );
};

export default CreateWorkspaceModal;
