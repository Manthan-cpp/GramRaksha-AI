export default function Loading() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-ink-soft/20 border-t-moss rounded-full animate-spin"></div>
        <p className="text-ink-soft font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
