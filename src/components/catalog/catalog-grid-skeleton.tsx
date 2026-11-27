export function CatalogGridSkeleton({ label }: { label: string }) {
  return (
    <>
      <p role="status" className="sr-only">{label}</p>
      <div aria-hidden="true">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-m3-lg bg-surface">
              <div className="aspect-square ui-skeleton" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded-m3-xs ui-skeleton" />
                <div className="h-3 w-1/2 rounded-m3-xs ui-skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
