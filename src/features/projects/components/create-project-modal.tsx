'use client';

import ResponsiveModal from '@/components/responsive-moda';
import { CreateProjectForm } from './create-project-form';

import { ModalProps } from '@/features/types';

const CreateProjectModal = ({ isOpen, setIsOpen }: ModalProps) => {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateProjectForm onCancel={() => setIsOpen(false)} />
    </ResponsiveModal>
  );
};

export default CreateProjectModal;
