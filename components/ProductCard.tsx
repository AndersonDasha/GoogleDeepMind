/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { AlertTriangle, ChevronDown, Check, Repeat2, SprayCan, XOctagon } from "lucide-react";
import type { AnalyzedProduct, Severity } from "../lib/types";

const STYLES: Record<Severity, { label: string; chip: string; icon: typeof Check; bar: string }> = {
  keep: { label: "Keep", chip: "bg-sage/20 text-sage-deep", icon: Check, bar: "bg-sage" },
  caution: { label: "Check", chip: "bg-amber-soft/25 text-[#a06b1f]", icon: AlertTriangle, bar: "bg-amber-soft" },
  replace: { label: "Replace", chip: "bg-rose/20 text-rose-deep", icon: XOctagon, bar: "bg-rose" },
};

export default function ProductCard({ product }: { product: AnalyzedProduct }) {
  const [open, setOpen] = useState(product.status !== "keep");
  const s = STYLES[product.status];
  const Icon = s.icon;
  const hasDetail = product.concerns.length > 0 || product.suggestedSwap || product.fragranced;

  return (
    <div className="card animate-float-up overflow-hidden rounded-2xl">
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${s.bar}`} />
        <button
          onClick={() => hasDetail && setOpen((o) => !o)}
          className="flex flex-1 items-start gap-3 px-4 py-3.5 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.chip}`}>
                <Icon size={11} strokeWidth={2.5} /> {s.label}
              </span>
              {product.fragranced && (
                <span className="flex items-center gap-1 text-[11px] text-ink/45">
                  <SprayCan size={11} /> fragranced
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm font-medium text-ink">{product.name}</p>
            {product.brand && <p className="text-xs text-ink/45">{product.brand}</p>}
            <p className="mt-1 text-[12px] leading-snug text-ink/60">{product.summary}</p>
          </div>
          {hasDetail && (
            <ChevronDown
              size={18}
              className={`mt-1 shrink-0 text-ink/30 transition ${open ? "rotate-180" : ""}`}
            />
          )}
        </button>
      </div>

      {open && hasDetail && (
        <div className="space-y-2.5 border-t border-ink/5 bg-white/40 px-4 py-3">
          {product.concerns.map((c, i) => (
            <div key={i} className="text-[12px]">
              <span className="font-semibold text-ink/80">{c.ingredient}</span>
              <span className={`ml-1.5 rounded px-1.5 py-0.5 text-[10px] ${STYLES[c.severity].chip}`}>
                {STYLES[c.severity].label}
              </span>
              <p className="mt-0.5 text-ink/55">{c.reason}</p>
            </div>
          ))}
          {product.suggestedSwap && (
            <div className="flex items-start gap-1.5 rounded-xl bg-sage/10 px-3 py-2 text-[12px] text-sage-deep">
              <Repeat2 size={13} className="mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold">Try instead:</span> {product.suggestedSwap}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
