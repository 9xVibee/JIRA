'use client';

import { z } from 'zod';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { ArrowLeftIcon, ImageIcon } from 'lucide-react';

import { updateProjectSchema } from '../schemas';
import { cn } from '@/lib/utils';
import { Project } from '../types';
import { useConfirm } from '@/hooks/use-confirm';
import { useDeleteProject } from '../api/use-delete-project';
import { useUpdateProject } from '../api/use-update-project';

interface EditProjectFormProps {
  onCancel?: () => void;
  initialValues: Project;
}

export const EditProjectForm = ({
  onCancel,
  initialValues,
}: EditProjectFormProps) => {
  /* ---------- hooks ---------- */
  const router = useRouter();
  const { mutate, isPending } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();

  const [DeleteDialog, confirmDelete] = useConfirm({
    title: 'Delete Project',
    message: 'Are you sure you want to delete this project?',
    variant: 'destructive',
  });

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl || '',
    },
  });

  /* ---------- funtions ---------- */
  const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : '',
    };

    mutate({
      form: finalValues,
      param: { projectId: initialValues.$id },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue('image', file);
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();

    if (!ok) return;

    deleteProject(
      {
        param: { projectId: initialValues.$id },
      },
      {
        onSuccess: () => {
          router.push('/');
        },
      }
    );
  };

  /* ---------- useRef ---------- */
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />

      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button
            size={'sm'}
            variant={'secondary'}
            onClick={
              onCancel
                ? onCancel
                : () =>
                    router.push(
                      `/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`
                    )
            }
          >
            <ArrowLeftIcon className="size-4" /> Back
          </Button>

          <CardTitle className="text-xl font-bold capitalize">
            {initialValues.name}
          </CardTitle>
        </CardHeader>

        <div className="px-7">
          <DottedSeparator />
        </div>

        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter Project name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => {
                    return (
                      <div className="flex flex-col gap-y-2">
                        <div className="flex items-center gap-x-5">
                          {field.value ? (
                            <div className="size-[72px] relative rounded-md overflow-hidden">
                              <Image
                                fill
                                className="object-cover"
                                alt="Project Image"
                                src={
                                  field?.value instanceof File
                                    ? URL.createObjectURL(field.value)
                                    : field.value
                                }
                              />
                            </div>
                          ) : (
                            <Avatar className="size-[72px]">
                              <AvatarFallback>
                                <ImageIcon className="size-[32px] text-neutral-400" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex flex-col">
                            <p className="text-sm">Project Icon</p>
                            <p className="text-sm text-muted-foreground">
                              JPG, PNG, SVG OR JPEG, max 1mb
                            </p>
                            <input
                              type="file"
                              className="hidden"
                              accept=".jpg, .png, .jpeg, .svg"
                              ref={inputRef}
                              disabled={isPending}
                              onChange={handleImageChange}
                            />
                            {form.getValues('image') ? (
                              <Button
                                type="button"
                                variant={'destructive'}
                                disabled={isPending}
                                size={'sm'}
                                className="w-fit mt-2"
                                onClick={() => form.setValue('image', '')}
                              >
                                Remove Image
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant={'teritary'}
                                disabled={isPending}
                                size={'sm'}
                                className="w-fit mt-2"
                                onClick={() => inputRef.current?.click()}
                              >
                                Upload Image
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>

              <DottedSeparator className="py-7" />

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  size={'lg'}
                  variant={'secondary'}
                  onClick={onCancel}
                  disabled={isPending}
                  className={cn(onCancel && 'invisible')}
                >
                  Cancel
                </Button>

                <Button type="submit" size={'lg'} disabled={isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a project is irreversible. All data will be lost.
            </p>
            <Button
              className="mt-6 w-fit ml-auto"
              size={'sm'}
              variant={'destructive'}
              disabled={isPending}
              onClick={handleDelete}
            >
              Delete Projet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
