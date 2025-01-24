import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { format } from 'date-fns';

interface ToolbarProps {
  handleNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  date: Date;
}

export const Toolbar = ({ date, handleNavigate }: ToolbarProps) => {
  return (
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
      <Button
        onClick={() => handleNavigate('PREV')}
        variant={'secondary'}
        size={'icon'}
        className="flex items-center"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex items-center border border-input rounded-md py-2 h-8 justify-center px-3 w-full lg:w-auto">
        <Calendar className="size-4 mr-2" />
        <p className="text-sm">{format(date, 'MMMM')}</p>
      </div>
      <Button
        onClick={() => handleNavigate('NEXT')}
        variant={'secondary'}
        size={'icon'}
        className="flex items-center"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
};
