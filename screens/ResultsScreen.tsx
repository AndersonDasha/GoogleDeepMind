/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import Disclaimer from "../components/Disclaimer";
import type { AnalyzedProduct, Severity } from "../lib/types";

type Filter = "all" | Severity;

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "replace", label: "Replace" },
  { key: "caution", label: "Check" },
  { key: "keep", label: "Keep" },
];

export default function ResultsScreen({
  products,
  savedIds,
  onToggleSave,
  onRestart,
}: {
  products: AnalyzedProduct[];
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onRestart: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { keep: 0, caution: 0, replace: 0 };
    products.forEach((p) => (c[p.status] += 1));
    return c;
  }, [products]);

  const order: Record<Severity, number> = { replace: 0, caution: 1, keep: 2 };
  const shown = useMemo(
    () =>
      [...products]
        .filter((p) => filter === "all" || p.status === filter)
        .sort((a, b) => order[a.status] - order[b.status]),
    [products, filter],
  );

  return (
    <div className="flex flex-1 flex-col px-6 pb-10 pt-2">
      <p className="eyebrow text-ash">The edit</p>
      <h2 className="mt-2 font-display text-[30px] leading-[1.1] text-ink">
        Your routine,<br />reviewed.
      </h2>

      <div className="mt-6 flex border-y hairline">
        <Stat n={counts.keep} label="Keep" />
        <span className="w-px bg-line" />
        <Stat n={counts.caution} label="Check" />
        <span className="w-px bg-line" />
        <Stat n={counts.replace} label="Replace" />
      </div>

      <div className="mt-5 flex gap-5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`shrink-0 border-b-2 pb-1.5 eyebrow transition ${
              filter === t.key ? "border-ink text-ink" : "border-transparent text-ash"
            }`}
          >
            {t.label}
            {t.key !== "all" ? ` ${counts[t.key]}` : ` ${products.length}`}
          </button>
        ))}
      </div>

      <div className="mt-1 flex-1">
        {shown.length === 0 ? (
          <p className="py-16 text-center text-[13px] text-ash">Nothing in this edit.</p>
        ) : (
          shown.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              saved={savedIds.has(p.id)}
              onToggleSave={() => onToggleSave(p.id)}
            />
          ))
        )}
      </div>

      <button onClick={onRestart} className="mt-8 self-start eyebrow text-ink/60 underline">
        Analyze another import
      </button>
      <Disclaimer className="mt-6" />
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex-1 py-4 text-center">
      <div className="font-display text-[26px] leading-none text-ink">{n}</div>
      <div className="mt-1.5 eyebrow text-ash">{label}</div>
    </div>
  );
}
