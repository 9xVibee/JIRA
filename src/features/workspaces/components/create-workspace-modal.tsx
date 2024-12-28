'use client';

import ResponsiveModal from '@/components/responsive-moda';
import { CreateWorkspaceForm } from './create-workspace-form';

import { ModalProps } from '@/features/types';

const CreateWorkspaceModal = ({ isOpen, setIsOpen }: ModalProps) => {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateWorkspaceForm onCancel={() => setIsOpen(false)} />
    </ResponsiveModal>
  );
};

export default CreateWorkspaceModal;
