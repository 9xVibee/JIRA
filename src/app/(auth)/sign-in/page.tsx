import { protect } from '@/features/auth/actions';
import { SignInCard } from '@/features/auth/components/sign-in-card';
import { redirect } from 'next/navigation';

const SignInPage = async () => {
  const user = await protect();

  if (user) return redirect('/');
  return <SignInCard />;
};

export default SignInPage;
