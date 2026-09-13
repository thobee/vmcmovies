/** Thin top progress bar — use in route loading.tsx shells. */
export default function LoadingBar() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px] overflow-hidden bg-white/[0.06]"
      aria-hidden
    >
      <div className="loading-bar h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
    </div>
  );
}
