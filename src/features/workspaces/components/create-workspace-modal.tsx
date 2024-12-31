'use client';

import ResponsiveModal from '@/components/responsive-moda';
import { CreateWorkspaceForm } from './create-workspace-form';
import { useCreateWorkspaceModal } from './use-create-workspace-modal';

const CreateWorkspaceModal = () => {
  const { close, isOpen, setIsOpen } = useCreateWorkspaceModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateWorkspaceForm onCancel={close} />
    </ResponsiveModal>
  );
};

export default CreateWorkspaceModal;
