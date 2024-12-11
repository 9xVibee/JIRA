'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();
  const isSignIn = pathname === '/sign-in';

  return (
    <main className="bg-neutral-100 h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center">
          <Image src={'/logo.svg'} alt="logo" height={56} width={152} />
          <Button asChild variant={'secondary'}>
            <Link href={isSignIn ? '/sign-up' : '/sign-in'}>
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </Link>
          </Button>
        </nav>
      </div>
      <div
        style={{
          height: 'calc(100% - 92px)',
        }}
        className="flex w-full justify-center items-center"
      >
        {children}
      </div>
    </main>
  );
};

export default AuthLayout;
