/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ArrowLeft, Loader2, Plus, Sparkles, X } from "lucide-react";
import type { ParsedProduct } from "../lib/types";

export default function ProductReview({
  products,
  onBack,
  onConfirm,
  loading,
}: {
  products: ParsedProduct[];
  onBack: () => void;
  onConfirm: (products: ParsedProduct[]) => void;
  loading: boolean;
}) {
  const [items, setItems] = useState<ParsedProduct[]>(products);
  const [draft, setDraft] = useState("");

  const remove = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id));
  const add = () => {
    const name = draft.trim();
    if (!name) return;
    setItems((xs) => [...xs, { id: `m${Date.now()}`, name }]);
    setDraft("");
  };

  return (
    <div className="flex flex-1 flex-col px-5 pb-8">
      <button onClick={onBack} className="mb-3 flex items-center gap-1 self-start text-sm text-ink/60 hover:text-ink">
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="font-display text-[24px] leading-tight text-ink">
        We found {items.length} product{items.length === 1 ? "" : "s"}
      </h2>
      <p className="mt-1 text-sm text-ink/60">Remove anything that's not right, or add items we missed.</p>

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
        {items.map((p) => (
          <div key={p.id} className="card flex items-center justify-between rounded-2xl px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{p.name}</p>
              {(p.brand || p.category) && (
                <p className="truncate text-xs text-ink/50">
                  {[p.brand, p.category].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <button
              onClick={() => remove(p.id)}
              className="ml-3 shrink-0 rounded-full p-1.5 text-ink/40 transition hover:bg-rose/10 hover:text-rose-deep"
              aria-label="Remove"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-ink/15 px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a product…"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/35 focus:outline-none"
          />
          <button onClick={add} className="rounded-full bg-sage/20 p-1.5 text-sage-deep transition hover:bg-sage/30">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <button
        disabled={!items.length || loading}
        onClick={() => onConfirm(items)}
        className="mt-4 flex items-center justify-center gap-2 rounded-full bg-rose py-3.5 font-semibold text-white shadow-md transition enabled:hover:bg-rose-deep enabled:active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Checking ingredients…
          </>
        ) : (
          <>
            <Sparkles size={18} /> Check pregnancy safety
          </>
        )}
      </button>
    </div>
  );
}
