import { protect } from '@/features/auth/actions';
import { SignUpCard } from '@/features/auth/components/sign-up-card';

import { redirect } from 'next/navigation';

const SignUp = async () => {
  const user = await protect();

  if (user) return redirect('/');

  return <SignUpCard />;
};

export default SignUp;
