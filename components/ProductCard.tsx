/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import MonogramTile from "./MonogramTile";
import type { AnalyzedProduct, Severity } from "../lib/types";

const LABEL: Record<Severity, { text: string; color: string }> = {
  keep: { text: "Keep", color: "text-keep" },
  caution: { text: "Check", color: "text-check" },
  replace: { text: "Replace", color: "text-replace" },
};

const DOT: Record<Severity, string> = {
  keep: "bg-keep",
  caution: "bg-check",
  replace: "bg-replace",
};

export default function ProductCard({
  product,
  saved,
  onToggleSave,
}: {
  product: AnalyzedProduct;
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const l = LABEL[product.status];
  const hasDetail = product.concerns.length > 0 || !!product.suggestedSwap;

  return (
    <article className="animate-rise border-b hairline py-5">
      <div className="flex gap-4">
        <MonogramTile brand={product.brand} name={product.name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${DOT[product.status]}`} />
              <span className={`eyebrow ${l.color}`}>{l.text}</span>
              {product.fragranced && <span className="eyebrow text-ash">· Fragranced</span>}
            </div>
            {onToggleSave && (
              <button
                onClick={onToggleSave}
                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                className="text-ink/60 transition active:scale-90"
              >
                <Heart size={17} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
              </button>
            )}
          </div>

          {product.brand && <p className="mt-2 eyebrow text-ink">{product.brand}</p>}
          <h3 className="mt-1 font-display text-[17px] leading-snug text-ink">{product.name}</h3>
          <p className="mt-1.5 text-[13px] leading-snug text-ash">{product.summary}</p>

          {hasDetail && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="mt-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-ink/70"
            >
              <Plus size={12} className={`transition ${open ? "rotate-45" : ""}`} />
              {open ? "Hide details" : "Why"}
            </button>
          )}

          {open && hasDetail && (
            <div className="mt-3 space-y-3 animate-fade">
              {product.concerns.map((c, i) => (
                <div key={i}>
                  <p className="text-[13px] font-medium text-ink">
                    {c.ingredient}
                    <span className={`ml-2 eyebrow ${LABEL[c.severity].color}`}>
                      {LABEL[c.severity].text}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-ash">{c.reason}</p>
                </div>
              ))}
              {product.suggestedSwap && (
                <div className="border-l-2 border-ink/15 pl-3">
                  <p className="eyebrow text-ink/60">Consider instead</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink/80">{product.suggestedSwap}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
