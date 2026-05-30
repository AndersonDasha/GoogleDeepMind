/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flower2, RotateCcw } from "lucide-react";

export default function AppHeader({ onReset, showReset }: { onReset?: () => void; showReset?: boolean }) {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose text-white shadow-sm">
          <Flower2 size={18} strokeWidth={2.2} />
        </div>
        <div className="leading-none">
          <h1 className="font-display text-xl text-ink">Bloom</h1>
          <p className="text-[11px] text-ink/50">Pregnancy-friendly beauty</p>
        </div>
      </div>
      {showReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-ink/70 transition hover:bg-white active:scale-95"
        >
          <RotateCcw size={13} /> Start over
        </button>
      )}
    </header>
  );
}
