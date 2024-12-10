import { Button } from '@/components/ui/button';

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
    </div>
  );
};

export default Home;
