'use client';

import { z } from 'zod';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from 'next/link';
import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Form,
  FormControl,
  FormMessage,
  FormItem,
  FormField,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { registerSchema } from './../schemas';
import { useRegister } from '../api/use-sign-up';

export const SignUpCard = () => {
  /* ---------- tanstack state ---------- */
  const { mutate, isPending } = useRegister();

  /* ---------- useForm ---------- */
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  /* ---------- functions ---------- */
  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    mutate({
      json: values,
    });
  };

  return (
    <Card className="w-full h-fit md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Sign Up</CardTitle>

        <CardDescription>
          By signing up, you agree to our{' '}
          <Link href={'/privacy'}>
            <span className="text-blue-700">Privacy Policy</span>
          </Link>{' '}
          and
          <Link href={'/terms'}>
            <span className="text-blue-700"> Terms of Service</span>
          </Link>
        </CardDescription>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Enter password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={isPending} size="lg" className="w-full">
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button
          disabled={isPending}
          variant={'secondary'}
          size={'lg'}
          className="w-full"
        >
          <FcGoogle className="mr-2 size-5" />
          SignUp with Google
        </Button>
        <Button
          disabled={isPending}
          variant={'secondary'}
          size={'lg'}
          className="w-full"
        >
          <FaGithub className="mr-2 size-5" />
          SignUp with Github
        </Button>
      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7 flex items-center justify-center">
        <p>
          Already have an account?{' '}
          <Link className="text-blue-700 hover:underline" href={'/sign-in'}>
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
