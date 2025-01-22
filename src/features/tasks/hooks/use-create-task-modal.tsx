'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { TaskStatus } from '../types';

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState('create-task', parseAsString);

  const open = (status: TaskStatus | 'true') => setIsOpen(status);
  const close = () => setIsOpen(null);

  return {
    isOpen,
    open,
    close,
    setIsOpen,
  };
};
