type LoadingOverlayProps = {
  label: string;
};

export function LoadingOverlay({ label }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[1.75rem] bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand" />
        <p className="text-sm font-medium text-muted">{label}</p>
      </div>
    </div>
  );
}
