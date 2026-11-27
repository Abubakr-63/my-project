export function LoadingSkeleton({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div className="space-y-3">
      <p role="status" className="sr-only">{label}</p>
      <div aria-hidden="true" className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="ui-card flex min-h-24 items-center gap-4 p-4">
            <div className="ui-skeleton size-14 shrink-0 rounded-m3-md" />
            <div className="w-full space-y-3">
              <div className="ui-skeleton h-4 w-2/3 rounded-m3-xs" />
              <div className="ui-skeleton h-3 w-1/3 rounded-m3-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
