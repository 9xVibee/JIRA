interface OverviewPropertyProps {
  label: string;
  children: React.ReactNode;
}

export const OverviewProperty = ({
  children,
  label,
}: OverviewPropertyProps) => {
  return (
    <div className="flex items-start gap-x-2">
      <div className="min-w-[100px] mt-[2px]">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <div className="flex items-center gap-x-2">{children}</div>
    </div>
  );
};
