import { getCurrent } from '@/features/auth/queries';

import { redirect } from 'next/navigation';

import Workspace from './client';

const Home = async () => {
  const user = await getCurrent();

  if (!user) redirect('/sign-in');

  return <Workspace />;
};

export default Home;
