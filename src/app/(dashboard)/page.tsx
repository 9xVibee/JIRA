import { protect } from '@/features/auth/actions';
import { CreateWorkspaceForm } from '@/features/workspaces/components/create-workspace-form';
import { redirect } from 'next/navigation';

const Home = async () => {
  const user = await protect();

  if (!user) redirect('/sign-in');

  return (
    <div className="p-7 bg-gray-400">
      <CreateWorkspaceForm />
    </div>
  );
};

export default Home;
