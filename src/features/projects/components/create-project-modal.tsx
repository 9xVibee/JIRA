'use client';

import ResponsiveModal from '@/components/responsive-moda';
import { CreateProjectForm } from './create-project-form';
import { useCreateProjectModal } from './use-create-project-modal';

const CreateProjectModal = () => {
  const { isOpen, setIsOpen } = useCreateProjectModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateProjectForm onCancel={() => setIsOpen(false)} />
    </ResponsiveModal>
  );
};

export default CreateProjectModal;
