import { protect } from '@/features/auth/actions';
import { redirect } from 'next/navigation';

const Home = async () => {
  const user = await protect();

  if (!user) redirect('/sign-in');

  return <div className="flex">This is a home pages</div>;
};

export default Home;
