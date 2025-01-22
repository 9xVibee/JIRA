'use client';

import ResponsiveModal from '@/components/responsive-moda';

import { useCreateTaskModal } from '../hooks/use-create-task-modal';
import { CreateTaskFormWrapper } from './create-task-form-wrapper';

const CreateTaskModal = () => {
  const { isOpen, close } = useCreateTaskModal();

  return (
    <ResponsiveModal
      open={isOpen !== 'false' && isOpen !== null}
      onOpenChange={close}
    >
      <CreateTaskFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};

export default CreateTaskModal;
