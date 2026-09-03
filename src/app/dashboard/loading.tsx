export default function DashboardLoading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full bg-slate-950 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-32 rounded bg-slate-800 animate-pulse" />
          <div className="h-4 w-52 rounded bg-slate-900 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2"
            >
              <div className="h-4 w-3/4 rounded bg-slate-800 animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-slate-800/60 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
