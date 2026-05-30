/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import Disclaimer from "./Disclaimer";
import type { AnalyzedProduct, Severity } from "../lib/types";

type Filter = "all" | Severity;

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "replace", label: "Replace" },
  { key: "caution", label: "Check" },
  { key: "keep", label: "Keep" },
];

export default function ResultsScreen({ products }: { products: AnalyzedProduct[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { keep: 0, caution: 0, replace: 0 };
    products.forEach((p) => (c[p.status] += 1));
    return c;
  }, [products]);

  const order: Record<Severity, number> = { replace: 0, caution: 1, keep: 2 };
  const sorted = useMemo(
    () =>
      [...products]
        .filter((p) => filter === "all" || p.status === filter)
        .sort((a, b) => order[a.status] - order[b.status]),
    [products, filter],
  );

  return (
    <div className="flex flex-1 flex-col px-5 pb-10">
      <h2 className="font-display text-[24px] leading-tight text-ink">Your routine, reviewed</h2>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat n={counts.keep} label="Keep" tint="bg-sage/15 text-sage-deep" />
        <Stat n={counts.caution} label="Check" tint="bg-amber-soft/20 text-[#a06b1f]" />
        <Stat n={counts.replace} label="Replace" tint="bg-rose/15 text-rose-deep" />
      </div>

      <div className="sticky top-0 z-10 -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              filter === t.key ? "bg-ink text-cream" : "bg-white/70 text-ink/60 hover:bg-white"
            }`}
          >
            {t.label}
            {t.key !== "all" && ` · ${counts[t.key]}`}
          </button>
        ))}
      </div>

      <div className="mt-2 flex-1 space-y-2.5">
        {sorted.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/50">Nothing in this category.</p>
        ) : (
          sorted.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      <Disclaimer className="mt-5" />
    </div>
  );
}

function Stat({ n, label, tint }: { n: number; label: string; tint: string }) {
  return (
    <div className={`rounded-2xl px-3 py-3 text-center ${tint}`}>
      <div className="font-display text-2xl leading-none">{n}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}
