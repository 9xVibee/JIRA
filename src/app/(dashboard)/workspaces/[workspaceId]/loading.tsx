import { Loader } from 'lucide-react';

/* this will going to get call when the there is some await in the page.tsx */
const WorkspaceLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
};

export default WorkspaceLoading;
