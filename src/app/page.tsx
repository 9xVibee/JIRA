import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';

const Home = () => {
  return (
    <div className="flex">
      <Button>Primary</Button>
      <Button variant={'destructive'}>Destructive</Button>
      <Button variant={'ghost'}>ghost</Button>
      <Button variant={'muted'}>Muted</Button>
      <Button variant={'outline'}>outline</Button>
      <Button variant={'secondary'}>secondary</Button>
      <Button variant={'teritary'}>Teritary</Button>
      <Input />
    </div>
  );
};

export default Home;
