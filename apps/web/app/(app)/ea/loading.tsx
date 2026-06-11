export default function EaLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-7">
        <div className="h-8 w-64 rounded-md bg-hover" />
        <div className="mt-2 h-4 w-96 rounded-md bg-hover" />
      </div>
      <div className="h-[88px] rounded-lg border border-edge-subtle bg-hover" />
      <div className="mb-4 mt-9 h-5 w-56 rounded-md bg-hover" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[96px] rounded-lg border border-edge-subtle bg-hover" />
        ))}
      </div>
      <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[140px] rounded-lg border border-edge-subtle bg-hover" />
        ))}
      </div>
    </div>
  );
}
