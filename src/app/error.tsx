'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const ErrorPage = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <AlertTriangle className="text-red-500 size-6" />
      <p className="text-sm text-red-500 text-muted-foreground font-medium">
        Something went wrong. Please try again later.
      </p>

      <Button variant={'ghost'} asChild>
        <Link href={'/'}>Back to home</Link>
      </Button>
    </div>
  );
};

export default ErrorPage;
