/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import MonogramTile from "../components/MonogramTile";
import type { ParsedProduct } from "../lib/types";
import type { SourceLabel } from "./ImportHub";

export default function ReviewScreen({
  products,
  source,
  loading,
  onConfirm,
}: {
  products: ParsedProduct[];
  source: SourceLabel;
  loading: boolean;
  onConfirm: (products: ParsedProduct[]) => void;
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
    <div className="flex flex-1 flex-col px-6 pb-10 pt-2">
      <p className="eyebrow text-ash">From {source}</p>
      <h2 className="mt-2 font-display text-[28px] leading-tight text-ink">
        {items.length} piece{items.length === 1 ? "" : "s"} found
      </h2>
      <p className="mt-2 text-[13px] text-ash">Remove anything that's off, or add what we missed.</p>

      <div className="mt-6 flex-1">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-4 border-b hairline py-3">
            <MonogramTile brand={p.brand} name={p.name} size="sm" />
            <div className="min-w-0 flex-1">
              {p.brand && <p className="eyebrow text-ink">{p.brand}</p>}
              <p className="truncate font-display text-[15px] text-ink">{p.name}</p>
              {p.category && <p className="text-[12px] text-ash">{p.category}</p>}
            </div>
            <button onClick={() => remove(p.id)} className="text-ink/40 transition hover:text-replace">
              <X size={17} strokeWidth={1.5} />
            </button>
          </div>
        ))}

        <div className="mt-3 flex items-center gap-2 border-b border-dashed hairline py-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a product"
            className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-ash/70 focus:outline-none"
          />
          <button onClick={add} className="text-ink/60 hover:text-ink">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <button
        onClick={() => onConfirm(items)}
        disabled={!items.length || loading}
        className="mt-6 flex items-center justify-center gap-2 bg-ink py-4 text-paper transition active:scale-[0.99] disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Editing your routine…
          </>
        ) : (
          <span className="eyebrow text-paper">Edit for pregnancy</span>
        )}
      </button>
    </div>
  );
}
