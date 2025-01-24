import { getCurrent } from '@/features/auth/queries';
import TaskViewSwitcher from '@/features/tasks/components/task-view-switcher';
import { redirect } from 'next/navigation';

const TaskPage = async () => {
  const user = await getCurrent();
  if (!user) return redirect('/sign-in');

  return (
    <div className="h-full flex flex-col">
      <TaskViewSwitcher />
    </div>
  );
};
export default TaskPage;
