import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className="bg-neutral-100 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center">
          <Image src={'/logo.svg'} alt="logo" height={56} width={152} />
          <Button variant={'secondary'}>Sign Up</Button>
        </nav>
        {children}
      </div>
    </main>
  );
};

export default AuthLayout;
