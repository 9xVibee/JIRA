'use client';

import ResponsiveModal from '@/components/responsive-moda';

import { useCreateTaskModal } from './use-create-task-modal';

const CreateTaskModal = () => {
  const { isOpen, setIsOpen } = useCreateTaskModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <div>Todo: task form</div>
    </ResponsiveModal>
  );
};

export default CreateTaskModal;
